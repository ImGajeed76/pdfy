<script lang="ts">
  import type { IndexEntry } from "$lib/editor/types";
  import { editor } from "$lib/editor/state.svelte";
  import { buildTemplateContext, renderTemplate } from "$lib/editor/template";
  import { promptText } from "$lib/editor/prompt.svelte";
  import SheetChrome from "./SheetChrome.svelte";

  let {
    entry,
    startPage,
    totalPages,
    sectionIndex,
    totalSections,
  }: {
    entry: Extract<IndexEntry, { kind: "toc" }>;
    startPage: number;
    totalPages: number;
    sectionIndex: number;
    totalSections: number;
  } = $props();

  let entries = $derived(editor.fileEntries);
  let toc = $derived(editor.projectSettings.toc);
  let pageOffset = $derived(editor.projectSettings.headerFooter.pageNumberStart - 1);

  // Rows-per-sheet: must match the page-count estimator in estimates.ts
  // (`Math.ceil(fileEntryCount / 35)`). The first sheet has the heading
  // (and optional subtitle) so it fits fewer rows; later sheets are
  // denser. Keeping it simple: 28 on page 1, 35 on subsequent pages.
  const ROWS_FIRST_PAGE = 28;
  const ROWS_LATER_PAGE = 35;

  // Split file entries into the per-sheet chunks we want to render.
  let pages = $derived.by(() => {
    if (entries.length === 0) return [[] as IndexEntry[]];
    const out: IndexEntry[][] = [];
    let i = 0;
    out.push(entries.slice(i, i + ROWS_FIRST_PAGE));
    i += ROWS_FIRST_PAGE;
    while (i < entries.length) {
      out.push(entries.slice(i, i + ROWS_LATER_PAGE));
      i += ROWS_LATER_PAGE;
    }
    return out;
  });

  function contextFor(pageWithinEntry: number): {
    entry: IndexEntry;
    pageWithinEntry: number;
    globalPage: number;
    totalPages: number;
    sectionIndex: number;
    totalSections: number;
    projectName: string;
  } {
    return {
      entry: entry as IndexEntry,
      pageWithinEntry,
      globalPage: startPage + pageWithinEntry + pageOffset,
      totalPages: totalPages + pageOffset,
      sectionIndex,
      totalSections,
      projectName: editor.rootName ?? "",
    };
  }

  async function handleEditTitle(): Promise<void> {
    const next = await promptText({
      title: "TOC heading",
      label: "Heading",
      value: entry.title,
      placeholder: "Contents",
    });
    if (next === null) return;
    editor.updateEntry(entry.id, { title: next.trim() || "Contents" });
  }

  async function handleEditSubtitle(): Promise<void> {
    const next = await promptText({
      title: "TOC subtitle",
      description: "Optional. Leave empty to remove.",
      label: "Subtitle",
      value: entry.subtitle ?? "",
      placeholder: "e.g. Files in this submission",
    });
    if (next === null) return;
    editor.updateEntry(entry.id, { subtitle: next.trim() || null });
  }

  // Per-row context: pretend each file entry is the current entry, with
  // its real start page. Lets users put {{path}}, {{title}}, {{page}}
  // etc. in the row templates. `globalRowIndex` is the file's position in
  // the overall file list — what `{{section}}` should reflect — not its
  // index within a single TOC page.
  function rowContextFor(
    fileEntry: IndexEntry,
    globalRowIndex: number,
  ): ReturnType<typeof buildTemplateContext> {
    const pageStart = (editor.entryStartPages.get(fileEntry.id) ?? 1) + pageOffset;
    return buildTemplateContext({
      entry: fileEntry,
      pageWithinEntry: 1,
      globalPage: pageStart,
      totalPages: totalPages + pageOffset,
      sectionIndex: globalRowIndex,
      totalSections: entries.length,
      projectName: editor.rootName ?? "",
    });
  }
</script>

{#each pages as pageRows, pageIdx (pageIdx)}
  {@const isFirstPage = pageIdx === 0}
  {@const isLastPage = pageIdx === pages.length - 1}
  {@const pageContext = contextFor(pageIdx + 1)}
  {@const baseRowOffset = isFirstPage ? 0 : ROWS_FIRST_PAGE + (pageIdx - 1) * ROWS_LATER_PAGE}
  <section
    id={isFirstPage ? `entry-${entry.id}` : `entry-${entry.id}-page-${pageIdx + 1}`}
    class="preview-section toc-page print:m-0 print:border-0"
    data-entry-id={entry.id}
    data-first-of-entry={isFirstPage ? "true" : undefined}
    data-last-of-entry={isLastPage ? "true" : undefined}
  >
    <SheetChrome placement="header" contextInput={pageContext} />
    <div class="toc-body p-8">
      {#if isFirstPage}
        <button
          type="button"
          class="hover:text-primary mb-1 cursor-text rounded text-left text-2xl font-semibold tracking-tight transition-colors print:cursor-default print:hover:text-current"
          onclick={handleEditTitle}
          title="Click to edit heading"
        >
          {entry.title}
        </button>
        {#if entry.subtitle}
          <button
            type="button"
            class="text-muted-foreground hover:text-primary mb-6 block cursor-text rounded text-left text-base transition-colors print:cursor-default print:hover:text-current"
            onclick={handleEditSubtitle}
            title="Click to edit subtitle"
          >
            {entry.subtitle}
          </button>
        {:else}
          <button
            type="button"
            class="text-muted-foreground/60 hover:text-primary mb-6 block text-xs italic transition-colors print:hidden"
            onclick={handleEditSubtitle}
          >
            + Add subtitle
          </button>
        {/if}
      {/if}
      {#if entries.length === 0}
        <p class="text-muted-foreground text-sm italic">
          No files in plan yet, add some to populate the table of contents.
        </p>
      {:else}
        <ul class="space-y-2 text-sm">
          {#each pageRows as e, i (e.id)}
            {@const ctx = rowContextFor(e, baseRowOffset + i)}
            {@const leftText = renderTemplate(toc.rowLeft, ctx)}
            {@const centerText = renderTemplate(toc.rowCenter, ctx)}
            {@const rightText = renderTemplate(toc.rowRight, ctx)}
            <li class="toc-row flex items-baseline gap-2">
              <a
                href={`#entry-${e.id}`}
                class="hover:text-primary contents font-medium underline-offset-2 hover:underline print:no-underline"
              >
                {#if leftText}
                  <span class="text-muted-foreground/70 shrink-0 font-mono text-xs tabular-nums">
                    {leftText}
                  </span>
                {/if}
                {#if centerText}
                  <span class="truncate">{centerText}</span>
                {/if}
                <span class="toc-leaders flex-1"></span>
                {#if rightText}
                  <span class="text-muted-foreground/90 shrink-0 font-mono text-xs tabular-nums">
                    {rightText}
                  </span>
                {/if}
              </a>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
    <SheetChrome placement="footer" contextInput={pageContext} />
  </section>
{/each}
