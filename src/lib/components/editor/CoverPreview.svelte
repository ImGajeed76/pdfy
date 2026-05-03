<script lang="ts">
  import type { IndexEntry } from "$lib/editor/types";
  import { editor } from "$lib/editor/state.svelte";
  import { promptText } from "$lib/editor/prompt.svelte";
  import SheetChrome from "./SheetChrome.svelte";

  let {
    entry,
    startPage,
    totalPages,
    sectionIndex,
    totalSections,
  }: {
    entry: Extract<IndexEntry, { kind: "cover" }>;
    startPage: number;
    totalPages: number;
    sectionIndex: number;
    totalSections: number;
  } = $props();

  let pageOffset = $derived(editor.projectSettings.headerFooter.pageNumberStart - 1);
  let context = $derived({
    entry: entry as IndexEntry,
    pageWithinEntry: 1,
    globalPage: startPage + 1 + pageOffset,
    totalPages: totalPages + pageOffset,
    sectionIndex,
    totalSections,
    projectName: editor.rootName ?? "",
  });

  async function handleEditTitle(): Promise<void> {
    const next = await promptText({
      title: "Cover title",
      label: "Title",
      value: entry.title,
      placeholder: editor.rootName ?? "PDFy Project",
    });
    if (next === null) return;
    editor.updateEntry(entry.id, { title: next.trim() || (editor.rootName ?? "PDFy Project") });
  }

  async function handleEditSubtitle(): Promise<void> {
    const next = await promptText({
      title: "Subtitle",
      description: "Optional. Leave empty to remove.",
      label: "Subtitle",
      value: entry.subtitle ?? "",
      placeholder: "e.g. Source code submission",
    });
    if (next === null) return;
    editor.updateEntry(entry.id, { subtitle: next.trim() || null });
  }

  function fmtDate(): string {
    const d = entry.date ? new Date(entry.date + "T00:00:00") : new Date();
    return d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
  }
</script>

<section
  id={`entry-${entry.id}`}
  class="preview-section cover-page print:m-0 print:border-0"
  data-entry-id={entry.id}
  data-first-of-entry="true"
>
  <SheetChrome placement="header" contextInput={context} />
  <div class="cover-body flex flex-col items-center justify-center gap-4 p-12 text-center">
    <button
      type="button"
      class="hover:text-primary cursor-text rounded text-4xl font-semibold tracking-tight transition-colors sm:text-5xl print:cursor-default print:text-6xl print:hover:text-current"
      onclick={handleEditTitle}
      title="Click to edit title"
    >
      {entry.title}
    </button>
    {#if entry.subtitle}
      <button
        type="button"
        class="text-muted-foreground hover:text-primary cursor-text rounded text-lg transition-colors print:cursor-default print:hover:text-current"
        onclick={handleEditSubtitle}
        title="Click to edit subtitle"
      >
        {entry.subtitle}
      </button>
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
      <p class="text-muted-foreground/80 mt-8 font-mono text-sm">{fmtDate()}</p>
    {/if}
  </div>
  <SheetChrome placement="footer" contextInput={context} />
</section>
