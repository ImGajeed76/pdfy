<script lang="ts">
  import type { IndexEntry } from "$lib/editor/types";
  import { editor } from "$lib/editor/state.svelte";
  import { determineFileDisplayProperties } from "$lib/fileSystem";
  import { Button } from "$lib/components/ui/button";
  import * as ContextMenu from "$lib/components/ui/context-menu";
  import GripVertical from "@lucide/svelte/icons/grip-vertical";
  import X from "@lucide/svelte/icons/x";
  import ChevronUp from "@lucide/svelte/icons/chevron-up";
  import ChevronDown from "@lucide/svelte/icons/chevron-down";
  import Copy from "@lucide/svelte/icons/copy";
  import FileCode from "@lucide/svelte/icons/file-code";
  import FileText from "@lucide/svelte/icons/file-text";
  import FileImage from "@lucide/svelte/icons/file-image";
  import FileType from "@lucide/svelte/icons/file-type";
  import LayoutTemplate from "@lucide/svelte/icons/layout-template";
  import List from "@lucide/svelte/icons/list";
  import Edit3 from "@lucide/svelte/icons/edit-3";
  import FolderOpen from "@lucide/svelte/icons/folder-open";
  import { onMount } from "svelte";

  let {
    entry,
    order,
    onJumpTo,
  }: {
    entry: IndexEntry;
    order: number;
    onJumpTo: (id: string) => void;
  } = $props();

  function getIcon(): typeof FileCode {
    if (entry.kind === "cover") return LayoutTemplate;
    if (entry.kind === "toc") return List;
    const t = determineFileDisplayProperties(entry.source.name).fileType;
    if (t === "rendered") return FileType;
    if (t === "graphic") return FileImage;
    if (t === "text") return FileText;
    return FileCode;
  }

  function getTitle(): string {
    if (entry.kind === "cover") return entry.title || "Cover";
    if (entry.kind === "toc") return entry.title || "Table of contents";
    return entry.customTitle || entry.source.name;
  }

  function getSubtitle(): string | null {
    if (entry.kind === "cover") return entry.subtitle ?? "Cover page";
    if (entry.kind === "toc") return "Table of contents";
    return entry.source.path;
  }

  let isSelected = $derived(editor.selectedIndexIds.has(entry.id));
  let isCurrent = $derived(editor.currentEntryId === entry.id);

  function handleClick(e: MouseEvent): void {
    if (e.shiftKey) {
      editor.selectRange(entry.id);
    } else if (e.metaKey || e.ctrlKey) {
      editor.toggleSelection(entry.id);
    } else {
      editor.selectOne(entry.id);
      onJumpTo(entry.id);
    }
  }

  function handleRemove(): void {
    editor.removeEntry(entry.id);
  }

  function handleDuplicate(): void {
    if (entry.kind !== "file") return;
    editor.addFile(entry.source, { at: order + 1, groupId: entry.groupId });
  }

  function handleRename(): void {
    if (entry.kind === "file") {
      const next = window.prompt(
        "Custom title (leave empty to use filename):",
        entry.customTitle ?? "",
      );
      if (next === null) return;
      editor.updateEntry(entry.id, { customTitle: next.trim() || null });
    } else if (entry.kind === "cover") {
      const next = window.prompt("Cover title:", entry.title);
      if (next === null) return;
      editor.updateEntry(entry.id, { title: next.trim() || (editor.rootName ?? "PDFy Project") });
    } else if (entry.kind === "toc") {
      const next = window.prompt("TOC title:", entry.title);
      if (next === null) return;
      editor.updateEntry(entry.id, { title: next.trim() || "Contents" });
    }
  }

  // Drag-and-drop within the index for reordering.
  let dragging = $state(false);

  function handleDragStart(e: DragEvent): void {
    if (!e.dataTransfer) return;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("application/x-pdfy-index-entry", JSON.stringify({ id: entry.id }));
    dragging = true;
  }

  function handleDragEnd(): void {
    dragging = false;
  }

  let row: HTMLElement | null = null;
  onMount(() => {
    if (isSelected && row) row.scrollIntoView({ block: "nearest" });
  });

  const Icon = $derived(getIcon());
</script>

<ContextMenu.Root>
  <ContextMenu.Trigger>
    {#snippet child({ props })}
      <div
        bind:this={row}
        {...props}
        class="group/item hover:bg-muted/50 flex items-center gap-1.5 border-l-2 px-2 py-1.5 text-left text-sm transition-colors {isSelected
          ? 'bg-muted/70 border-l-primary'
          : isCurrent
            ? 'border-l-primary/40'
            : 'border-l-transparent'} {dragging ? 'opacity-40' : ''}"
        draggable={true}
        ondragstart={handleDragStart}
        ondragend={handleDragEnd}
        role="button"
        tabindex="0"
        onclick={handleClick}
        onkeydown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick(e as unknown as MouseEvent);
          }
        }}
      >
        <GripVertical
          class="text-muted-foreground/40 size-3.5 shrink-0 cursor-grab opacity-60 group-hover/item:opacity-100"
        />
        <span
          class="text-muted-foreground w-5 shrink-0 text-right font-mono text-[10px] tabular-nums"
        >
          {String(order + 1).padStart(2, "0")}
        </span>
        <Icon
          class="size-4 shrink-0 {entry.kind === 'cover' || entry.kind === 'toc'
            ? 'text-primary'
            : 'text-muted-foreground/80'}"
        />
        <div class="min-w-0 flex-1">
          <div class="truncate font-medium">{getTitle()}</div>
          {#if getSubtitle()}
            <div class="text-muted-foreground/70 truncate text-[11px]">{getSubtitle()}</div>
          {/if}
        </div>
        <div class="ml-1 hidden shrink-0 items-center gap-0.5 group-hover/item:flex">
          <Button
            variant="ghost"
            size="sm"
            class="size-6 p-0"
            onclick={(e) => {
              e.stopPropagation();
              editor.moveEntryUp(entry.id);
            }}
            aria-label="Move up"
            title="Move up"
          >
            <ChevronUp class="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            class="size-6 p-0"
            onclick={(e) => {
              e.stopPropagation();
              editor.moveEntryDown(entry.id);
            }}
            aria-label="Move down"
            title="Move down"
          >
            <ChevronDown class="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            class="hover:text-destructive size-6 p-0"
            onclick={(e) => {
              e.stopPropagation();
              handleRemove();
            }}
            aria-label="Remove"
            title="Remove from plan"
          >
            <X class="size-3.5" />
          </Button>
        </div>
      </div>
    {/snippet}
  </ContextMenu.Trigger>
  <ContextMenu.Content class="min-w-48">
    <ContextMenu.Item onclick={handleRename}>
      <Edit3 class="size-4" />
      Rename
    </ContextMenu.Item>
    {#if entry.kind === "file"}
      <ContextMenu.Item onclick={() => editor.revealInTree(entry.source.id)}>
        <FolderOpen class="size-4" />
        Reveal in tree
      </ContextMenu.Item>
      <ContextMenu.Item onclick={handleDuplicate}>
        <Copy class="size-4" />
        Duplicate
      </ContextMenu.Item>
    {/if}
    <ContextMenu.Separator />
    <ContextMenu.Item onclick={handleRemove} variant="destructive">
      <X class="size-4" />
      Remove
    </ContextMenu.Item>
  </ContextMenu.Content>
</ContextMenu.Root>
