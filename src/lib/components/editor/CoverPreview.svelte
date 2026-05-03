<script lang="ts">
  import type { IndexEntry } from "$lib/editor/types";
  import { editor } from "$lib/editor/state.svelte";
  import { Button } from "$lib/components/ui/button";
  import X from "@lucide/svelte/icons/x";
  import Edit3 from "@lucide/svelte/icons/edit-3";

  let { entry }: { entry: Extract<IndexEntry, { kind: "cover" }> } = $props();

  function handleEdit(): void {
    const next = window.prompt("Cover title:", entry.title);
    if (next === null) return;
    editor.updateEntry(entry.id, { title: next.trim() || (editor.rootName ?? "PDFy Project") });
  }

  function handleEditSubtitle(): void {
    const next = window.prompt("Subtitle (leave empty for none):", entry.subtitle ?? "");
    if (next === null) return;
    editor.updateEntry(entry.id, { subtitle: next.trim() || null });
  }

  const today = new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
</script>

<section
  id={`entry-${entry.id}`}
  class="preview-section cover-page bg-card border-border/60 mb-4 border print:m-0 print:break-after-page print:border-0"
  data-entry-id={entry.id}
>
  <header class="border-border/60 flex items-center gap-2 border-b px-3 py-2 text-sm print:hidden">
    <span class="text-muted-foreground/70 font-mono text-[10px] tabular-nums">COVER</span>
    <span class="text-foreground font-medium">{entry.title}</span>
    <div class="ml-auto flex items-center gap-0.5">
      <Button
        variant="ghost"
        size="sm"
        class="size-7 p-0"
        onclick={handleEdit}
        aria-label="Edit title"
        title="Edit title"
      >
        <Edit3 class="size-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        class="hover:text-destructive size-7 p-0"
        onclick={() => editor.removeEntry(entry.id)}
        aria-label="Remove cover"
        title="Remove cover"
      >
        <X class="size-3.5" />
      </Button>
    </div>
  </header>
  <div
    class="cover-body flex min-h-[60vh] flex-col items-center justify-center gap-4 p-12 text-center print:min-h-[80vh]"
  >
    <h1 class="text-4xl font-semibold tracking-tight sm:text-5xl print:text-6xl">{entry.title}</h1>
    {#if entry.subtitle}
      <p class="text-muted-foreground text-lg">{entry.subtitle}</p>
    {:else}
      <button
        type="button"
        class="text-muted-foreground/60 hover:text-primary text-sm italic transition-colors print:hidden"
        onclick={handleEditSubtitle}
      >
        + Add subtitle
      </button>
    {/if}
    {#if entry.showDate}
      <p class="text-muted-foreground/80 mt-8 font-mono text-sm">{today}</p>
    {/if}
  </div>
</section>
