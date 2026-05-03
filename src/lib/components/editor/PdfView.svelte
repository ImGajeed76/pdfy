<script lang="ts">
  import { onMount } from "svelte";

  let { fileHandle }: { fileHandle: FileSystemFileHandle } = $props();

  type RenderedPage = { num: number; canvas: HTMLCanvasElement };
  let pages = $state<RenderedPage[]>([]);
  let pageCount = $state<number | null>(null);
  let error = $state<string | null>(null);

  onMount(() => {
    let cancelled = false;
    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        const workerUrl = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
        pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

        const file = await fileHandle.getFile();
        const buffer = await file.arrayBuffer();
        const doc = await pdfjs.getDocument({ data: buffer }).promise;
        if (cancelled) return;
        pageCount = doc.numPages;

        // Render each page to its own (off-DOM) canvas, then push to state.
        // Svelte's #each will mount them, preserving reactive lifecycle.
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
          pages = [...pages, { num: i, canvas }];
        }
      } catch (e) {
        if (cancelled) return;
        error = e instanceof Error ? e.message : "Failed to render PDF";
      }
    })();
    return () => {
      cancelled = true;
    };
  });

  /**
   * Mount one of our pre-rendered canvases into a wrapper. We use a Svelte
   * action (use:) so Svelte still owns the lifecycle of the wrapper, and we
   * just attach the canvas as a single inserted child. No conflict with
   * Svelte's vdom because the wrapper has no other children.
   */
  function attachCanvas(node: HTMLElement, canvas: HTMLCanvasElement): {
    destroy: () => void;
  } {
    node.appendChild(canvas);
    return {
      destroy(): void {
        if (canvas.parentNode === node) node.removeChild(canvas);
      },
    };
  }
</script>

<div class="pdf-view">
  {#if error}
    <p class="text-destructive py-2 text-xs">PDF render failed: {error}</p>
  {:else if pageCount === null}
    <p class="text-muted-foreground py-2 text-xs">Loading PDF…</p>
  {:else}
    {#if pageCount > 0}
      <p class="text-muted-foreground/70 mb-2 font-mono text-[10px] tabular-nums">
        Rendered {pages.length} of {pageCount} {pageCount === 1 ? "page" : "pages"}
      </p>
    {/if}
    <div class="flex flex-col items-center gap-3">
      {#each pages as page (page.num)}
        <div
          class="pdf-page-wrap w-full max-w-full"
          use:attachCanvas={page.canvas}
          aria-label={`Page ${page.num}`}
        ></div>
      {/each}
    </div>
  {/if}
</div>

<style>
  :global(.pdf-page-wrap canvas) {
    max-width: 100%;
    height: auto;
    background: white;
    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.06);
  }
</style>
