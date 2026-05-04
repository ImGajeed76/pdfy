<script lang="ts">
  import type { Snippet } from "svelte";

  // Stylized A4-ish paper sheet for showing what a cover / TOC / content
  // page looks like. Children render the page body. Aspect roughly 210:297.
  let { label, children }: { label?: string; children: Snippet } = $props();
</script>

<figure class="border-foreground/15 mx-auto w-full max-w-[260px] space-y-2">
  <div
    class="border-foreground/20 bg-background relative aspect-[210/297] border shadow-md"
    role="presentation"
  >
    <div class="absolute inset-0 p-4">
      {@render children()}
    </div>
  </div>
  {#if label}
    <figcaption class="text-muted-foreground text-center font-mono text-[10px] tracking-wide">
      {label}
    </figcaption>
  {/if}
</figure>
