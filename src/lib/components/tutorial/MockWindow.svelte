<script lang="ts">
  import type { Snippet } from "svelte";

  // Generic chrome wrapper for any mockup. The "title bar" is just three dots
  // and an optional label so the reader pattern-matches "this is a window".
  let { label, children }: { label?: string; children: Snippet } = $props();
</script>

<figure
  class="border-foreground/15 bg-background overflow-hidden border shadow-sm"
  role="presentation"
>
  <div
    class="border-foreground/10 bg-muted/30 flex items-center gap-2 border-b px-3 py-2"
    aria-hidden="true"
  >
    <span class="bg-foreground/20 size-2 rounded-full"></span>
    <span class="bg-foreground/20 size-2 rounded-full"></span>
    <span class="bg-foreground/20 size-2 rounded-full"></span>
    {#if label}
      <span class="text-muted-foreground/80 ml-2 font-mono text-[10px] tracking-wide">
        {label}
      </span>
    {/if}
  </div>
  <div>{@render children()}</div>
</figure>
