<script lang="ts">
  import * as Sheet from "$lib/components/ui/sheet";
  import { Button } from "$lib/components/ui/button";
  import { Skeleton } from "$lib/components/ui/skeleton";
  import { editor } from "$lib/editor/state.svelte";
  import { recentProjects, openRecentProject, removeRecentProject } from "$lib/editor/recent";
  import { onMount } from "svelte";
  import { toast } from "svelte-sonner";
  import FolderOpen from "@lucide/svelte/icons/folder-open";
  import Clock from "@lucide/svelte/icons/clock";
  import X from "@lucide/svelte/icons/x";
  import RefreshCw from "@lucide/svelte/icons/refresh-cw";

  let { open = $bindable(false) }: { open: boolean } = $props();

  let projects = $state<Awaited<ReturnType<typeof recentProjects>>>([]);
  let loading = $state(false);

  async function refresh(): Promise<void> {
    loading = true;
    projects = await recentProjects();
    loading = false;
  }

  $effect(() => {
    if (open) refresh();
  });

  onMount(() => {
    refresh();
  });

  async function handleOpen(handleId: string): Promise<void> {
    const result = await openRecentProject(handleId);
    if (!result.ok) {
      if (result.reason === "permission-denied") {
        toast.error("Permission denied for that folder.");
      } else if (result.reason === "not-found") {
        toast.error("That project no longer exists in storage.");
        await refresh();
      } else {
        toast.error("Could not reopen that project.");
      }
      return;
    }
    open = false;
  }

  async function handleRemove(handleId: string, e: MouseEvent): Promise<void> {
    e.stopPropagation();
    await removeRecentProject(handleId);
    await refresh();
  }

  async function handleOpenNew(): Promise<void> {
    const result = await editor.openProject();
    if (result.ok) {
      open = false;
      await refresh();
    }
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

<Sheet.Root bind:open>
  <Sheet.Content class="flex w-full flex-col gap-0 sm:max-w-md">
    <Sheet.Header class="border-foreground/15 border-b">
      <Sheet.Title>Recent projects</Sheet.Title>
      <Sheet.Description>Pick up a folder you've worked on before.</Sheet.Description>
    </Sheet.Header>
    <div class="flex-1 overflow-y-auto p-3">
      {#if loading}
        <ul class="space-y-1">
          {#each [0, 1, 2, 3] as i (i)}
            <li class="flex items-center gap-3 px-3 py-2.5">
              <Skeleton class="size-4 shrink-0 rounded-full" />
              <div class="flex min-w-0 flex-1 flex-col gap-1.5">
                <Skeleton class="h-3.5 w-44" />
                <Skeleton class="h-3 w-24" />
              </div>
            </li>
          {/each}
        </ul>
      {:else if projects.length === 0}
        <div class="flex flex-col items-center gap-3 p-8 text-center">
          <Clock class="text-muted-foreground/40 size-10" />
          <p class="text-muted-foreground text-sm">No recent projects yet.</p>
        </div>
      {:else}
        <ul class="space-y-1">
          {#each projects as p (p.id)}
            <li class="relative">
              <button
                type="button"
                class="hover:bg-muted/60 group flex w-full items-center gap-3 px-3 py-2.5 pr-10 text-left transition-colors"
                onclick={() => handleOpen(p.id)}
              >
                <FolderOpen class="text-primary size-4 shrink-0" />
                <div class="min-w-0 flex-1">
                  <div class="text-foreground truncate text-sm font-medium">{p.name}</div>
                  <div class="text-muted-foreground text-xs tabular-nums">
                    {timeAgo(p.lastOpenedAt)}
                    {#if p.entryCount}
                      <span class="text-muted-foreground/40">·</span>
                      {p.entryCount}
                      {p.entryCount === 1 ? "entry" : "entries"}
                    {/if}
                  </div>
                </div>
              </button>
              <button
                type="button"
                class="text-muted-foreground/50 hover:text-destructive absolute top-1/2 right-3 -translate-y-1/2 opacity-0 transition-opacity hover:opacity-100"
                onclick={(e) => handleRemove(p.id, e)}
                aria-label="Remove from recent"
                title="Remove from recent"
              >
                <X class="size-3.5" />
              </button>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
    <Sheet.Footer class="border-foreground/15 border-t">
      <Button variant="ghost" size="sm" onclick={refresh} class="gap-2">
        <RefreshCw class="size-3.5" />
        Refresh
      </Button>
      <Button variant="default" size="sm" onclick={handleOpenNew} class="gap-2">
        <FolderOpen class="size-3.5" />
        Open new
      </Button>
    </Sheet.Footer>
  </Sheet.Content>
</Sheet.Root>
