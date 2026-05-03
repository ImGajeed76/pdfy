<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import Logo from "$lib/components/Logo.svelte";
  import { editor } from "$lib/editor/state.svelte";
  import { toast } from "svelte-sonner";
  import FolderOpen from "@lucide/svelte/icons/folder-open";
  import Printer from "@lucide/svelte/icons/printer";
  import Settings from "@lucide/svelte/icons/settings";
  import Clock from "@lucide/svelte/icons/clock";
  import Undo2 from "@lucide/svelte/icons/undo-2";
  import Redo2 from "@lucide/svelte/icons/redo-2";
  import X from "@lucide/svelte/icons/x";

  let { onOpenSettings, onOpenRecent }: { onOpenSettings: () => void; onOpenRecent: () => void } =
    $props();

  let hasProject = $derived(editor.rootHandle !== null);
  let hasEntries = $derived(editor.fileCount > 0);

  async function handleOpen(): Promise<void> {
    const result = await editor.openProject();
    if (result.ok) {
      toast.success(`Loaded ${editor.rootName ?? "project"}`, {
        description:
          editor.fileCount > 0
            ? `${editor.fileCount} files added to your print plan.`
            : "Drag files from the tree to start composing.",
      });
    } else if (result.reason !== "cancelled-or-error") {
      toast.error("Could not open the folder.");
    }
  }

  function handlePrint(): void {
    if (!hasEntries) {
      toast.info("Add at least one file to the print plan first.");
      return;
    }
    window.print();
  }

  function handleClose(): void {
    editor.closeProject();
  }

  function formatPages(pages: number): string {
    if (pages === 0) return "0 pages";
    if (pages === 1) return "1 page";
    return `~${pages} pages`;
  }
</script>

<header
  class="border-border/60 bg-background/85 supports-[backdrop-filter]:bg-background/70 sticky top-0 z-40 flex items-center gap-3 border-b px-4 py-2.5 backdrop-blur sm:px-6"
>
  <!-- Brand -->
  <a
    href="/"
    class="hover:text-primary flex shrink-0 items-center gap-2 text-base font-semibold tracking-tight transition-colors"
  >
    <Logo class="size-6" />
    <span>PDFy</span>
  </a>

  <!-- Project context -->
  {#if hasProject}
    <div class="text-muted-foreground hidden items-center gap-3 text-sm md:flex">
      <span class="bg-border h-5 w-px"></span>
      <span class="text-foreground max-w-[20ch] truncate font-medium" title={editor.rootName ?? ""}>
        {editor.rootName}
      </span>
      <button
        type="button"
        onclick={handleClose}
        class="text-muted-foreground/60 hover:text-foreground transition-colors"
        aria-label="Close project"
        title="Close project"
      >
        <X class="size-3.5" />
      </button>
    </div>
  {/if}

  <!-- Spacer -->
  <div class="flex-1"></div>

  <!-- Counts (centered text on wide screens) -->
  {#if hasProject && hasEntries}
    <div class="text-muted-foreground hidden items-center gap-3 text-xs tabular-nums lg:flex">
      <span>{editor.fileCount} {editor.fileCount === 1 ? "entry" : "entries"}</span>
      <span class="text-muted-foreground/40">·</span>
      <span>{editor.totalLines.toLocaleString()} lines</span>
      <span class="text-muted-foreground/40">·</span>
      <span>{formatPages(editor.pageEstimate)}</span>
    </div>
  {/if}

  <!-- Actions -->
  <div class="flex shrink-0 items-center gap-1">
    {#if hasProject}
      <Button
        variant="ghost"
        size="sm"
        onclick={() => editor.undo()}
        disabled={!editor.canUndo}
        class="size-9 p-0"
        aria-label="Undo"
        title="Undo (Ctrl+Z)"
      >
        <Undo2 class="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onclick={() => editor.redo()}
        disabled={!editor.canRedo}
        class="size-9 p-0"
        aria-label="Redo"
        title="Redo (Ctrl+Shift+Z)"
      >
        <Redo2 class="size-4" />
      </Button>
      <span class="bg-border mx-1 h-5 w-px"></span>
    {/if}

    <Button
      variant="ghost"
      size="sm"
      onclick={onOpenRecent}
      class="size-9 p-0"
      aria-label="Recent projects"
      title="Recent projects"
    >
      <Clock class="size-4" />
    </Button>
    <Button
      variant="ghost"
      size="sm"
      onclick={onOpenSettings}
      class="size-9 p-0"
      aria-label="Settings"
      title="Settings"
    >
      <Settings class="size-4" />
    </Button>

    <span class="bg-border mx-1 h-5 w-px"></span>

    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        {#snippet child({ props })}
          <Button {...props} variant={hasProject ? "outline" : "default"} size="sm" class="gap-2">
            <FolderOpen class="size-4" />
            {hasProject ? "Switch" : "Open project"}
          </Button>
        {/snippet}
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end" class="min-w-44">
        <DropdownMenu.Item onclick={handleOpen}>
          <FolderOpen class="size-4" />
          {hasProject ? "Open another folder" : "Open a folder"}
        </DropdownMenu.Item>
        {#if hasProject}
          <DropdownMenu.Separator />
          <DropdownMenu.Item onclick={handleClose} class="text-destructive">
            <X class="size-4" />
            Close current project
          </DropdownMenu.Item>
        {/if}
      </DropdownMenu.Content>
    </DropdownMenu.Root>

    <Button variant="default" size="sm" onclick={handlePrint} disabled={!hasEntries} class="gap-2">
      <Printer class="size-4" />
      Print
    </Button>
  </div>
</header>
