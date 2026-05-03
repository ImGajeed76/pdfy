<script lang="ts">
  import { onMount } from "svelte";

  let { fileHandle }: { fileHandle: FileSystemFileHandle } = $props();

  let html = $state<string | null>(null);
  let messages = $state<string[]>([]);
  let error = $state<string | null>(null);

  onMount(() => {
    let cancelled = false;
    (async () => {
      try {
        const file = await fileHandle.getFile();
        const buffer = await file.arrayBuffer();
        // mammoth ships browser-friendly. We import it dynamically to keep it
        // out of the initial bundle.
        // @ts-expect-error -- mammoth ships no .d.ts for the browser entry
        const mammoth = (await import("mammoth/mammoth.browser.js")) as {
          default: {
            convertToHtml(opts: {
              arrayBuffer: ArrayBuffer;
            }): Promise<{ value: string; messages: { message: string }[] }>;
          };
        };
        const result = await mammoth.default.convertToHtml({ arrayBuffer: buffer });
        if (cancelled) return;
        html = result.value;
        messages = (result.messages ?? []).map((m: { message: string }) => m.message);
      } catch (e) {
        if (cancelled) return;
        error = e instanceof Error ? e.message : "Failed to render DOCX";
      }
    })();
    return () => {
      cancelled = true;
    };
  });
</script>

<div class="docx-view">
  {#if error}
    <p class="text-destructive py-2 text-xs">DOCX render failed: {error}</p>
  {:else if html === null}
    <p class="text-muted-foreground py-2 text-xs">Rendering DOCX…</p>
  {:else}
    <article class="markdown-body prose prose-sm max-w-none">
      <!-- eslint-disable-next-line svelte/no-at-html-tags -- mammoth-rendered HTML from user's own DOCX -->
      {@html html}
    </article>
    {#if messages.length > 0}
      <details class="text-muted-foreground/70 mt-3 text-[10px]">
        <summary class="cursor-pointer">{messages.length} render warnings</summary>
        <ul class="mt-1 list-disc pl-4">
          {#each messages as m, i (i)}
            <li>{m}</li>
          {/each}
        </ul>
      </details>
    {/if}
  {/if}
</div>
