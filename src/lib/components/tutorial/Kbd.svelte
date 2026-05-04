<script lang="ts">
  // Visual <kbd> styled to match the site. Wraps a single key label.
  let { children }: { children: import("svelte").Snippet } = $props();
</script>

<kbd
  class="border-foreground/20 bg-muted/40 text-foreground inline-flex min-w-[1.5em] items-center justify-center rounded-sm border px-1.5 py-0.5 font-mono text-[11px] leading-none shadow-[0_1px_0_var(--border)]"
>
  {@render children()}
</kbd>
