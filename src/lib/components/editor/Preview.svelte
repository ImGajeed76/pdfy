<script lang="ts">
  import { editor } from "$lib/editor/state.svelte";
  import PreviewSection from "./PreviewSection.svelte";
  import CoverPreview from "./CoverPreview.svelte";
  import TocPreview from "./TocPreview.svelte";
  import GroupDivider from "./GroupDivider.svelte";
  import { onMount } from "svelte";

  let { jumpRequest = $bindable() }: { jumpRequest: string | null } = $props();

  let scrollRoot: HTMLElement | null = $state(null);

  // External jump-to: scroll to entry when requested.
  $effect(() => {
    if (!jumpRequest || !scrollRoot) return;
    const el = scrollRoot.querySelector(`[data-entry-id="${jumpRequest}"]`);
    if (el && "scrollIntoView" in el) {
      (el as HTMLElement).scrollIntoView({ behavior: "smooth", block: "start" });
    }
    jumpRequest = null;
  });

  // Update which index entry is "current" based on scroll. Uses
  // IntersectionObserver — the topmost intersecting section wins.
  let observer: IntersectionObserver | null = null;
  onMount(() => {
    if (!scrollRoot) return;
    // Plain Map: not reactive state, just internal observer bookkeeping.
    // eslint-disable-next-line svelte/prefer-svelte-reactivity
    const visible = new Map<string, number>();
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = (entry.target as HTMLElement).dataset.entryId;
          if (!id) continue;
          if (entry.isIntersecting) {
            visible.set(id, entry.intersectionRatio);
          } else {
            visible.delete(id);
          }
        }
        if (visible.size === 0) return;
        // Pick the entry with highest ratio that's also earliest in the index.
        const order = new Map(editor.index.map((e, i) => [e.id, i]));
        let bestId: string | null = null;
        let bestRank = Number.POSITIVE_INFINITY;
        for (const [id] of visible) {
          const rank = order.get(id) ?? Number.POSITIVE_INFINITY;
          if (rank < bestRank) {
            bestRank = rank;
            bestId = id;
          }
        }
        if (bestId && editor.currentEntryId !== bestId) {
          editor.currentEntryId = bestId;
        }
      },
      {
        root: scrollRoot,
        threshold: [0, 0.1, 0.5, 1],
        rootMargin: "0px 0px -50% 0px",
      },
    );
    return () => observer?.disconnect();
  });

  $effect(() => {
    if (!scrollRoot || !observer) return;
    const sections = scrollRoot.querySelectorAll<HTMLElement>(".preview-section");
    for (const s of sections) observer.observe(s);
    return () => {
      for (const s of sections) observer?.unobserve(s);
    };
  });
</script>

<div bind:this={scrollRoot} class="bg-background h-full overflow-y-auto">
  <div class="preview-stack mx-auto max-w-5xl p-6">
    {#each editor.index as entry, i (entry.id)}
      {@const prev = i > 0 ? editor.index[i - 1] : null}
      {@const currGroup = entry.kind === "file" ? entry.groupId : null}
      {@const prevGroup = prev && prev.kind === "file" ? prev.groupId : null}
      {#if currGroup && currGroup !== prevGroup}
        {@const group = editor.groups.find((g) => g.id === currGroup)}
        {#if group}
          <GroupDivider label={group.label} />
        {/if}
      {/if}
      {#if entry.kind === "cover"}
        <CoverPreview {entry} />
      {:else if entry.kind === "toc"}
        <TocPreview {entry} />
      {:else}
        <PreviewSection {entry} order={i} total={editor.index.length} />
      {/if}
    {/each}
  </div>
</div>
