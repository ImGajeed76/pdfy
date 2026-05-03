<script lang="ts">
  import { shikiLangForExtension } from "$lib/editor/shiki";
  import CellCode from "./CellCode.svelte";
  import MarkdownIt from "markdown-it";
  // @ts-expect-error -- no types ship with markdown-it-katex
  import katexPlugin from "markdown-it-katex";

  let { source }: { source: string } = $props();

  const md = new MarkdownIt({ html: false, linkify: true, breaks: false });
  md.use(katexPlugin, { throwOnError: false });

  /**
   * Jupyter notebook structure:
   * - cells[]: { cell_type: "code" | "markdown" | "raw", source: string | string[], outputs: [...] }
   * - outputs[]: { output_type: "stream" | "execute_result" | "display_data" | "error", text/data: { ... } }
   */
  interface NotebookCell {
    cell_type: "code" | "markdown" | "raw";
    source: string | string[];
    execution_count?: number | null;
    outputs?: NotebookOutput[];
    metadata?: { language?: string };
  }
  interface NotebookOutput {
    output_type: "stream" | "execute_result" | "display_data" | "error";
    text?: string | string[];
    data?: Record<string, string | string[]>;
    name?: string;
    ename?: string;
    evalue?: string;
    traceback?: string[];
    execution_count?: number | null;
  }
  interface Notebook {
    cells: NotebookCell[];
    metadata?: { kernelspec?: { language?: string }; language_info?: { name?: string } };
  }

  function parse(s: string): Notebook | null {
    try {
      const o = JSON.parse(s) as Notebook;
      if (!Array.isArray(o.cells)) return null;
      return o;
    } catch {
      return null;
    }
  }

  function asString(s: string | string[]): string {
    return Array.isArray(s) ? s.join("") : s;
  }

  let nb = $derived(parse(source));
  let codeLang = $derived(
    shikiLangForExtension(
      nb?.metadata?.kernelspec?.language ?? nb?.metadata?.language_info?.name ?? "py",
    ),
  );

  function strip(s: string): string {
    // Strip ANSI escape sequences from notebook stream output.
    // eslint-disable-next-line no-control-regex
    return s.replace(/\[[0-9;]*m/g, "");
  }
</script>

{#if !nb}
  <p class="text-destructive py-2 text-xs">Could not parse notebook JSON.</p>
{:else}
  <div class="notebook flex flex-col gap-4">
    {#each nb.cells as cell, i (i)}
      {@const src = asString(cell.source)}
      <div class="notebook-cell border-border/40 border-l-2 pl-3">
        {#if cell.cell_type === "markdown"}
          <article class="markdown-body prose prose-sm max-w-none">
            <!-- eslint-disable-next-line svelte/no-at-html-tags -- markdown-it output, html: false -->
            {@html md.render(src)}
          </article>
        {:else if cell.cell_type === "code"}
          <div class="text-muted-foreground/70 mb-1 font-mono text-[10px] tabular-nums">
            In [{cell.execution_count ?? " "}]
          </div>
          <CellCode code={src} lang={codeLang} />

          {#if cell.outputs && cell.outputs.length > 0}
            <div class="notebook-outputs mt-2 flex flex-col gap-2">
              {#each cell.outputs as out, j (j)}
                {#if out.output_type === "stream" && out.text}
                  <pre
                    class="bg-muted/40 overflow-x-auto p-2 font-mono text-[11px] whitespace-pre-wrap">{strip(
                      asString(out.text),
                    )}</pre>
                {:else if out.output_type === "error"}
                  <pre
                    class="text-destructive bg-destructive/5 overflow-x-auto p-2 font-mono text-[11px] whitespace-pre-wrap">{out.ename}: {out.evalue}{out.traceback
                      ? "\n" + strip(out.traceback.join("\n"))
                      : ""}</pre>
                {:else if out.data}
                  {#if out.data["image/png"]}
                    <img
                      src={`data:image/png;base64,${asString(out.data["image/png"])}`}
                      alt="output"
                      class="max-w-full"
                    />
                  {:else if out.data["image/jpeg"]}
                    <img
                      src={`data:image/jpeg;base64,${asString(out.data["image/jpeg"])}`}
                      alt="output"
                      class="max-w-full"
                    />
                  {:else if out.data["image/svg+xml"]}
                    <!-- eslint-disable-next-line svelte/no-at-html-tags -- notebook author's own SVG -->
                    {@html asString(out.data["image/svg+xml"])}
                  {:else if out.data["text/html"]}
                    <div class="overflow-auto">
                      <!-- eslint-disable-next-line svelte/no-at-html-tags -- notebook author's own HTML -->
                      {@html asString(out.data["text/html"])}
                    </div>
                  {:else if out.data["text/plain"]}
                    <pre
                      class="bg-muted/40 overflow-x-auto p-2 font-mono text-[11px] whitespace-pre-wrap">{strip(
                        asString(out.data["text/plain"]),
                      )}</pre>
                  {/if}
                {/if}
              {/each}
            </div>
          {/if}
        {:else}
          <pre
            class="bg-muted/40 overflow-x-auto p-2 font-mono text-[11px] whitespace-pre-wrap">{src}</pre>
        {/if}
      </div>
    {/each}
  </div>
{/if}
