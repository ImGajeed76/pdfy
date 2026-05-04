<script lang="ts">
  import { page } from "$app/state";
  import { TUTORIAL_PAGES, TUTORIAL_GROUPS, tutorialHref, type TutorialGroup } from "$lib/tutorial";

  // Current path without trailing slash, for active-link comparison.
  const currentHref = $derived(page.url.pathname.replace(/\/$/, ""));

  function pagesIn(group: TutorialGroup | null): typeof TUTORIAL_PAGES {
    return TUTORIAL_PAGES.filter((p) => p.group === group);
  }

  const overview = pagesIn(null)[0];
  const overviewHref = tutorialHref(overview.slug);
  const overviewActive = $derived(currentHref === overviewHref);
</script>

<nav aria-label="Tutorial navigation" class="space-y-7">
  <ol class="space-y-1">
    <li>
      <a
        href={overviewHref}
        class="block px-3 py-1.5 text-sm transition-colors {overviewActive
          ? 'text-primary border-primary -ml-px border-l-2 font-medium'
          : 'text-muted-foreground hover:text-foreground -ml-px border-l-2 border-transparent'}"
        aria-current={overviewActive ? "page" : undefined}
      >
        {overview.title}
      </a>
    </li>
  </ol>

  {#each TUTORIAL_GROUPS as groupName (groupName)}
    {@const pages = pagesIn(groupName)}
    {#if pages.length > 0}
      <div>
        <p
          class="text-muted-foreground/80 mb-2 px-3 font-mono text-[10px] tracking-wider uppercase"
        >
          {groupName}
        </p>
        <ol class="space-y-1">
          {#each pages as p (p.slug)}
            {@const href = tutorialHref(p.slug)}
            {@const isActive = currentHref === href}
            <li>
              <a
                {href}
                class="block px-3 py-1.5 text-sm transition-colors {isActive
                  ? 'text-primary border-primary -ml-px border-l-2 font-medium'
                  : 'text-muted-foreground hover:text-foreground -ml-px border-l-2 border-transparent'}"
                aria-current={isActive ? "page" : undefined}
              >
                {p.title}
              </a>
            </li>
          {/each}
        </ol>
      </div>
    {/if}
  {/each}
</nav>
