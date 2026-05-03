<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import * as Resizable from "$lib/components/ui/resizable";
  import { editor, scheduleAutosave, flushAutosave } from "$lib/editor/state.svelte";
  import { applyPageSize } from "$lib/editor/print";
  import BrandBar from "$lib/components/editor/BrandBar.svelte";
  import ContextualBar from "$lib/components/editor/ContextualBar.svelte";
  import Tree from "$lib/components/editor/Tree.svelte";
  import IndexPane from "$lib/components/editor/Index.svelte";
  import Preview from "$lib/components/editor/Preview.svelte";
  import EditorEmpty from "$lib/components/editor/EditorEmpty.svelte";
  import SettingsSheet from "$lib/components/editor/SettingsSheet.svelte";
  import RecentSheet from "$lib/components/editor/RecentSheet.svelte";
  import HeaderFooterSheet from "$lib/components/editor/HeaderFooterSheet.svelte";
  import PromptHost from "$lib/components/editor/PromptHost.svelte";

  // Browser-support gate: bounce unsupported browsers to /unsupported.
  onMount(() => {
    if (!("showDirectoryPicker" in window)) {
      goto("/unsupported", { replaceState: true });
    }
  });

  // Apply page size for print.
  $effect(() => {
    applyPageSize(editor.settings.pageSize);
    document.documentElement.setAttribute("data-page-size", editor.settings.pageSize);
  });

  // Mirror codeTheme onto <html data-print-theme> so the @media print CSS
  // can switch to a dark page background when the user picks Dark.
  $effect(() => {
    const v = editor.settings.codeTheme === "github-dark" ? "dark" : "light";
    document.documentElement.setAttribute("data-print-theme", v);
  });

  // Autosave per-project state (index + project settings) on every change.
  $effect(() => {
    // Read both to register dependency.
    void editor.index;
    void editor.projectSettings;
    if (editor.rootHandle) scheduleAutosave();
  });

  // Flush any pending autosave when the user navigates away or closes the
  // tab so the last edit isn't lost.
  function onBeforeUnload(): void {
    void flushAutosave();
  }

  // Keyboard shortcuts: Cmd/Ctrl+Z, Cmd/Ctrl+Shift+Z, Cmd/Ctrl+P, Escape
  function onKeydown(e: KeyboardEvent): void {
    if (e.key === "Escape") {
      // Don't clear selection while typing in an input/textarea/contenteditable.
      const t = e.target as HTMLElement | null;
      const tag = t?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (t && (t as HTMLElement).isContentEditable)) {
        return;
      }
      if (editor.selectedIndexIds.size > 0) {
        editor.clearSelection();
      }
      return;
    }
    const meta = e.metaKey || e.ctrlKey;
    if (!meta) return;
    if (e.key === "z" || e.key === "Z") {
      e.preventDefault();
      if (e.shiftKey) editor.redo();
      else editor.undo();
    } else if (e.key === "p" || e.key === "P") {
      // Allow default — browser print is what we want.
    } else if (e.key === "y" || e.key === "Y") {
      e.preventDefault();
      editor.redo();
    }
  }

  let settingsOpen = $state(false);
  let recentOpen = $state(false);
  let headerFooterOpen = $state(false);
  let jumpRequest = $state<string | null>(null);

  function jumpTo(id: string): void {
    jumpRequest = id;
  }

  let title = $derived(editor.rootName ? `${editor.rootName} · PDFy` : "PDFy Editor");
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="robots" content="noindex" />
  <style>
    @media print {
      /* Make backgrounds and theme colors actually print. Without this,
         most browsers strip backgrounds in print to save ink. */
      *,
      *::before,
      *::after {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      /* No browser-injected header/footer (date, URL, page numbers).
         The body padding inside each sheet plays the role of page margin. */
      @page {
        margin: 0;
      }
      html,
      body {
        background: white !important;
        color: black !important;
      }
      /* Dark mode in print: respect the user's preview theme choice. */
      html[data-print-theme="dark"],
      html[data-print-theme="dark"] body {
        background: #161616 !important;
        color: #e7e7e7 !important;
      }
      html[data-print-theme="dark"] .preview-section,
      html[data-print-theme="dark"] .preview-section .preview-body,
      html[data-print-theme="dark"] .preview-section .toc-body,
      html[data-print-theme="dark"] .preview-section .cover-body {
        background: #161616 !important;
        color: #e7e7e7 !important;
      }
      html[data-print-theme="dark"] .pdf-page-wrap canvas {
        filter: invert(1) hue-rotate(180deg);
      }
      .print\:hidden {
        display: none !important;
      }
      .print\:block {
        display: block !important;
      }
      /* Print = preview, 1:1. Each .preview-section is one page; the
         flex centering used on screen is replaced with plain block flow
         so sections fill the printable width instead of shrinking to
         their content. */
      .preview-stack {
        display: block !important;
        padding: 0 !important;
        margin: 0 !important;
        gap: 0 !important;
      }
      .preview-scroll {
        display: block !important;
        height: auto !important;
        overflow: visible !important;
      }
      .preview-section + .preview-section {
        break-before: page;
        page-break-before: always;
      }
      /* Sheets stay full-page-sized in print too — preview = print, 1:1.
         Each section is exactly one page; break-before puts the next
         section on the next physical page. Flex layout is preserved so
         image alignment (align-items, justify-content set inline) keeps
         working in print, not just on screen. */
      .preview-section {
        width: 100% !important;
        max-width: none !important;
        margin: 0 !important;
        border: none !important;
        box-shadow: none !important;
        overflow: hidden !important;
        /* Same flex column as screen so the body grows to fill the page
           and footer chrome sits at the bottom. */
        display: flex !important;
        flex-direction: column !important;
      }
      html[data-page-size="A4"] .preview-section {
        height: 297mm !important;
      }
      html[data-page-size="Letter"] .preview-section {
        height: 11in !important;
      }
      .preview-section .preview-body,
      .preview-section .toc-body,
      .preview-section .cover-body {
        padding: 1.5cm !important;
        overflow: hidden !important;
        flex: 1 1 auto !important;
        min-height: 0 !important;
      }
      .preview-section:has(.sheet-chrome--header) .preview-body,
      .preview-section:has(.sheet-chrome--header) .toc-body,
      .preview-section:has(.sheet-chrome--header) .cover-body {
        padding-top: 0 !important;
      }
      .preview-section:has(.sheet-chrome--footer) .preview-body,
      .preview-section:has(.sheet-chrome--footer) .toc-body,
      .preview-section:has(.sheet-chrome--footer) .cover-body {
        padding-bottom: 0 !important;
      }
      .code-pre {
        /* Wrap long lines instead of clipping or scrolling — print can't
           scroll horizontally and we want preview = print 1:1. */
        white-space: pre-wrap !important;
        overflow-wrap: anywhere !important;
        background: transparent !important;
      }
      /* Hide editor chrome so only Preview prints. The two-Preview
         (one for screen, one for print) approach was racy — both
         instances measured the same entries and overwrote each other's
         page counts in editor.measuredPageCounts. Now there's one
         Preview, mounted always, with the rest of the UI hidden here. */
      .print-hide-chrome {
        display: none !important;
      }
      /* Strip the resizable layout in print: stack vertically so the
         Preview pane uses full width regardless of the screen split. */
      .editor-shell {
        height: auto !important;
        display: block !important;
      }
      .print-pane-group {
        display: block !important;
        height: auto !important;
      }
      .preview-pane {
        flex: none !important;
        width: 100% !important;
        height: auto !important;
        max-width: none !important;
      }
    }
  </style>
</svelte:head>

<svelte:window onkeydown={onKeydown} onbeforeunload={onBeforeUnload} />

<!-- Single editor shell. Surrounding chrome (BrandBar, ContextualBar,
     Tree, IndexPane, sheets) is hidden in print via .print-hide-chrome.
     Preview itself stays mounted in both screen and print so its
     code/PDF page counts measure only once and we don't get duplicate
     numbers racing for the same entry. -->
<div class="bg-background text-foreground editor-shell flex h-screen flex-col">
  <div class="print-hide-chrome contents">
    <BrandBar
      onOpenSettings={() => (settingsOpen = true)}
      onOpenRecent={() => (recentOpen = true)}
      onOpenHeaderFooter={() => (headerFooterOpen = true)}
    />

    {#if editor.rootHandle}
      <ContextualBar />
    {/if}
  </div>

  <div class="min-h-0 flex-1">
    {#if !editor.rootHandle}
      <div class="print-hide-chrome h-full"><EditorEmpty /></div>
    {:else}
      <Resizable.PaneGroup
        direction="horizontal"
        autoSaveId="pdfy-editor-layout"
        class="print-pane-group"
      >
        <Resizable.Pane defaultSize={20} minSize={14} class="print-hide-chrome">
          <Tree />
        </Resizable.Pane>
        <Resizable.Handle class="print-hide-chrome" />
        <Resizable.Pane defaultSize={25} minSize={18} class="print-hide-chrome">
          <IndexPane onJumpTo={jumpTo} />
        </Resizable.Pane>
        <Resizable.Handle class="print-hide-chrome" />
        <Resizable.Pane defaultSize={55} minSize={30} class="preview-pane">
          <Preview bind:jumpRequest />
        </Resizable.Pane>
      </Resizable.PaneGroup>
    {/if}
  </div>

  <div class="print-hide-chrome contents">
    <SettingsSheet bind:open={settingsOpen} />
    <RecentSheet bind:open={recentOpen} />
    <HeaderFooterSheet bind:open={headerFooterOpen} />
    <PromptHost />
  </div>
</div>

<style>
  /* Code block styling — light by default. Dark theme is opt-in via settings.
     Theme classes get applied to body via a $effect below. */
  :global(.code-pre) {
    margin: 0;
    padding: 0;
  }
  :global(.code-pre .code-line) {
    display: block;
    padding: 0;
    min-height: 1em;
    line-height: 1.45;
  }
  :global(.code-pre .code-num) {
    display: inline-block;
    width: 3em;
    padding-right: 0.75em;
    text-align: right;
    color: var(--muted-foreground);
    user-select: none;
    opacity: 0.55;
  }
  :global(.code-pre .code-text) {
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    word-break: break-word;
  }

  /* TOC dotted leaders. */
  :global(.toc-row .toc-leaders) {
    border-bottom: 1px dotted var(--border);
    align-self: end;
    margin-bottom: 0.4em;
  }
</style>
