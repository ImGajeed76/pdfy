<script lang="ts">
  import { page } from "$app/state";
  import { neighborsOf, tutorialHref } from "$lib/tutorial";
  import ArrowLeft from "@lucide/svelte/icons/arrow-left";
  import ArrowRight from "@lucide/svelte/icons/arrow-right";

  // Current slug = path after /tutorial. Empty for the overview.
  const slug = $derived(page.url.pathname.replace(/^\/tutorial\/?/, ""));
  const { prev, next } = $derived(neighborsOf(slug));
</script>

<nav
  aria-label="Tutorial page navigation"
  class="border-foreground/10 mt-20 flex items-stretch justify-between gap-4 border-t pt-8"
>
  {#if prev}
    <a
      href={tutorialHref(prev.slug)}
      class="border-foreground/15 hover:border-primary/40 hover:bg-primary/5 group flex flex-1 flex-col items-start gap-1 border p-4 transition-colors"
    >
      <span
        class="text-muted-foreground inline-flex items-center gap-1.5 font-mono text-[10px] tracking-wider uppercase"
      >
        <ArrowLeft class="size-3" />
        Previous
      </span>
      <span class="group-hover:text-primary text-sm font-medium transition-colors">
        {prev.title}
      </span>
    </a>
  {:else}
    <span class="flex-1"></span>
  {/if}

  {#if next}
    <a
      href={tutorialHref(next.slug)}
      class="border-foreground/15 hover:border-primary/40 hover:bg-primary/5 group flex flex-1 flex-col items-end gap-1 border p-4 transition-colors"
    >
      <span
        class="text-muted-foreground inline-flex items-center gap-1.5 font-mono text-[10px] tracking-wider uppercase"
      >
        Next
        <ArrowRight class="size-3" />
      </span>
      <span class="group-hover:text-primary text-sm font-medium transition-colors">
        {next.title}
      </span>
    </a>
  {:else}
    <span class="flex-1"></span>
  {/if}
</nav>
