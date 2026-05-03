<script lang="ts">
  import type { IndexEntry } from "$lib/editor/types";
  import { editor } from "$lib/editor/state.svelte";
  import { determineFileDisplayProperties } from "$lib/fileSystem";
  import { highlightWithShiki, shikiLangForExtension, type ShikiLine } from "$lib/editor/shiki";
  import { escapeHtml } from "$lib/editor/shiki";
  import SheetChrome from "./SheetChrome.svelte";

  let {
    entry,
    startPage,
    totalPages,
    sectionIndex,
    totalSections,
  }: {
    entry: Extract<IndexEntry, { kind: "file" }>;
    startPage: number;
    totalPages: number;
    sectionIndex: number;
    totalSections: number;
  } = $props();

  let pageOffset = $derived(editor.projectSettings.headerFooter.pageNumberStart - 1);
  function ctxFor(pageWithinEntry: number): {
    entry: typeof entry;
    pageWithinEntry: number;
    globalPage: number;
    totalPages: number;
    sectionIndex: number;
    totalSections: number;
    projectName: string;
  } {
    return {
      entry,
      pageWithinEntry,
      globalPage: startPage + pageWithinEntry + pageOffset,
      totalPages: totalPages + pageOffset,
      sectionIndex,
      totalSections,
      projectName: editor.rootName ?? "",
    };
  }

  let extension = $derived(entry.source.name.split(".").pop()?.toLowerCase());
  let shikiLang = $derived(shikiLangForExtension(extension));
  let fileType = $derived(determineFileDisplayProperties(entry.source.name).fileType);
  let showLineNumbers = $derived(editor.effectiveShowLineNumbers(entry));

  let content = $state<string | null>(null);

  $effect(() => {
    const file = entry.source;
    let cancelled = false;
    editor
      .ensureContent(file)
      .then((c) => {
        if (!cancelled) content = c;
      })
      .catch(() => {
        if (!cancelled) content = "(Could not read file)";
      });
    return () => {
      cancelled = true;
    };
  });

  // Shiki is async; before it finishes we still want to lay out the code
  // page correctly so the user never sees an empty sheet. Pre-populate
  // `lines` from the raw content (escaped, no highlighting) immediately
  // and upgrade to highlighted output once shiki returns.
  let lines = $state<ShikiLine[]>([]);
  $effect(() => {
    if (content === null || fileType === "graphic" || fileType === "binary") {
      lines = [];
      return;
    }
    const plain = content.split("\n");
    lines = plain.map((text, i) => ({ number: i + 1, html: escapeHtml(text) }));
    let cancelled = false;
    highlightWithShiki(content, shikiLang, editor.settings.codeTheme).then((result) => {
      if (!cancelled && result.length > 0) lines = result;
    });
    return () => {
      cancelled = true;
    };
  });

  let isImage = $derived(fileType === "graphic");
  let isBinary = $derived(fileType === "binary");
  let isPdf = $derived(extension === "pdf");
  // Everything else is text — even .json / .csv / .ipynb / .html / .md /
  // .xml. They all show as their raw source with shiki highlighting.
  let isCodeView = $derived(!isImage && !isBinary && !isPdf);

  // Image objectURL handling.
  let imageUrl = $state<string | null>(null);
  $effect(() => {
    if (!isImage) {
      imageUrl = null;
      return;
    }
    let url: string | null = null;
    let cancelled = false;
    (async () => {
      const file = await entry.source.handle.getFile();
      if (cancelled) return;
      url = URL.createObjectURL(file);
      imageUrl = url;
    })().catch(() => {});
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  });

  let imageWidth = $derived(entry.imageWidth ?? editor.settings.defaultImageWidth);
  let imageAlign = $derived(entry.imageAlign ?? editor.settings.defaultImageAlign);
  let imageVerticalAlign = $derived(
    entry.imageVerticalAlign ?? editor.settings.defaultImageVerticalAlign,
  );

  function justifyFor(a: "left" | "center" | "right"): string {
    return a === "left" ? "flex-start" : a === "right" ? "flex-end" : "center";
  }
  function alignFor(a: "top" | "center" | "bottom"): string {
    return a === "top" ? "flex-start" : a === "bottom" ? "flex-end" : "center";
  }

  // ── Pagination for code/text (wrap-aware, visual-line-based) ─────────
  // Each logical line may wrap to N visual rows when its character count
  // exceeds the sheet's text column width. Pack logical lines into sheets
  // by summing their visual-row counts until the next would push past
  // the budget. Wrapped continuations consume page space but don't get
  // their own line number.
  const PT_TO_PX = 4 / 3;
  const CM_TO_PX = 96 / 2.54;
  const MM_TO_PX = CM_TO_PX / 10;
  const IN_TO_PX = 96;
  const MARGIN_PX = 1.5 * CM_TO_PX;
  const CODE_LINE_HEIGHT = 1.45;
  const MONO_CHAR_WIDTH = 0.62;
  const LINE_NUM_EM = 3;

  function visualLinesPerPage(s: "A4" | "Letter", fontSizePt: number): number {
    const sheetH = s === "A4" ? 297 * MM_TO_PX : 11 * IN_TO_PX;
    const contentH = sheetH - 2 * MARGIN_PX;
    const lineH = fontSizePt * PT_TO_PX * CODE_LINE_HEIGHT;
    return Math.max(1, Math.floor(contentH / lineH));
  }

  function charsPerLine(s: "A4" | "Letter", fontSizePt: number, hasLineNumbers: boolean): number {
    const sheetW = s === "A4" ? 210 * MM_TO_PX : 8.5 * IN_TO_PX;
    const contentW = sheetW - 2 * MARGIN_PX;
    const fontPx = fontSizePt * PT_TO_PX;
    const numW = hasLineNumbers ? LINE_NUM_EM * fontPx : 0;
    const charW = fontPx * MONO_CHAR_WIDTH;
    return Math.max(20, Math.floor((contentW - numW) / charW));
  }

  /** Strip HTML tags + entities so the resulting length matches what the
      user actually sees on screen. */
  function visibleTextLength(html: string): number {
    let stripped = html.replace(/<[^>]*>/g, "");
    stripped = stripped.replace(/&(?:#\d+|#x[\da-f]+|[a-z]+);/gi, " ");
    return stripped.length;
  }

  function visualRowsFor(line: ShikiLine, capacity: number): number {
    const len = visibleTextLength(line.html);
    if (len === 0) return 1;
    return Math.max(1, Math.ceil(len / capacity));
  }

  let pageRowBudget = $derived(
    visualLinesPerPage(editor.settings.pageSize, editor.settings.codeFontSize),
  );
  let lineCharCapacity = $derived(
    charsPerLine(editor.settings.pageSize, editor.settings.codeFontSize, showLineNumbers),
  );

  let codePages = $derived.by<ShikiLine[][]>(() => {
    if (!isCodeView || lines.length === 0) return [];
    const budget = pageRowBudget;
    const charCap = lineCharCapacity;
    const out: ShikiLine[][] = [];
    let current: ShikiLine[] = [];
    let used = 0;
    for (const line of lines) {
      const rows = visualRowsFor(line, charCap);
      if (used + rows > budget && current.length > 0) {
        out.push(current);
        current = [];
        used = 0;
      }
      current.push(line);
      used += rows;
    }
    if (current.length > 0) out.push(current);
    return out;
  });

  // ── PDF page rasterization (one sheet per PDF page) ──────────────────
  type RenderedPdfPage = { num: number; canvas: HTMLCanvasElement };
  let pdfPages = $state<RenderedPdfPage[]>([]);
  let pdfPageCount = $state<number | null>(null);
  let pdfError = $state<string | null>(null);

  $effect(() => {
    if (!isPdf) {
      pdfPages = [];
      pdfPageCount = null;
      pdfError = null;
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        const workerUrl = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
        pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
        const file = await entry.source.handle.getFile();
        const buffer = await file.arrayBuffer();
        const doc = await pdfjs.getDocument({ data: buffer }).promise;
        if (cancelled) return;
        pdfPageCount = doc.numPages;
        for (let i = 1; i <= doc.numPages; i++) {
          if (cancelled) return;
          const page = await doc.getPage(i);
          const viewport = page.getViewport({ scale: 1.5 });
          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) continue;
          await page.render({ canvasContext: ctx, viewport, canvas }).promise;
          if (cancelled) return;
          pdfPages = [...pdfPages, { num: i, canvas }];
        }
      } catch (e) {
        if (cancelled) return;
        pdfError = e instanceof Error ? e.message : "Failed to render PDF";
      }
    })();
    return () => {
      cancelled = true;
    };
  });

  function attachCanvas(node: HTMLElement, canvas: HTMLCanvasElement): { destroy: () => void } {
    node.appendChild(canvas);
    return {
      destroy(): void {
        if (canvas.parentNode === node) node.removeChild(canvas);
      },
    };
  }

  // Publish actual sheet count for this entry so global page numbering
  // ({{pages}} and downstream entries' startPage) uses real numbers.
  $effect(() => {
    if (isCodeView && codePages.length > 0) {
      editor.measuredPageCounts.set(entry.id, codePages.length);
    } else if (isPdf && pdfPageCount !== null && pdfPageCount > 0) {
      editor.measuredPageCounts.set(entry.id, pdfPageCount);
    }
    return () => editor.measuredPageCounts.delete(entry.id);
  });
</script>

{#if isPdf}
  {#if pdfError}
    <section
      id={`entry-${entry.id}`}
      class="preview-section print:m-0 print:border-0"
      data-entry-id={entry.id}
      data-first-of-entry="true"
    >
      <SheetChrome placement="header" contextInput={ctxFor(1)} />
      <div class="preview-body p-6 text-sm">
        <p class="text-destructive py-2 text-xs">PDF render failed: {pdfError}</p>
      </div>
      <SheetChrome placement="footer" contextInput={ctxFor(1)} />
    </section>
  {:else if pdfPageCount === null || pdfPages.length === 0}
    <section
      id={`entry-${entry.id}`}
      class="preview-section print:m-0 print:border-0"
      data-entry-id={entry.id}
      data-first-of-entry="true"
    >
      <SheetChrome placement="header" contextInput={ctxFor(1)} />
      <div class="preview-body p-6 text-sm">
        <p class="text-muted-foreground py-2 text-xs">Loading PDF…</p>
      </div>
      <SheetChrome placement="footer" contextInput={ctxFor(1)} />
    </section>
  {:else}
    {#each pdfPages as page, pageIdx (page.num)}
      <section
        id={pageIdx === 0 ? `entry-${entry.id}` : undefined}
        class="preview-section print:m-0 print:border-0"
        data-entry-id={entry.id}
        data-first-of-entry={pageIdx === 0}
      >
        <SheetChrome placement="header" contextInput={ctxFor(pageIdx + 1)} />
        <div class="preview-body">
          <div
            class="pdf-page-wrap flex h-full w-full items-center justify-center"
            use:attachCanvas={page.canvas}
            aria-label={`Page ${page.num}`}
          ></div>
        </div>
        <SheetChrome placement="footer" contextInput={ctxFor(pageIdx + 1)} />
      </section>
    {/each}
  {/if}
{:else if isCodeView && codePages.length > 0}
  {#each codePages as pageLines, pageIdx (pageIdx)}
    {@const startLineNumber = pageLines[0]?.number ?? 1}
    <section
      id={pageIdx === 0 ? `entry-${entry.id}` : undefined}
      class="preview-section print:m-0 print:border-0"
      data-entry-id={entry.id}
      data-first-of-entry={pageIdx === 0}
    >
      <SheetChrome placement="header" contextInput={ctxFor(pageIdx + 1)} />
      <div class="preview-body p-3 text-sm">
        <!-- eslint-disable svelte/no-at-html-tags -- shiki output, escaped + inline-styled -->
        <pre
          class="code-pre shiki-pre font-mono leading-snug"
          style="font-size: {editor.settings.codeFontSize}pt;"><code
            class="language-{shikiLang}"
            style="counter-reset: line {startLineNumber - 1};"
            >{#each pageLines as line (line.number)}<span class="code-line"
                >{#if showLineNumbers}<span class="code-num">{line.number}</span>{/if}<span
                  class="code-text">{@html line.html}</span
                ></span
              >{/each}</code
          ></pre>
        <!-- eslint-enable svelte/no-at-html-tags -->
      </div>
      <SheetChrome placement="footer" contextInput={ctxFor(pageIdx + 1)} />
    </section>
  {/each}
{:else}
  <!-- image / binary / loading placeholder. One sheet, content centered. -->
  <section
    id={`entry-${entry.id}`}
    class="preview-section print:m-0 print:border-0"
    data-entry-id={entry.id}
    data-first-of-entry="true"
  >
    <SheetChrome placement="header" contextInput={ctxFor(1)} />
    <div
      class="preview-body p-3 text-sm"
      style={isImage ? "display: flex; flex-direction: column;" : ""}
    >
      {#if content === null && !isImage && !isBinary}
        <p class="text-muted-foreground py-2 text-xs">Loading…</p>
      {:else if isBinary}
        <p class="text-muted-foreground py-2 text-xs">Binary file, preview not available.</p>
      {:else if isImage}
        {#if imageUrl}
          <div
            class="flex"
            style="flex: 1 1 0; min-height: 0; min-width: 0; justify-content: {justifyFor(
              imageAlign,
            )}; align-items: {alignFor(imageVerticalAlign)};"
          >
            <img
              src={imageUrl}
              alt={entry.source.name}
              style="width: {imageWidth}%; max-height: 100%; object-fit: contain;"
            />
          </div>
        {:else}
          <p class="text-muted-foreground py-2 text-xs">Loading image…</p>
        {/if}
      {/if}
    </div>
    <SheetChrome placement="footer" contextInput={ctxFor(1)} />
  </section>
{/if}
