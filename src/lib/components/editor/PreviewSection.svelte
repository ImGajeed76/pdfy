<script lang="ts">
  import type { IndexEntry } from "$lib/editor/types";
  import { editor } from "$lib/editor/state.svelte";
  import { determineFileDisplayProperties } from "$lib/fileSystem";
  import { highlightToLines, languageForExtension } from "$lib/editor/highlight";
  import MarkdownIt from "markdown-it";
  import CsvTable from "./CsvTable.svelte";
  import { Button } from "$lib/components/ui/button";
  import X from "@lucide/svelte/icons/x";
  import ChevronUp from "@lucide/svelte/icons/chevron-up";
  import ChevronDown from "@lucide/svelte/icons/chevron-down";

  const md = new MarkdownIt({ html: false, linkify: true, breaks: false });

  let {
    entry,
    order,
    total,
  }: {
    entry: Extract<IndexEntry, { kind: "file" }>;
    order: number;
    total: number;
  } = $props();

  let extension = $derived(entry.source.name.split(".").pop()?.toLowerCase());
  let language = $derived(languageForExtension(extension));
  let fileType = $derived(determineFileDisplayProperties(entry.source.name).fileType);
  let renderMode = $derived(editor.effectiveRenderMode(entry));
  let showLineNumbers = $derived(editor.effectiveShowLineNumbers(entry));
  let showPath = $derived(editor.effectiveShowPath(entry));

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

  let lines = $derived(
    content !== null && fileType !== "graphic" && fileType !== "binary"
      ? highlightToLines(content, language)
      : [],
  );

  let title = $derived(entry.customTitle || entry.source.name);

  let isImage = $derived(fileType === "graphic");
  let isBinary = $derived(fileType === "binary");
  let isCsv = $derived(extension === "csv");
  let isTsv = $derived(extension === "tsv");
  let renderAsTable = $derived(
    (isCsv || isTsv) && (entry.renderMode ?? editor.settings.defaultCsvMode) === "rendered",
  );
  let isMarkdownRendered = $derived(
    fileType === "rendered" &&
      (extension === "md" || extension === "markdown") &&
      renderMode === "rendered",
  );
  let isHtmlRendered = $derived(
    fileType === "rendered" &&
      (extension === "html" || extension === "htm") &&
      renderMode === "rendered",
  );
  let isSvgRendered = $derived(extension === "svg" && renderMode === "rendered");

  let renderedHtml = $derived(
    isMarkdownRendered && content ? md.render(content) : isHtmlRendered ? content : null,
  );

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

  function handleRemove(): void {
    editor.removeEntry(entry.id);
  }
</script>

<section
  id={`entry-${entry.id}`}
  class="preview-section bg-card border-border/60 mb-4 border print:m-0 print:break-after-page print:border-0"
  data-entry-id={entry.id}
>
  <!-- Per-file header (sticky in preview, prominent in print) -->
  <header
    class="bg-card/95 supports-[backdrop-filter]:bg-card/80 border-border/60 sticky top-0 z-10 flex items-center gap-2 border-b px-3 py-2 text-sm backdrop-blur print:relative print:bg-transparent print:backdrop-blur-none"
  >
    <span class="text-muted-foreground/70 font-mono text-[10px] tabular-nums">
      {String(order + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
    </span>
    <div class="min-w-0 flex-1">
      <h2 class="text-foreground truncate text-base font-semibold">{title}</h2>
      {#if showPath && entry.source.path !== title}
        <div class="text-muted-foreground/70 truncate font-mono text-[11px]">
          {entry.source.path}
        </div>
      {/if}
    </div>
    <div class="flex shrink-0 items-center gap-0.5 print:hidden">
      <Button
        variant="ghost"
        size="sm"
        class="size-7 p-0"
        onclick={() => editor.moveEntryUp(entry.id)}
        aria-label="Move up"
        title="Move up"
      >
        <ChevronUp class="size-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        class="size-7 p-0"
        onclick={() => editor.moveEntryDown(entry.id)}
        aria-label="Move down"
        title="Move down"
      >
        <ChevronDown class="size-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        class="hover:text-destructive size-7 p-0"
        onclick={handleRemove}
        aria-label="Remove from plan"
        title="Remove from plan"
      >
        <X class="size-3.5" />
      </Button>
    </div>
  </header>

  <!-- Body -->
  <div class="preview-body p-3 text-sm">
    {#if content === null}
      <p class="text-muted-foreground py-2 text-xs">Loading…</p>
    {:else if isBinary}
      <p class="text-muted-foreground py-2 text-xs">Binary file — preview not available.</p>
    {:else if isImage}
      {#if imageUrl}
        <div
          class="image-wrap"
          style="text-align: {imageAlign === 'center' ? 'center' : imageAlign};"
        >
          <img
            src={imageUrl}
            alt={entry.source.name}
            style="width: {imageWidth}%; max-height: {entry.imageMaxHeight ??
              editor.settings.defaultImageMaxHeight}vh; object-fit: contain;"
          />
        </div>
      {:else}
        <p class="text-muted-foreground py-2 text-xs">Loading image…</p>
      {/if}
    {:else if isSvgRendered && content}
      <div class="image-wrap" style="text-align: center;">
        <!-- eslint-disable-next-line svelte/no-at-html-tags -- user's own SVG file content -->
        {@html content}
      </div>
    {:else if renderAsTable && content}
      <CsvTable {content} separator={isTsv ? "\t" : ","} />
    {:else if isMarkdownRendered && renderedHtml}
      <article class="markdown-body prose prose-sm dark:prose-invert max-w-none">
        <!-- eslint-disable-next-line svelte/no-at-html-tags -- markdown-it output, html: false -->
        {@html renderedHtml}
      </article>
    {:else if isHtmlRendered && renderedHtml}
      <article class="html-rendered">
        <!-- eslint-disable-next-line svelte/no-at-html-tags -- user's own HTML file content -->
        {@html renderedHtml}
      </article>
    {:else}
      <!-- eslint-disable svelte/no-at-html-tags -- highlight.js output, lines pre-escaped -->
      <pre
        class="hljs code-pre overflow-x-auto font-mono leading-snug whitespace-pre"
        style="font-size: {editor.settings.codeFontSize}pt;"><code class="language-{language}"
          >{#each lines as line (line.number)}<span class="code-line"
              >{#if showLineNumbers}<span class="code-num">{line.number}</span>{/if}<span
                class="code-text">{@html line.html}</span
              ></span
            >{/each}</code
        ></pre>
      <!-- eslint-enable svelte/no-at-html-tags -->
    {/if}
  </div>
</section>
