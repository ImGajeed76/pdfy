<script lang="ts">
  import { Input } from "$lib/components/ui/input";
  import { Button } from "$lib/components/ui/button";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import { editor } from "$lib/editor/state.svelte";
  import { smartAutoSelect } from "$lib/editor/smart-select";
  import { determineFileDisplayProperties } from "$lib/fileSystem";
  import { toast } from "svelte-sonner";
  import TreeNode from "./TreeNode.svelte";
  import Search from "@lucide/svelte/icons/search";
  import MoreHorizontal from "@lucide/svelte/icons/more-horizontal";
  import Plus from "@lucide/svelte/icons/plus";
  import FileCode from "@lucide/svelte/icons/file-code";
  import Sparkles from "@lucide/svelte/icons/sparkles";
  import ChevronsDownUp from "@lucide/svelte/icons/chevrons-down-up";
  import ChevronsUpDown from "@lucide/svelte/icons/chevrons-up-down";

  function flattenAllFiles(): Extract<NonNullable<typeof editor.tree>[number], { kind: "file" }>[] {
    const out: Extract<NonNullable<typeof editor.tree>[number], { kind: "file" }>[] = [];
    function walk(es: NonNullable<typeof editor.tree>): void {
      for (const e of es) {
        if (e.kind === "file") out.push(e);
        else walk(e.children);
      }
    }
    if (editor.tree) walk(editor.tree);
    return out;
  }

  function addAll(): void {
    const all = flattenAllFiles().sort((a, b) => a.path.localeCompare(b.path));
    editor.addFiles(all);
    toast.success(`Added ${all.length} ${all.length === 1 ? "file" : "files"} to plan`);
  }

  function addAllCode(): void {
    const all = flattenAllFiles().filter((f) => {
      const t = determineFileDisplayProperties(f.name).fileType;
      return t === "code" || t === "text";
    });
    all.sort((a, b) => a.path.localeCompare(b.path));
    editor.addFiles(all);
    toast.success(`Added ${all.length} code/text ${all.length === 1 ? "file" : "files"} to plan`);
  }

  function applySmart(): void {
    if (!editor.tree) return;
    const ordered = smartAutoSelect(editor.tree);
    editor.addFiles(ordered);
    toast.success(`Smart-added ${ordered.length} ${ordered.length === 1 ? "file" : "files"}`);
  }

  let totalFileCount = $derived(flattenAllFiles().length);
</script>

<aside class="bg-card flex h-full flex-col overflow-hidden">
  <!-- Top bar -->
  <div class="border-border/60 flex items-center gap-1.5 border-b px-2 py-2">
    <div class="relative flex-1">
      <Search
        class="text-muted-foreground/60 pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2"
      />
      <Input
        type="text"
        placeholder="Filter…"
        bind:value={editor.treeFilter}
        class="border-input/60 bg-background h-8 pl-7 text-sm"
      />
    </div>
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        {#snippet child({ props })}
          <Button {...props} variant="ghost" size="sm" class="size-8 shrink-0 p-0">
            <MoreHorizontal class="size-4" />
          </Button>
        {/snippet}
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end" class="min-w-52">
        <DropdownMenu.Item onclick={applySmart}>
          <Sparkles class="size-4" />
          Smart-add (recommended)
        </DropdownMenu.Item>
        <DropdownMenu.Item onclick={addAllCode}>
          <FileCode class="size-4" />
          Add all code &amp; text
        </DropdownMenu.Item>
        <DropdownMenu.Item onclick={addAll}>
          <Plus class="size-4" />
          Add all files
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item onclick={() => editor.expandAll()}>
          <ChevronsUpDown class="size-4" />
          Expand all
        </DropdownMenu.Item>
        <DropdownMenu.Item onclick={() => editor.collapseAll()}>
          <ChevronsDownUp class="size-4" />
          Collapse all
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  </div>

  <!-- Tree -->
  <div class="min-h-0 flex-1 overflow-y-auto py-1">
    {#if editor.tree && editor.tree.length > 0}
      {#each editor.tree as entry (entry.id)}
        <TreeNode {entry} depth={0} filter={editor.treeFilter} />
      {/each}
    {:else if editor.tree}
      <p class="text-muted-foreground p-4 text-center text-sm">No files in this folder.</p>
    {/if}
  </div>

  <!-- Footer -->
  <div class="border-border/60 text-muted-foreground border-t px-3 py-2 text-xs tabular-nums">
    {totalFileCount}
    {totalFileCount === 1 ? "file" : "files"}
    <span class="text-muted-foreground/40">·</span>
    {editor.fileCount} in plan
  </div>
</aside>
