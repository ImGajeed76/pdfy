<script lang="ts">
  import type { Snippet } from "svelte";

  // Stylized side-sheet (Settings, Headers/Footers). A title bar plus a body
  // with stacked rows. Children render rows that the consumer styles however
  // they like.
  let { label, children }: { label: string; children: Snippet } = $props();
</script>

<figure
  class="border-foreground/15 bg-background mx-auto w-full max-w-md border shadow-md"
  role="presentation"
>
  <div class="border-foreground/10 border-b px-4 py-3">
    <p class="text-muted-foreground/80 mb-1 font-mono text-[10px] tracking-wider uppercase">
      Sheet
    </p>
    <p class="text-foreground text-sm font-medium">{label}</p>
  </div>
  <div class="space-y-3 p-4">{@render children()}</div>
</figure>
