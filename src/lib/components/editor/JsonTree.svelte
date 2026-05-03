<script lang="ts">
  import ChevronRight from "@lucide/svelte/icons/chevron-right";
  import JsonTree from "./JsonTree.svelte";

  let {
    value,
    keyName = null,
    depth = 0,
    initiallyOpen = true,
  }: {
    value: unknown;
    keyName?: string | null;
    depth?: number;
    initiallyOpen?: boolean;
  } = $props();

  // svelte-ignore state_referenced_locally
  let open = $state(initiallyOpen && depth < 3);

  function typeOf(v: unknown): "object" | "array" | "string" | "number" | "boolean" | "null" {
    if (v === null) return "null";
    if (Array.isArray(v)) return "array";
    return typeof v as "object" | "string" | "number" | "boolean";
  }

  let kind = $derived(typeOf(value));
  let isExpandable = $derived(kind === "object" || kind === "array");

  let summary = $derived.by(() => {
    if (kind === "object") {
      const len = Object.keys(value as object).length;
      return `{${len === 1 ? "1 key" : `${len} keys`}}`;
    }
    if (kind === "array") {
      const len = (value as unknown[]).length;
      return `[${len === 1 ? "1 item" : `${len} items`}]`;
    }
    return "";
  });

  function format(v: unknown): string {
    if (v === null) return "null";
    if (typeof v === "string") return JSON.stringify(v);
    return String(v);
  }

  let valueClass = $derived(
    kind === "string"
      ? "text-emerald-700"
      : kind === "number"
        ? "text-amber-700"
        : kind === "boolean"
          ? "text-purple-700"
          : kind === "null"
            ? "text-muted-foreground italic"
            : "",
  );
</script>

<div class="json-tree font-mono text-[12px] leading-snug" style="padding-left: {depth * 12}px">
  {#if isExpandable}
    <div
      class="hover:bg-muted/40 -mx-1 flex cursor-pointer items-center gap-1.5 rounded-sm px-1"
      role="button"
      tabindex="0"
      onclick={() => (open = !open)}
      onkeydown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open = !open;
        }
      }}
    >
      <ChevronRight
        class="text-muted-foreground/60 size-3 transition-transform {open ? 'rotate-90' : ''}"
      />
      {#if keyName !== null}
        <span class="text-muted-foreground">{JSON.stringify(keyName)}:</span>
      {/if}
      <span class="text-muted-foreground/70">{summary}</span>
    </div>
    {#if open}
      {#if kind === "object"}
        {#each Object.entries(value as Record<string, unknown>) as [k, v] (k)}
          <JsonTree value={v} keyName={k} depth={depth + 1} initiallyOpen={depth < 2} />
        {/each}
      {:else}
        {#each value as unknown[] as v, i (i)}
          <JsonTree value={v} keyName={String(i)} depth={depth + 1} initiallyOpen={depth < 2} />
        {/each}
      {/if}
    {/if}
  {:else}
    <div class="-mx-1 px-1">
      {#if keyName !== null}
        <span class="text-muted-foreground">{JSON.stringify(keyName)}:</span>
      {/if}
      <span class={valueClass}>{format(value)}</span>
    </div>
  {/if}
</div>
