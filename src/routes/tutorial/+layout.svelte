<script lang="ts">
  import { page } from "$app/state";
  import { Button } from "$lib/components/ui/button";
  import Logo from "$lib/components/Logo.svelte";
  import Github from "$lib/components/icons/Github.svelte";
  import ArrowRight from "@lucide/svelte/icons/arrow-right";
  import Sidebar from "$lib/components/tutorial/Sidebar.svelte";
  import { SITE_NAME, SITE_URL, SITE_AUTHOR, SITE_AUTHOR_URL, SITE_REPO } from "$lib/site";
  import { TUTORIAL_PAGES, tutorialHref } from "$lib/tutorial";

  let { children } = $props();

  // Derive the current tutorial page from the URL so the breadcrumb knows
  // its own title without each page having to declare it again.
  const currentSlug = $derived(page.url.pathname.replace(/^\/tutorial\/?/, ""));
  const currentPage = $derived(
    TUTORIAL_PAGES.find((p) => p.slug === currentSlug) ?? TUTORIAL_PAGES[0],
  );

  // BreadcrumbList JSON-LD: Home > Tutorial > {Page}. The overview page
  // gets a two-step trail (Home > Tutorial) since it IS the tutorial root.
  const breadcrumb = $derived.by(() => {
    const items: Array<{
      "@type": "ListItem";
      position: number;
      name: string;
      item: string;
    }> = [
      { "@type": "ListItem", position: 1, name: SITE_NAME, item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Tutorial", item: `${SITE_URL}/tutorial` },
    ];
    if (currentPage.slug) {
      items.push({
        "@type": "ListItem",
        position: 3,
        name: currentPage.title,
        item: `${SITE_URL}${tutorialHref(currentPage.slug)}`,
      });
    }
    return { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: items };
  });

  /* eslint-disable no-useless-escape */
  const breadcrumbHtml = $derived(
    `<script type="application/ld+json">${JSON.stringify(breadcrumb)}<\/script>`,
  );
  /* eslint-enable no-useless-escape */
</script>

<svelte:head>
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html breadcrumbHtml}
</svelte:head>

<div class="bg-background text-foreground flex min-h-screen flex-col">
  <header
    class="border-foreground/15 supports-[backdrop-filter]:bg-background/70 sticky top-0 z-30 border-b backdrop-blur-md"
  >
    <nav class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 sm:px-8">
      <a href="/" class="flex items-center gap-2 text-base font-semibold tracking-tight">
        <Logo class="size-6" />
        <span>{SITE_NAME}</span>
      </a>
      <div class="flex items-center gap-2">
        <Button
          href={SITE_REPO}
          variant="ghost"
          size="sm"
          target="_blank"
          rel="noopener noreferrer"
          class="gap-2"
          aria-label="GitHub repository"
        >
          <Github class="size-4" />
        </Button>
        <Button href="/editor" size="sm" class="group gap-2">
          Open App
          <ArrowRight class="size-4 transition-transform group-hover:translate-x-0.5" />
        </Button>
      </div>
    </nav>
  </header>

  <main class="flex-grow">
    <div class="mx-auto max-w-6xl px-6 sm:px-8">
      <div class="lg:grid lg:grid-cols-[16rem_1fr] lg:gap-12">
        <!-- Sidebar: sticky on desktop, inline at top on mobile -->
        <aside
          class="border-foreground/10 lg:sticky lg:top-[68px] lg:max-h-[calc(100vh-68px)] lg:self-start lg:overflow-y-auto lg:border-r-0 lg:py-10"
        >
          <div class="border-foreground/15 mb-6 border-b py-6 lg:hidden">
            <p class="text-muted-foreground mb-3 font-mono text-[10px] tracking-wider uppercase">
              Tutorial
            </p>
            <Sidebar />
          </div>
          <div class="hidden lg:block">
            <p
              class="text-muted-foreground mb-5 px-3 font-mono text-[10px] tracking-wider uppercase"
            >
              Tutorial
            </p>
            <Sidebar />
          </div>
        </aside>

        <article class="min-w-0 py-10 lg:py-16">
          {@render children()}
        </article>
      </div>
    </div>
  </main>

  <hr class="border-foreground/15 mx-auto w-3/5" aria-hidden="true" />

  <footer class="relative px-6 py-8">
    <div
      class="text-muted-foreground mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-sm sm:flex-row"
    >
      <p>&copy; {new Date().getFullYear()} {SITE_NAME} &middot; GPL v3.0</p>
      <div class="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
        <a href="/tutorial" class="text-foreground" aria-current="page">Tutorial</a>
        <a href="/faq" class="hover:text-foreground transition-colors">FAQ</a>
        <a href="/privacy" class="hover:text-foreground transition-colors">Privacy</a>
        <a
          href={SITE_REPO}
          target="_blank"
          rel="noopener noreferrer"
          class="hover:text-foreground transition-colors"
        >
          GitHub
        </a>
        <a
          href={SITE_AUTHOR_URL}
          target="_blank"
          rel="noopener noreferrer"
          class="hover:text-foreground transition-colors"
        >
          {SITE_AUTHOR}
        </a>
      </div>
    </div>
  </footer>
</div>
