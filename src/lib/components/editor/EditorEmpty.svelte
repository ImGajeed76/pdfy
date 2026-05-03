<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { editor } from "$lib/editor/state.svelte";
  import { recentProjects, openRecentProject, removeRecentProject } from "$lib/editor/recent";
  import { onMount } from "svelte";
  import { toast } from "svelte-sonner";
  import FolderOpen from "@lucide/svelte/icons/folder-open";
  import Sparkles from "@lucide/svelte/icons/sparkles";
  import Clock from "@lucide/svelte/icons/clock";
  import X from "@lucide/svelte/icons/x";

  let recents = $state<Awaited<ReturnType<typeof recentProjects>>>([]);

  async function loadRecents(): Promise<void> {
    recents = await recentProjects();
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

  async function handleRemoveRecent(id: string, e: MouseEvent): Promise<void> {
    e.stopPropagation();
    await removeRecentProject(id);
    await loadRecents();
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

<div
  class="bg-background relative flex h-full flex-col items-center justify-center overflow-auto px-6 py-12 text-center"
>
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

  {#if recents.length > 0}
    <div class="mt-12 w-full max-w-lg">
      <p
        class="text-muted-foreground mb-3 flex items-center justify-center gap-1.5 font-mono text-xs tracking-wider uppercase"
      >
        <Clock class="size-3.5" />
        Recent projects
      </p>
      <ul class="border-border/60 divide-border/60 divide-y border">
        {#each recents.slice(0, 5) as p (p.id)}
          <li class="relative">
            <button
              type="button"
              class="hover:bg-muted/40 group/recent flex w-full items-center gap-3 px-3 py-2.5 pr-10 text-left transition-colors"
              onclick={() => handleOpenRecent(p.id)}
            >
              <FolderOpen class="text-primary size-4 shrink-0" />
              <div class="min-w-0 flex-1">
                <div class="text-foreground truncate text-sm font-medium">{p.name}</div>
                <div class="text-muted-foreground text-left text-xs tabular-nums">
                  {timeAgo(p.lastOpenedAt)}
                </div>
              </div>
            </button>
            <button
              type="button"
              class="text-muted-foreground/50 hover:text-destructive absolute top-1/2 right-3 -translate-y-1/2 opacity-0 transition-opacity group-hover/recent:opacity-100 hover:opacity-100"
              onclick={(e) => handleRemoveRecent(p.id, e)}
              aria-label="Remove from recent"
              title="Remove from recent"
            >
              <X class="size-3.5" />
            </button>
          </li>
        {/each}
      </ul>
    </div>
  {/if}

  <p class="text-muted-foreground/70 mt-10 max-w-md text-xs">
    <Sparkles class="inline size-3.5 align-text-bottom" />
    By default, all your code, text, and markdown files will be added to the print plan automatically.
    You can change anything before printing.
  </p>
</div>
