<script lang="ts">
  let { content, separator = "," }: { content: string; separator?: string } = $props();

  /**
   * Tiny CSV parser. Handles quoted fields and escaped quotes ("").
   * Not bulletproof but enough for printable previews. For perf-critical
   * use, swap for papaparse.
   */
  function parseCsv(input: string, sep: string): string[][] {
    const rows: string[][] = [];
    let row: string[] = [];
    let cell = "";
    let inQuotes = false;
    for (let i = 0; i < input.length; i++) {
      const ch = input[i];
      if (inQuotes) {
        if (ch === '"' && input[i + 1] === '"') {
          cell += '"';
          i++;
        } else if (ch === '"') {
          inQuotes = false;
        } else {
          cell += ch;
        }
      } else {
        if (ch === '"') {
          inQuotes = true;
        } else if (ch === sep) {
          row.push(cell);
          cell = "";
        } else if (ch === "\n") {
          row.push(cell);
          rows.push(row);
          row = [];
          cell = "";
        } else if (ch === "\r") {
          // Skip CR; LF follows.
        } else {
          cell += ch;
        }
      }
    }
    // Flush
    if (cell.length > 0 || row.length > 0) {
      row.push(cell);
      rows.push(row);
    }
    return rows;
  }

  let parsed = $derived(parseCsv(content, separator));
  let header = $derived(parsed[0] ?? []);
  let body = $derived(parsed.slice(1));
</script>

<div class="overflow-x-auto">
  <table class="w-full border-collapse text-sm">
    {#if header.length > 0}
      <thead>
        <tr>
          {#each header as cell, i (i)}
            <th
              class="border-border/60 bg-muted/40 text-foreground border px-2 py-1.5 text-left text-xs font-medium"
            >
              {cell}
            </th>
          {/each}
        </tr>
      </thead>
    {/if}
    <tbody>
      {#each body as row, i (i)}
        <tr class={i % 2 === 0 ? "" : "bg-muted/20"}>
          {#each row as cell, j (j)}
            <td class="border-border/60 border px-2 py-1 align-top text-xs">{cell}</td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
</div>
