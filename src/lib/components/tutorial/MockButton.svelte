<script lang="ts">
  // Chip-style mock button for use inside MockToolbar / inline in prose.
  // Just visual; never interactive.
  let { label, icon }: { label: string; icon?: string } = $props();
</script>

<span
  class="bg-background border-foreground/15 text-foreground inline-flex h-7 items-center gap-1.5 border px-2 text-xs"
  role="presentation"
>
  {#if icon}
    <span class="text-muted-foreground/70 font-mono text-[10px]">{icon}</span>
  {/if}
  {label}
</span>
