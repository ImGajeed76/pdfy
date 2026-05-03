<script lang="ts">
  import type { IndexEntry } from "$lib/editor/types";
  import { editor } from "$lib/editor/state.svelte";
  import { Button } from "$lib/components/ui/button";
  import X from "@lucide/svelte/icons/x";

  let { entry }: { entry: Extract<IndexEntry, { kind: "toc" }> } = $props();

  let entries = $derived(editor.fileEntries);
</script>

<section
  id={`entry-${entry.id}`}
  class="preview-section toc-page bg-card border-border/60 mb-4 border print:m-0 print:break-after-page print:border-0"
  data-entry-id={entry.id}
>
  <header class="border-border/60 flex items-center gap-2 border-b px-3 py-2 text-sm print:hidden">
    <span class="text-muted-foreground/70 font-mono text-[10px] tabular-nums">TOC</span>
    <span class="text-foreground font-medium">{entry.title}</span>
    <Button
      variant="ghost"
      size="sm"
      class="hover:text-destructive ml-auto size-7 p-0"
      onclick={() => editor.removeEntry(entry.id)}
      aria-label="Remove TOC"
      title="Remove TOC"
    >
      <X class="size-3.5" />
    </Button>
  </header>
  <div class="p-8 print:p-0">
    <h2 class="mb-6 text-2xl font-semibold tracking-tight">{entry.title}</h2>
    {#if entries.length === 0}
      <p class="text-muted-foreground text-sm italic">
        No files in plan yet, add some to populate the table of contents.
      </p>
    {:else}
      <ul class="text-foreground space-y-2 text-sm">
        {#each entries as e, i (e.id)}
          <li class="toc-row flex items-baseline gap-2">
            <span class="text-muted-foreground/70 w-6 shrink-0 font-mono text-xs tabular-nums">
              {String(i + 1).padStart(2, "0")}
            </span>
            <a
              href={`#entry-${e.id}`}
              class="text-foreground hover:text-primary truncate font-medium underline-offset-2 hover:underline print:no-underline"
            >
              {e.customTitle || e.source.name}
            </a>
            <span class="toc-leaders flex-1"></span>
            <span class="text-muted-foreground/70 font-mono text-[11px]">
              {e.source.path}
            </span>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</section>
