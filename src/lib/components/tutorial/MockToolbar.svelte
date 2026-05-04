<script lang="ts">
  import type { Snippet } from "svelte";

  // Generic horizontal strip with chip-style buttons. Used for the
  // contextual bar mockup. Children render the buttons.
  let { children }: { children: Snippet } = $props();
</script>

<div
  class="border-foreground/15 bg-muted/30 flex h-10 items-center gap-1 overflow-x-auto border px-3 py-1"
  role="presentation"
>
  {@render children()}
</div>
