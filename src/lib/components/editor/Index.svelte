<script lang="ts">
  import { editor } from "$lib/editor/state.svelte";
  import type { PDFYFileSystemEntry } from "$lib/types";
  import IndexItem from "./IndexItem.svelte";
  import { Button } from "$lib/components/ui/button";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import LayoutTemplate from "@lucide/svelte/icons/layout-template";
  import List from "@lucide/svelte/icons/list";
  import Plus from "@lucide/svelte/icons/plus";
  import Trash2 from "@lucide/svelte/icons/trash-2";
  import { findFileById } from "$lib/editor/util";
  import { renameEntry } from "$lib/editor/actions";
  import { toast } from "svelte-sonner";
  import { onMount } from "svelte";

  let { onJumpTo }: { onJumpTo: (id: string) => void } = $props();

  let selectedCount = $derived(editor.selectedIndexIds.size);

  function deleteSelected(): void {
    if (editor.selectedIndexIds.size === 0) return;
    const ids = [...editor.selectedIndexIds];
    editor.removeEntries(ids);
    toast.success(`Removed ${ids.length} ${ids.length === 1 ? "entry" : "entries"}`);
  }

  async function renameSelected(): Promise<void> {
    if (editor.selectedIndexIds.size !== 1) return;
    const id = [...editor.selectedIndexIds][0];
    const entry = editor.index.find((e) => e.id === id);
    if (entry) await renameEntry(entry);
  }

  // Global keyboard shortcuts for the print plan. Only fire when the
  // focus isn't on a text input / editable field (so typing in headers,
  // titles, etc. still works normally).
  onMount(() => {
    function onKey(e: KeyboardEvent): void {
      const target = e.target as HTMLElement | null;
      if (target) {
        const tag = target.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable) return;
      }
      if (editor.selectedIndexIds.size === 0) return;
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        deleteSelected();
      } else if (e.key === "F2") {
        e.preventDefault();
        void renameSelected();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // Visual indicator: where would the dropped item land?
  // null = no drag in progress; number = index where the new item would
  // be inserted (0..length).
  let dropIndex = $state<number | null>(null);
  // True when the active drag is bringing in something NEW (file/folder
  // from the tree, or an OS-drop). Drives the lower-spacer orange wash.
  // False when the drag is just reordering an existing index entry.
  let externalDrag = $state(false);

  let listEl = $state<HTMLElement | null>(null);

  /**
   * Compute the insertion index based on the cursor's vertical position.
   * Looks at every [data-index-row] inside the list. If the cursor is above
   * the row's vertical midpoint, insertion goes ABOVE that row; otherwise
   * BELOW it. If no row is hit (cursor below the last row), insert at end.
   */
  function computeDropIndex(clientY: number): number {
    if (!listEl) return editor.index.length;
    const rows = Array.from(listEl.querySelectorAll<HTMLElement>("[data-index-row]"));
    if (rows.length === 0) return 0;
    for (let i = 0; i < rows.length; i++) {
      const rect = rows[i].getBoundingClientRect();
      const mid = rect.top + rect.height / 2;
      if (clientY < mid) return i;
    }
    return rows.length;
  }

  function handleListDragOver(e: DragEvent): void {
    e.preventDefault();
    if (!e.dataTransfer) return;
    const isReorder = e.dataTransfer.types.includes("application/x-pdfy-index-entry");
    e.dataTransfer.dropEffect = isReorder ? "move" : "copy";
    dropIndex = computeDropIndex(e.clientY);
    externalDrag = !isReorder;
  }

  function handleListDragLeave(e: DragEvent): void {
    // Only clear when leaving the list element itself, not when crossing
    // into a child. relatedTarget is the new element under the cursor.
    if (e.currentTarget instanceof HTMLElement) {
      const next = e.relatedTarget as Node | null;
      if (next && e.currentTarget.contains(next)) return;
    }
    dropIndex = null;
    externalDrag = false;
  }

  function handleListDrop(e: DragEvent): void {
    e.preventDefault();
    const at = dropIndex ?? editor.index.length;
    dropIndex = null;
    externalDrag = false;
    if (!e.dataTransfer) return;

    // OS drag (file manager → browser).
    const hasInternalPayload =
      e.dataTransfer.types.includes("application/x-pdfy-index-entry") ||
      e.dataTransfer.types.includes("application/x-pdfy-file") ||
      e.dataTransfer.types.includes("application/x-pdfy-folder");
    if (!hasInternalPayload && e.dataTransfer.items.length > 0) {
      void handleOsDrop(e.dataTransfer.items, at);
      return;
    }

    const indexEntryRaw = e.dataTransfer.getData("application/x-pdfy-index-entry");
    if (indexEntryRaw) {
      try {
        const { id } = JSON.parse(indexEntryRaw);
        editor.moveEntry(id, at);
        return;
      } catch {
        // ignore
      }
    }

    const fileRaw = e.dataTransfer.getData("application/x-pdfy-file");
    if (fileRaw) {
      try {
        const { id } = JSON.parse(fileRaw);
        const file = editor.tree && findFileById(editor.tree, id);
        if (file && file.kind === "file") {
          editor.addFile(file, { at });
        }
        return;
      } catch {
        // ignore
      }
    }

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
          editor.addFiles(collected, { at });
        }
      } catch {
        // ignore
      }
    }
  }

  /**
   * Handle drag from the OS file picker. Modern File System Access API
   * exposes getAsFileSystemHandle() on each DataTransferItem. This lets the
   * user drop a file/folder from their file manager and get a real handle
   * (not just a File object) so the rest of the editor flow works.
   */
  async function handleOsDrop(items: DataTransferItemList, at: number): Promise<void> {
    const fileEntries: Parameters<typeof editor.addFiles>[0] = [];
    let folderCount = 0;
    for (const item of Array.from(items)) {
      if (item.kind !== "file") continue;
      const getter = (
        item as DataTransferItem & {
          getAsFileSystemHandle?: () => Promise<FileSystemHandle | null>;
        }
      ).getAsFileSystemHandle;
      if (!getter) continue;
      const handle = await getter.call(item);
      if (!handle) continue;
      if (handle.kind === "file") {
        const fh = handle as FileSystemFileHandle;
        fileEntries.push({
          id: `__os__/${fh.name}`,
          name: fh.name,
          kind: "file",
          path: fh.name,
          handle: fh,
        });
      } else if (handle.kind === "directory") {
        folderCount++;
        const dh = handle as FileSystemDirectoryHandle;
        await collectFromDir(dh, dh.name + "/", fileEntries);
      }
    }
    if (fileEntries.length > 0) {
      editor.addFiles(fileEntries, { at });
      toast.success(
        `Added ${fileEntries.length} ${fileEntries.length === 1 ? "file" : "files"}` +
          (folderCount > 0 ? ` from ${folderCount} folder${folderCount > 1 ? "s" : ""}` : ""),
      );
    }
  }

  async function collectFromDir(
    dh: FileSystemDirectoryHandle,
    prefix: string,
    out: Parameters<typeof editor.addFiles>[0],
  ): Promise<void> {
    for await (const handle of dh.values()) {
      if (handle.kind === "file") {
        out.push({
          id: `__os__/${prefix}${handle.name}`,
          name: handle.name,
          kind: "file",
          path: prefix + handle.name,
          handle: handle as FileSystemFileHandle,
        });
      } else if (handle.kind === "directory") {
        await collectFromDir(handle as FileSystemDirectoryHandle, `${prefix}${handle.name}/`, out);
      }
    }
  }
</script>

<aside class="bg-card flex h-full flex-col overflow-hidden">
  <!-- Top bar -->
  <div class="border-foreground/15 flex items-center justify-between gap-2 border-b px-3 py-2">
    <div class="flex items-baseline gap-2">
      <h2 class="text-foreground text-sm font-semibold">Print plan</h2>
      <span class="text-muted-foreground text-xs tabular-nums">
        {#if selectedCount > 0}
          {selectedCount} selected
        {:else}
          {editor.entryCount}
          {editor.entryCount === 1 ? "entry" : "entries"}
        {/if}
      </span>
    </div>
    <div class="flex items-center gap-1">
      {#if selectedCount > 0}
        <Button
          variant="ghost"
          size="sm"
          class="text-destructive hover:text-destructive size-7 p-0"
          onclick={deleteSelected}
          title="Remove selected (Del)"
          aria-label="Remove selected entries"
        >
          <Trash2 class="size-4" />
        </Button>
      {/if}
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
  </div>

  <!-- Whole list area is one drop target. Insertion-point indicator is a
       2px primary line rendered between rows based on cursor Y position. -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div
    bind:this={listEl}
    class="relative flex min-h-0 flex-1 flex-col overflow-y-auto"
    role="list"
    ondragover={handleListDragOver}
    ondragleave={handleListDragLeave}
    ondrop={handleListDrop}
    onclick={(e) => {
      // Click on the list background (not on a row) clears selection.
      if (e.target === e.currentTarget) editor.clearSelection();
    }}
  >
    {#if editor.index.length > 0}
      {#each editor.index as entry, i (entry.id)}
        {#if dropIndex === i}
          <div class="bg-primary pointer-events-none h-0.5" aria-hidden="true"></div>
        {/if}
        <div data-index-row>
          <IndexItem {entry} order={i} {onJumpTo} />
        </div>
      {/each}
      {#if dropIndex === editor.index.length}
        <div class="bg-primary pointer-events-none h-0.5" aria-hidden="true"></div>
      {/if}
      <!-- Spacer fills the rest of the height so clicks below the last
           row reach the list-background click handler above. Lights up
           orange while a drag from the file tree is over it. -->
      <div
        class="min-h-12 flex-1 transition-colors {externalDrag && dropIndex === editor.index.length
          ? 'bg-primary/10 ring-primary/30 ring-1 ring-inset'
          : ''}"
        role="presentation"
        onclick={() => editor.clearSelection()}
      ></div>
    {:else}
      <!-- Empty state — also lights up while a drag from the tree is over it. -->
      <div
        class="flex h-full flex-col items-center justify-center gap-3 p-6 text-center transition-colors {externalDrag
          ? 'bg-primary/10 ring-primary/30 ring-1 ring-inset'
          : ''}"
        role="presentation"
        onclick={() => editor.clearSelection()}
      >
        <p class="text-muted-foreground text-sm">
          Drag files from the tree, or click + to add a cover page.
        </p>
      </div>
    {/if}
  </div>
</aside>
