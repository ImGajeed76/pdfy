<script lang="ts">
  import { editor } from "$lib/editor/state.svelte";
  import PreviewSection from "./PreviewSection.svelte";
  import CoverPreview from "./CoverPreview.svelte";
  import TocPreview from "./TocPreview.svelte";
  import { onMount } from "svelte";

  // Cumulative page-1 for each entry comes from editor.entryStartPages
  // (a Map<entryId, 1-based start page>). PreviewSection takes the
  // 0-based start so we subtract 1.
  let totalPages = $derived(editor.pageEstimate);

  let { jumpRequest = $bindable() }: { jumpRequest: string | null } = $props();

  let scrollRoot: HTMLElement | null = $state(null);

  // External jump-to: scroll to entry when requested.
  $effect(() => {
    if (!jumpRequest || !scrollRoot) return;
    const el = scrollRoot.querySelector(`[data-entry-id="${jumpRequest}"]`);
    if (el && "scrollIntoView" in el) {
      (el as HTMLElement).scrollIntoView({ behavior: "smooth", block: "start" });
    }
    jumpRequest = null;
  });

  // Update which index entry is "current" based on scroll. Uses
  // IntersectionObserver — the topmost intersecting section wins.
  let observer: IntersectionObserver | null = null;
  onMount(() => {
    if (!scrollRoot) return;
    // Plain Map: not reactive state, just internal observer bookkeeping.
    // eslint-disable-next-line svelte/prefer-svelte-reactivity
    const visible = new Map<string, number>();
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = (entry.target as HTMLElement).dataset.entryId;
          if (!id) continue;
          if (entry.isIntersecting) {
            visible.set(id, entry.intersectionRatio);
          } else {
            visible.delete(id);
          }
        }
        if (visible.size === 0) return;
        // Pick the entry with highest ratio that's also earliest in the index.
        const order = new Map(editor.index.map((e, i) => [e.id, i]));
        let bestId: string | null = null;
        let bestRank = Number.POSITIVE_INFINITY;
        for (const [id] of visible) {
          const rank = order.get(id) ?? Number.POSITIVE_INFINITY;
          if (rank < bestRank) {
            bestRank = rank;
            bestId = id;
          }
        }
        if (bestId && editor.currentEntryId !== bestId) {
          editor.currentEntryId = bestId;
        }
      },
      {
        root: scrollRoot,
        threshold: [0, 0.1, 0.5, 1],
        rootMargin: "0px 0px -50% 0px",
      },
    );
    return () => observer?.disconnect();
  });

  $effect(() => {
    if (!scrollRoot || !observer) return;
    const sections = scrollRoot.querySelectorAll<HTMLElement>(".preview-section");
    for (const s of sections) observer.observe(s);
    return () => {
      for (const s of sections) observer?.unobserve(s);
    };
  });
</script>

<div
  bind:this={scrollRoot}
  class="preview-scroll h-full overflow-y-auto {editor.settings.codeTheme === 'github-dark'
    ? 'dark'
    : ''}"
  data-preview-theme={editor.settings.codeTheme === "github-dark" ? "dark" : "light"}
  data-page-size={editor.settings.pageSize}
>
  <div class="preview-stack flex flex-col items-center gap-6 px-4 py-6">
    {#each editor.index as entry, i (entry.id)}
      {#if entry.kind === "cover"}
        <CoverPreview
          {entry}
          startPage={(editor.entryStartPages.get(entry.id) ?? 1) - 1}
          {totalPages}
          sectionIndex={i}
          totalSections={editor.index.length}
        />
      {:else if entry.kind === "toc"}
        <TocPreview
          {entry}
          startPage={(editor.entryStartPages.get(entry.id) ?? 1) - 1}
          {totalPages}
          sectionIndex={i}
          totalSections={editor.index.length}
        />
      {:else}
        <PreviewSection
          {entry}
          startPage={(editor.entryStartPages.get(entry.id) ?? 1) - 1}
          {totalPages}
          sectionIndex={i}
          totalSections={editor.index.length}
        />
      {/if}
    {/each}
  </div>
</div>

<style>
  /* Each entry's <section.preview-section> renders on screen as a paper
     sheet sized to the chosen page size. Width matches the print medium
     (210mm A4 / 8.5in Letter); height grows with content. A faint
     horizontal line is painted every (page height − margins) so users see
     where new pages begin when content overflows a single sheet.
     Wrapped in @media screen so print uses the @page rules instead. */
  @media screen {
    /* Preview pane background: light gray in light mode, neutral dark in
       dark mode. Override the warm theme tokens that .dark would otherwise
       drag in (we want consistent neutral grays, not the orange-tinted
       --background / --card from the global dark palette). */
    :global(.preview-scroll) {
      background: oklch(0.96 0 0);
    }
    :global(.preview-scroll.dark) {
      --background: #1a1a1a;
      --card: #161616;
      --muted: #1f1f1f;
      --muted-foreground: #9a9a9a;
      --foreground: #e7e7e7;
      --border: rgba(255, 255, 255, 0.1);
      background: #1a1a1a;
    }

    /* Each sheet is a fixed-size paper card matching the chosen page size.
       Content that's too tall is split into multiple sheets at render time
       (see PreviewSection's code pagination); content that's too short
       leaves the bottom of the last sheet blank. */
    :global(.preview-scroll[data-page-size="A4"] .preview-section) {
      width: 210mm;
      height: 297mm;
    }
    :global(.preview-scroll[data-page-size="Letter"] .preview-section) {
      width: 8.5in;
      height: 11in;
    }
    :global(.preview-scroll .preview-section) {
      max-width: 100%;
      background: white;
      color: #111;
      box-shadow:
        0 1px 2px rgba(0, 0, 0, 0.06),
        0 4px 14px rgba(0, 0, 0, 0.08);
      margin: 0;
      border: none;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    /* Body fills the rest of the sheet and clips overflowing content. */
    :global(.preview-scroll .preview-section .preview-body),
    :global(.preview-scroll .preview-section .toc-body),
    :global(.preview-scroll .preview-section .cover-body) {
      padding: 1.5cm;
      flex: 1 1 auto;
      min-height: 0;
      overflow: hidden;
    }
    /* When chrome is present, the chrome occupies the page-margin band.
       Body's padding on that side collapses to ~0 so chrome text sits
       right against the body content with no compounding gap. */
    :global(.preview-scroll .preview-section:has(.sheet-chrome--header) .preview-body),
    :global(.preview-scroll .preview-section:has(.sheet-chrome--header) .toc-body),
    :global(.preview-scroll .preview-section:has(.sheet-chrome--header) .cover-body) {
      padding-top: 0;
    }
    :global(.preview-scroll .preview-section:has(.sheet-chrome--footer) .preview-body),
    :global(.preview-scroll .preview-section:has(.sheet-chrome--footer) .toc-body),
    :global(.preview-scroll .preview-section:has(.sheet-chrome--footer) .cover-body) {
      padding-bottom: 0;
    }
    /* Dark preview mode: invert the sheet to a dark page. */
    :global(.preview-scroll[data-preview-theme="dark"] .preview-section) {
      background: #161616;
      color: #e7e7e7;
    }
    /* Code: wrap long lines instead of growing a horizontal scrollbar.
       Each visual wrap line still belongs to the same logical code line,
       so the line number stays on the first visual line. !important
       beats Tailwind's overflow-x-auto utility from the inline class. */
    :global(.preview-scroll .preview-section .code-pre) {
      white-space: pre-wrap !important;
      overflow-wrap: anywhere !important;
      overflow-x: hidden !important;
    }
  }
</style>
