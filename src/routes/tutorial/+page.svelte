<script lang="ts">
  import { TUTORIAL_PAGES, TUTORIAL_GROUPS, tutorialHref } from "$lib/tutorial";
  import { SITE_NAME } from "$lib/site";
  import Pagination from "$lib/components/tutorial/Pagination.svelte";
  import ArrowRight from "@lucide/svelte/icons/arrow-right";

  function pagesIn(group: (typeof TUTORIAL_GROUPS)[number]): typeof TUTORIAL_PAGES {
    return TUTORIAL_PAGES.filter((p) => p.group === group);
  }
</script>

<svelte:head>
  <title>Tutorial, {SITE_NAME}</title>
  <meta
    name="description"
    content="A short tutorial for PDFy. Open a folder, pick what to print, save the PDF. Plus deeper pages on covers, table of contents, headers / footers, and templating."
  />
  <meta property="og:title" content={`Tutorial, ${SITE_NAME}`} />
  <meta
    property="og:description"
    content="Three minutes to your first searchable PDF, plus a reference for the bits worth customising."
  />
</svelte:head>

<header class="mb-12">
  <p class="text-muted-foreground mb-3 font-mono text-xs tracking-wider uppercase">Tutorial</p>
  <h1 class="text-4xl leading-tight font-semibold tracking-tight sm:text-5xl">How PDFy works.</h1>
  <p class="text-muted-foreground mt-5 max-w-2xl text-lg leading-relaxed">
    Three minutes to your first PDF if you only read the first three pages. The rest is here when
    you want to make the output yours.
  </p>
</header>

<section class="mb-16 space-y-3">
  <p class="text-foreground/85 leading-relaxed">
    Pick a folder, tick the files you want, click print. PDFy turns it into a clean, searchable,
    text-based PDF. Everything happens in your browser, nothing is uploaded. Most users finish a
    first export in under two minutes.
  </p>
  <p class="text-foreground/85 leading-relaxed">
    The pages below split into four short groups. <strong>Get started</strong> is the happy path.
    <strong>Customise</strong>
    covers covers, contents, and headers.
    <strong>Reference</strong> lists every variable, setting, and shortcut.
    <strong>Help</strong> is for when something feels off.
  </p>
</section>

<div class="space-y-12">
  {#each TUTORIAL_GROUPS as group (group)}
    {@const pages = pagesIn(group)}
    <section>
      <h2 class="text-foreground mb-4 text-xl font-semibold tracking-tight">
        {group}
      </h2>
      <ul class="border-foreground/10 divide-foreground/10 divide-y border-y">
        {#each pages as p (p.slug)}
          <li>
            <a
              href={tutorialHref(p.slug)}
              class="group flex items-center gap-4 py-4 transition-colors"
            >
              <div class="min-w-0 flex-1">
                <p
                  class="group-hover:text-primary text-foreground text-base font-medium tracking-tight transition-colors"
                >
                  {p.title}
                </p>
                <p class="text-muted-foreground mt-0.5 text-sm">{p.summary}</p>
              </div>
              <ArrowRight
                class="text-muted-foreground/60 group-hover:text-primary size-4 shrink-0 transition-all group-hover:translate-x-0.5"
              />
            </a>
          </li>
        {/each}
      </ul>
    </section>
  {/each}
</div>

<Pagination />
