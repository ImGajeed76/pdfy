<script lang="ts">
  import { editor } from "$lib/editor/state.svelte";
  let { label }: { label: string } = $props();
</script>

<div
  class="group-divider mb-4 flex items-center gap-3 print:m-0 print:py-6 {editor.settings
    .showGroupDividers
    ? 'print:break-before-page'
    : ''}"
>
  <span class="bg-border h-px flex-1"></span>
  <span class="text-muted-foreground font-mono text-[10px] tracking-wider uppercase">
    {label}
  </span>
  <span class="bg-border h-px flex-1"></span>
</div>
