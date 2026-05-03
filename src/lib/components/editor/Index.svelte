<script lang="ts">
  import { editor } from "$lib/editor/state.svelte";
  import type { PDFYFileSystemEntry } from "$lib/types";
  import IndexItem from "./IndexItem.svelte";
  import { Button } from "$lib/components/ui/button";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import LayoutTemplate from "@lucide/svelte/icons/layout-template";
  import List from "@lucide/svelte/icons/list";
  import Plus from "@lucide/svelte/icons/plus";
  import { findFileById } from "$lib/editor/util";

  let { onJumpTo }: { onJumpTo: (id: string) => void } = $props();

  let dragOverIndex = $state<number | null>(null);

  function handleDragOver(e: DragEvent, index: number): void {
    e.preventDefault();
    if (!e.dataTransfer) return;
    e.dataTransfer.dropEffect = e.dataTransfer.types.includes("application/x-pdfy-index-entry")
      ? "move"
      : "copy";
    dragOverIndex = index;
  }

  function handleDragLeaveAll(): void {
    dragOverIndex = null;
  }

  function handleDrop(e: DragEvent, dropIndex: number): void {
    e.preventDefault();
    dragOverIndex = null;
    if (!e.dataTransfer) return;

    // Reorder existing index entry.
    const indexEntryRaw = e.dataTransfer.getData("application/x-pdfy-index-entry");
    if (indexEntryRaw) {
      try {
        const { id } = JSON.parse(indexEntryRaw);
        editor.moveEntry(id, dropIndex);
        return;
      } catch {
        // bad payload; ignore
      }
    }

    // Add a file from the tree.
    const fileRaw = e.dataTransfer.getData("application/x-pdfy-file");
    if (fileRaw) {
      try {
        const { id } = JSON.parse(fileRaw);
        const file = editor.tree && findFileById(editor.tree, id);
        if (file && file.kind === "file") {
          editor.addFile(file, { at: dropIndex });
        }
        return;
      } catch {
        // ignore
      }
    }

    // Add a folder from the tree.
    const folderRaw = e.dataTransfer.getData("application/x-pdfy-folder");
    if (folderRaw) {
      try {
        const { id } = JSON.parse(folderRaw);
        if (!editor.tree) return;
        const dir = findFileById(editor.tree, id);
        if (dir && dir.kind === "directory") {
          const collected: Parameters<typeof editor.addFiles>[0] = [];
          function walk(es: PDFYFileSystemEntry[]): void {
            for (const en of es) {
              if (en.kind === "file") collected.push(en);
              else walk(en.children);
            }
          }
          walk(dir.children);
          collected.sort((a, b) => a.path.localeCompare(b.path));
          editor.addFiles(collected, { at: dropIndex });
        }
      } catch {
        // ignore
      }
    }
  }
</script>

<aside class="bg-card flex h-full flex-col overflow-hidden">
  <!-- Top bar -->
  <div class="border-border/60 flex items-center justify-between gap-2 border-b px-3 py-2">
    <div class="flex items-baseline gap-2">
      <h2 class="text-foreground text-sm font-semibold">Print plan</h2>
      <span class="text-muted-foreground text-xs tabular-nums">
        {editor.entryCount}
        {editor.entryCount === 1 ? "entry" : "entries"}
      </span>
    </div>
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        {#snippet child({ props })}
          <Button {...props} variant="ghost" size="sm" class="size-7 p-0">
            <Plus class="size-4" />
          </Button>
        {/snippet}
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end" class="min-w-48">
        <DropdownMenu.Item onclick={() => editor.ensureCover()}>
          <LayoutTemplate class="size-4" />
          Add cover page
        </DropdownMenu.Item>
        <DropdownMenu.Item onclick={() => editor.ensureToc()}>
          <List class="size-4" />
          Add table of contents
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  </div>

  <!-- List -->
  <div class="min-h-0 flex-1 overflow-y-auto" role="list" ondragleave={handleDragLeaveAll}>
    {#if editor.index.length > 0}
      {#each editor.index as entry, i (entry.id)}
        <!-- Drop zone above each row -->
        <div
          class="h-1 transition-colors {dragOverIndex === i ? 'bg-primary' : 'bg-transparent'}"
          ondragover={(e) => handleDragOver(e, i)}
          ondrop={(e) => handleDrop(e, i)}
          role="presentation"
        ></div>
        <IndexItem {entry} order={i} {onJumpTo} />
      {/each}
      <!-- Drop zone after the last row -->
      <div
        class="h-8 transition-colors {dragOverIndex === editor.index.length
          ? 'bg-primary/20 border-primary border-t-2'
          : ''}"
        ondragover={(e) => handleDragOver(e, editor.index.length)}
        ondrop={(e) => handleDrop(e, editor.index.length)}
        role="presentation"
      ></div>
    {:else}
      <div
        class="flex h-full flex-col items-center justify-center gap-3 p-6 text-center transition-colors {dragOverIndex !==
        null
          ? 'bg-primary/10'
          : ''}"
        ondragover={(e) => handleDragOver(e, 0)}
        ondrop={(e) => handleDrop(e, 0)}
        role="presentation"
      >
        <p class="text-muted-foreground text-sm">
          Drag files from the tree, or click + to add a cover page.
        </p>
      </div>
    {/if}
  </div>
</aside>
