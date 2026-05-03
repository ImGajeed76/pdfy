<script lang="ts">
  import type { PDFYFileSystemEntry } from "$lib/types";
  import { editor } from "$lib/editor/state.svelte";
  import { determineFileDisplayProperties } from "$lib/fileSystem";
  import * as ContextMenu from "$lib/components/ui/context-menu";
  import { toast } from "svelte-sonner";
  import ChevronRight from "@lucide/svelte/icons/chevron-right";
  import Folder from "@lucide/svelte/icons/folder";
  import FolderOpen from "@lucide/svelte/icons/folder-open";
  import FileCode from "@lucide/svelte/icons/file-code";
  import FileText from "@lucide/svelte/icons/file-text";
  import FileImage from "@lucide/svelte/icons/file-image";
  import FileJson from "@lucide/svelte/icons/file-json";
  import FileType from "@lucide/svelte/icons/file-type";
  import File from "@lucide/svelte/icons/file";
  import Plus from "@lucide/svelte/icons/plus";
  import TreeNode from "./TreeNode.svelte";

  let {
    entry,
    depth = 0,
    filter = "",
  }: {
    entry: PDFYFileSystemEntry;
    depth?: number;
    filter?: string;
  } = $props();

  const isExpanded = $derived(editor.expandedFolders.has(entry.id));
  const isFocused = $derived(editor.focusedFileId === entry.id);

  let nodeEl: HTMLElement | null = $state(null);

  // When this file becomes the focused one (e.g. via "Reveal in tree"),
  // scroll into view.
  $effect(() => {
    if (isFocused && nodeEl) {
      nodeEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  });

  // How many times this file appears in the print index.
  const addedCount = $derived(
    entry.kind === "file" ? editor.fileEntries.filter((e) => e.source.id === entry.id).length : 0,
  );

  // Filter: hide nodes whose subtree has nothing matching.
  const matchesFilter = $derived(matchesFilterFn(entry, filter));

  function matchesFilterFn(e: PDFYFileSystemEntry, q: string): boolean {
    if (!q) return true;
    const lower = q.toLowerCase();
    if (e.name.toLowerCase().includes(lower) || e.path.toLowerCase().includes(lower)) return true;
    if (e.kind === "directory") {
      return e.children.some((child) => matchesFilterFn(child, q));
    }
    return false;
  }

  // Auto-expand folders when a filter is active and a descendant matches.
  $effect(() => {
    if (!filter || entry.kind !== "directory") return;
    if (matchesFilter && !isExpanded) {
      editor.expandedFolders.add(entry.id);
    }
  });

  function getFileIcon(file: PDFYFileSystemEntry & { kind: "file" }): typeof FileCode {
    const props = determineFileDisplayProperties(file.name);
    if (props.fileType === "rendered") {
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (ext === "json" || ext === "jsonc" || ext === "json5") return FileJson;
      return FileType;
    }
    if (props.fileType === "code") return FileCode;
    if (props.fileType === "graphic") return FileImage;
    if (props.fileType === "text") return FileText;
    return File;
  }

  function handleFileClick(e: MouseEvent, file: PDFYFileSystemEntry & { kind: "file" }): void {
    if (e.shiftKey) {
      const added = editor.addTreeRange(file.id);
      if (added > 1) {
        toast.success(`Added ${added} files to plan`);
      }
      editor.treeAnchorFileId = file.id;
      return;
    }
    editor.focusedFileId = file.id;
    editor.treeAnchorFileId = file.id;
    editor.ensureContent(file).catch(() => {});
  }

  function handleFileDoubleClick(file: PDFYFileSystemEntry & { kind: "file" }): void {
    editor.addFile(file);
    editor.focusedFileId = file.id;
    editor.treeAnchorFileId = file.id;
  }

  function handleAddFile(file: PDFYFileSystemEntry & { kind: "file" }): void {
    editor.addFile(file);
  }

  function handleAddFolder(
    dir: PDFYFileSystemEntry & { kind: "directory" },
    onlyCode: boolean,
  ): void {
    const files: (PDFYFileSystemEntry & { kind: "file" })[] = [];
    function walk(es: PDFYFileSystemEntry[]): void {
      for (const e of es) {
        if (e.kind === "file") {
          if (onlyCode) {
            const props = determineFileDisplayProperties(e.name);
            if (props.fileType === "code" || props.fileType === "text") files.push(e);
          } else {
            files.push(e);
          }
        } else {
          walk(e.children);
        }
      }
    }
    walk(dir.children);
    files.sort((a, b) => a.path.localeCompare(b.path));
    editor.addFiles(files);
  }

  function handleDragStart(e: DragEvent, file: PDFYFileSystemEntry & { kind: "file" }): void {
    if (!e.dataTransfer) return;
    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.setData(
      "application/x-pdfy-file",
      JSON.stringify({ kind: "file", id: file.id }),
    );
  }

  function handleFolderDragStart(
    e: DragEvent,
    dir: PDFYFileSystemEntry & { kind: "directory" },
  ): void {
    if (!e.dataTransfer) return;
    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.setData(
      "application/x-pdfy-folder",
      JSON.stringify({ kind: "folder", id: dir.id }),
    );
  }
</script>

{#if matchesFilter}
  {#if entry.kind === "directory"}
    <ContextMenu.Root>
      <ContextMenu.Trigger>
        {#snippet child({ props })}
          <div
            {...props}
            class="hover:bg-muted/60 group flex w-full cursor-pointer items-center gap-1.5 px-1.5 py-1 text-left text-sm transition-colors select-none"
            style="padding-left: {depth * 12 + 6}px"
            role="button"
            tabindex="0"
            onclick={() => editor.toggleFolder(entry.id)}
            onkeydown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                editor.toggleFolder(entry.id);
              }
            }}
            draggable={true}
            ondragstart={(e) => handleFolderDragStart(e, entry)}
          >
            <ChevronRight
              class="text-muted-foreground/70 size-3.5 transition-transform {isExpanded
                ? 'rotate-90'
                : ''}"
            />
            {#if isExpanded}
              <FolderOpen class="text-primary size-4 shrink-0" />
            {:else}
              <Folder class="text-primary size-4 shrink-0" />
            {/if}
            <span class="truncate">{entry.name}</span>
          </div>
        {/snippet}
      </ContextMenu.Trigger>
      <ContextMenu.Content class="min-w-52">
        <ContextMenu.Item onclick={() => handleAddFolder(entry, false)}>
          <Plus class="size-4" />
          Add all files to plan
        </ContextMenu.Item>
        <ContextMenu.Item onclick={() => handleAddFolder(entry, true)}>
          <FileCode class="size-4" />
          Add code &amp; text only
        </ContextMenu.Item>
        <ContextMenu.Separator />
        <ContextMenu.Item onclick={() => editor.expandAll(entry.children)}>
          Expand all under here
        </ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu.Root>

    {#if isExpanded}
      {#each entry.children as child (child.id)}
        <TreeNode entry={child} depth={depth + 1} {filter} />
      {/each}
    {/if}
  {:else}
    {@const Icon = getFileIcon(entry)}
    <ContextMenu.Root>
      <ContextMenu.Trigger>
        {#snippet child({ props })}
          <div
            bind:this={nodeEl}
            {...props}
            class="hover:bg-muted/60 group flex w-full cursor-pointer items-center gap-1.5 px-1.5 py-1 text-left text-sm transition-colors select-none {isFocused
              ? 'bg-muted/80'
              : ''}"
            style="padding-left: {depth * 12 + 6}px"
            role="button"
            tabindex="0"
            onclick={(e) => handleFileClick(e, entry)}
            ondblclick={() => handleFileDoubleClick(entry)}
            onkeydown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleFileClick(e as unknown as MouseEvent, entry);
              } else if (e.key === " ") {
                e.preventDefault();
                handleAddFile(entry);
              }
            }}
            draggable={true}
            ondragstart={(e) => handleDragStart(e, entry)}
          >
            <span class="size-3.5 shrink-0"></span>
            <Icon
              class="size-4 shrink-0 {addedCount > 0 ? 'text-primary' : 'text-muted-foreground/70'}"
            />
            <span class="flex-1 truncate {addedCount > 0 ? 'text-foreground' : ''}">
              {entry.name}
            </span>
            {#if addedCount > 0}
              <span
                class="bg-primary/15 text-primary mr-1 inline-flex h-4 min-w-4 items-center justify-center px-1 font-mono text-[10px] tabular-nums"
                title="In plan {addedCount}×"
              >
                {addedCount}
              </span>
            {/if}
            <button
              type="button"
              class="text-muted-foreground/50 hover:text-primary opacity-0 transition-opacity group-hover:opacity-100"
              onclick={(e) => {
                e.stopPropagation();
                handleAddFile(entry);
              }}
              aria-label="Add to print plan"
              title="Add to print plan"
            >
              <Plus class="size-3.5" />
            </button>
          </div>
        {/snippet}
      </ContextMenu.Trigger>
      <ContextMenu.Content class="min-w-48">
        <ContextMenu.Item onclick={() => handleAddFile(entry)}>
          <Plus class="size-4" />
          Add to plan
        </ContextMenu.Item>
        <ContextMenu.Item
          onclick={() => {
            editor.focusedFileId = entry.id;
            editor.treeAnchorFileId = entry.id;
            editor.ensureContent(entry).catch(() => {});
          }}
        >
          <File class="size-4" />
          Preview only
        </ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu.Root>
  {/if}
{/if}
