<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import * as Resizable from "$lib/components/ui/resizable";
  import { editor, scheduleAutosave } from "$lib/editor/state.svelte";
  import { applyPageSize } from "$lib/editor/print";
  import BrandBar from "$lib/components/editor/BrandBar.svelte";
  import ContextualBar from "$lib/components/editor/ContextualBar.svelte";
  import Tree from "$lib/components/editor/Tree.svelte";
  import IndexPane from "$lib/components/editor/Index.svelte";
  import Preview from "$lib/components/editor/Preview.svelte";
  import EditorEmpty from "$lib/components/editor/EditorEmpty.svelte";
  import SettingsSheet from "$lib/components/editor/SettingsSheet.svelte";
  import RecentSheet from "$lib/components/editor/RecentSheet.svelte";
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
  });

  // Autosave per-project state (index + groups) on every change.
  $effect(() => {
    // Read both to register dependency.
    void editor.index;
    void editor.groups;
    if (editor.projectId) scheduleAutosave();
  });

  // Keyboard shortcuts: Cmd/Ctrl+Z, Cmd/Ctrl+Shift+Z, Cmd/Ctrl+P
  function onKeydown(e: KeyboardEvent): void {
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
      @page {
        margin: 1.5cm;
        @bottom-right {
          content: counter(page) " / " counter(pages);
          font-size: 9pt;
          color: #888;
          font-family: "Geist Variable", system-ui, sans-serif;
        }
      }
      html,
      body {
        background: white !important;
        color: black !important;
      }
      .print\:hidden {
        display: none !important;
      }
      .print\:block {
        display: block !important;
      }
      /* Each preview section starts on a new page in print, except the first.  */
      .preview-section + .preview-section {
        break-before: page;
        page-break-before: always;
      }
      .preview-section {
        margin: 0 !important;
        border: none !important;
        background: transparent !important;
      }
      .preview-section header {
        position: static !important;
        background: transparent !important;
        backdrop-filter: none !important;
        border: none !important;
        padding-left: 0 !important;
        padding-right: 0 !important;
        padding-bottom: 0.5cm !important;
        border-bottom: 1px solid #ddd !important;
        margin-bottom: 0.4cm !important;
      }
      .preview-section .preview-body {
        padding: 0 !important;
      }
      .code-pre {
        white-space: pre-wrap !important;
        word-break: break-word !important;
        background: transparent !important;
        color: #111 !important;
      }
      .cover-page {
        break-after: page;
        page-break-after: always;
      }
      .cover-body {
        min-height: calc(297mm - 3cm) !important;
        justify-content: center !important;
      }
      /* Hide UI chrome on cover/toc when printed */
      .preview-section header.print\:hidden,
      .preview-section header[class*="print:hidden"] {
        display: none !important;
      }
    }
  </style>
</svelte:head>

<svelte:window onkeydown={onKeydown} />

<div class="bg-background text-foreground flex h-screen flex-col print:hidden">
  <BrandBar onOpenSettings={() => (settingsOpen = true)} onOpenRecent={() => (recentOpen = true)} />

  {#if editor.rootHandle}
    <ContextualBar />
  {/if}

  <div class="min-h-0 flex-1">
    {#if !editor.rootHandle}
      <EditorEmpty />
    {:else}
      <Resizable.PaneGroup direction="horizontal" autoSaveId="pdfy-editor-layout">
        <Resizable.Pane defaultSize={20} minSize={14}>
          <Tree />
        </Resizable.Pane>
        <Resizable.Handle />
        <Resizable.Pane defaultSize={25} minSize={18}>
          <IndexPane onJumpTo={jumpTo} />
        </Resizable.Pane>
        <Resizable.Handle />
        <Resizable.Pane defaultSize={55} minSize={30}>
          <Preview bind:jumpRequest />
        </Resizable.Pane>
      </Resizable.PaneGroup>
    {/if}
  </div>

  <SettingsSheet bind:open={settingsOpen} />
  <RecentSheet bind:open={recentOpen} />
  <PromptHost />
</div>

<!-- Print-only: full document -->
<div class="hidden print:block" aria-hidden="true">
  <Preview bind:jumpRequest />
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
    white-space: pre;
  }

  /* Markdown rendered tweaks. */
  :global(.markdown-body h1),
  :global(.markdown-body h2),
  :global(.markdown-body h3),
  :global(.markdown-body h4) {
    margin-top: 1em;
    margin-bottom: 0.5em;
    font-weight: 600;
  }
  :global(.markdown-body p) {
    margin-bottom: 0.75em;
  }
  :global(.markdown-body pre) {
    background: var(--muted);
    padding: 0.75rem;
    overflow-x: auto;
    font-size: 0.875em;
    margin-bottom: 0.75em;
  }
  :global(.markdown-body code) {
    font-family: var(--font-mono, ui-monospace, monospace);
    background: var(--muted);
    padding: 0.1em 0.3em;
    font-size: 0.875em;
  }
  :global(.markdown-body pre code) {
    padding: 0;
    background: transparent;
  }
  :global(.markdown-body ul),
  :global(.markdown-body ol) {
    margin-left: 1.5em;
    margin-bottom: 0.75em;
  }
  :global(.markdown-body li) {
    margin-bottom: 0.25em;
  }
  :global(.markdown-body a) {
    color: var(--primary);
    text-decoration: underline;
    text-underline-offset: 2px;
  }
  :global(.markdown-body blockquote) {
    border-left: 3px solid var(--border);
    padding-left: 1em;
    color: var(--muted-foreground);
    margin-bottom: 0.75em;
  }
  :global(.html-rendered) {
    overflow: auto;
  }

  /* TOC dotted leaders. */
  :global(.toc-row .toc-leaders) {
    border-bottom: 1px dotted var(--border);
    align-self: end;
    margin-bottom: 0.4em;
  }
</style>
