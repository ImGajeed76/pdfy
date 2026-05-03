<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as AlertDialog from "$lib/components/ui/alert-dialog";
  import { editor } from "$lib/editor/state.svelte";
  import { recentProjects, openRecentProject, removeRecentProject } from "$lib/editor/recent";
  import { onMount } from "svelte";
  import { toast } from "svelte-sonner";
  import FolderOpen from "@lucide/svelte/icons/folder-open";
  import Folder from "@lucide/svelte/icons/folder";
  import Plus from "@lucide/svelte/icons/plus";
  import Sparkles from "@lucide/svelte/icons/sparkles";
  import Trash2 from "@lucide/svelte/icons/trash-2";
  import Loader2 from "@lucide/svelte/icons/loader-2";

  let recents = $state<Awaited<ReturnType<typeof recentProjects>>>([]);
  let recentsLoaded = $state(false);

  // Delete-confirmation modal state.
  let deleteTarget = $state<{ id: string; name: string } | null>(null);

  async function loadRecents(): Promise<void> {
    recents = await recentProjects();
    recentsLoaded = true;
  }

  onMount(() => {
    loadRecents();
  });

  async function handleOpen(): Promise<void> {
    const result = await editor.openProject();
    if (!result.ok && result.reason !== "cancelled-or-error") {
      toast.error("Could not open the folder.");
    }
  }

  async function handleOpenRecent(id: string): Promise<void> {
    const result = await openRecentProject(id);
    if (!result.ok) {
      if (result.reason === "permission-denied") {
        toast.error("Permission denied for that folder.");
      } else if (result.reason === "not-found") {
        toast.error("That project no longer exists in storage.");
        await loadRecents();
      } else {
        toast.error("Could not reopen that project.");
      }
    }
  }

  function askRemove(id: string, name: string, e: MouseEvent): void {
    e.stopPropagation();
    deleteTarget = { id, name };
  }

  async function confirmRemove(): Promise<void> {
    if (!deleteTarget) return;
    const { id, name } = deleteTarget;
    deleteTarget = null;
    await removeRecentProject(id);
    await loadRecents();
    toast.success(`Removed “${name}” from recents`);
  }

  function timeAgo(ts: number): string {
    const diff = Date.now() - ts;
    const min = Math.floor(diff / 60_000);
    if (min < 1) return "just now";
    if (min < 60) return `${min}m ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h ago`;
    const day = Math.floor(hr / 24);
    if (day < 30) return `${day}d ago`;
    return new Date(ts).toLocaleDateString();
  }
</script>

<div class="bg-background relative flex h-full flex-col overflow-auto">
  {#if !recentsLoaded}
    <!-- Loading: centered spinner only. No layout shift on settle. -->
    <div class="flex flex-1 items-center justify-center">
      <Loader2 class="text-muted-foreground/60 size-8 animate-spin" />
    </div>
  {:else if recents.length === 0}
    <!-- First-time greeting: fox + headline + open CTA -->
    <div class="relative flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
      <!-- Subtle ambient glow matching the homepage -->
      <div
        aria-hidden="true"
        class="bg-primary pointer-events-none absolute top-0 left-1/2 -z-10 h-[400px] w-[700px] -translate-x-1/2 rounded-full opacity-10 blur-[140px]"
      ></div>

      <img
        src="/foxes/with-paper.png"
        alt=""
        aria-hidden="true"
        class="pointer-events-none mb-6 size-36 select-none sm:size-48"
      />

      <p class="text-muted-foreground mb-2 font-mono text-xs tracking-wider uppercase">Editor</p>
      <h1 class="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
        Open a project to get started.
      </h1>
      <p class="text-muted-foreground mt-3 max-w-md text-sm">
        Pick a folder on your computer. PDFy reads the files locally and you'll compose the PDF you
        want.
      </p>

      <div class="mt-8 flex items-center gap-3">
        <Button onclick={handleOpen} size="lg" class="group h-11 gap-2 px-5 text-sm">
          <FolderOpen class="size-4" />
          Open a folder
        </Button>
      </div>

      <p class="text-muted-foreground/70 mt-10 max-w-md text-xs">
        <Sparkles class="inline size-3.5 align-text-bottom" />
        {#if editor.settings.autoSelect}
          By default, your code, text, and markdown files will be added to the print plan
          automatically. You can change anything before printing.
        {:else}
          Drag files from the tree into the print plan to compose your PDF. You can change anything
          before printing.
        {/if}
      </p>
    </div>
  {:else}
    <!-- Gallery: card per project + a dashed "new" card. -->
    <div class="mx-auto w-full max-w-5xl px-6 py-10 sm:py-14">
      <div class="mb-8">
        <p class="text-muted-foreground mb-1 font-mono text-xs tracking-wider uppercase">Editor</p>
        <h1 class="text-2xl font-semibold tracking-tight sm:text-3xl">Your projects</h1>
      </div>

      <ul class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {#each recents as p (p.id)}
          <li class="group/card relative">
            <button
              type="button"
              class="border-foreground/15 hover:border-primary hover:bg-card bg-card/60 flex h-full w-full flex-col gap-3 border p-5 text-left transition-colors"
              onclick={() => handleOpenRecent(p.id)}
            >
              <div class="flex items-start justify-between gap-2">
                <div
                  class="bg-primary/15 text-primary flex size-10 shrink-0 items-center justify-center"
                >
                  <Folder class="size-5" />
                </div>
              </div>
              <div class="min-w-0 flex-1">
                <h3
                  class="text-foreground group-hover/card:text-primary truncate text-base font-medium transition-colors"
                  title={p.name}
                >
                  {p.name}
                </h3>
                <p class="text-muted-foreground mt-1 text-xs tabular-nums">
                  Opened {timeAgo(p.lastOpenedAt)}
                  {#if p.entryCount}
                    <span class="text-muted-foreground/40">·</span>
                    {p.entryCount}
                    {p.entryCount === 1 ? "entry" : "entries"}
                  {/if}
                </p>
              </div>
            </button>
            <button
              type="button"
              class="text-muted-foreground/60 hover:text-destructive hover:bg-card absolute top-3 right-3 inline-flex size-7 items-center justify-center opacity-0 transition-opacity group-hover/card:opacity-100 hover:opacity-100"
              onclick={(e) => askRemove(p.id, p.name, e)}
              aria-label="Remove project"
              title="Remove project"
            >
              <Trash2 class="size-3.5" />
            </button>
          </li>
        {/each}
        <!-- Dashed "open new" card -->
        <li>
          <button
            type="button"
            class="border-foreground/25 hover:border-primary hover:bg-primary/5 hover:text-primary text-muted-foreground flex h-full min-h-[7rem] w-full flex-col items-center justify-center gap-2 border-2 border-dashed p-5 transition-colors"
            onclick={handleOpen}
          >
            <Plus class="size-5" />
            <span class="text-sm font-medium">Open another folder</span>
          </button>
        </li>
      </ul>

      <p class="text-muted-foreground/70 mt-8 text-center text-xs">
        <Sparkles class="inline size-3.5 align-text-bottom" />
        Project state, plan order, and per-file settings are saved locally per project.
      </p>
    </div>
  {/if}
</div>

<AlertDialog.Root
  open={deleteTarget !== null}
  onOpenChange={(o) => {
    if (!o) deleteTarget = null;
  }}
>
  <AlertDialog.Content>
    <AlertDialog.Header>
      <AlertDialog.Title>Remove this project?</AlertDialog.Title>
      <AlertDialog.Description>
        {#if deleteTarget}
          “{deleteTarget.name}” will be removed from your recents along with its saved plan and
          settings. The folder on your computer is untouched.
        {/if}
      </AlertDialog.Description>
    </AlertDialog.Header>
    <AlertDialog.Footer>
      <!-- Hierarchy is inverted on purpose: Cancel is the obvious primary
           orange button so people don't reflex-click their way to deletion.
           Remove is secondary (outline) so it requires intent. -->
      <AlertDialog.Cancel variant="default">Cancel, keep project</AlertDialog.Cancel>
      <AlertDialog.Action variant="outline" onclick={confirmRemove}>
        Remove anyway
      </AlertDialog.Action>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>
