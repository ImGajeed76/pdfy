<script lang="ts">
  import { onMount } from "svelte";
  import { Button } from "$lib/components/ui/button";
  import Logo from "$lib/components/Logo.svelte";
  import Github from "$lib/components/icons/Github.svelte";
  import { reveal } from "$lib/actions/reveal";
  import ArrowRight from "@lucide/svelte/icons/arrow-right";
  import Folder from "@lucide/svelte/icons/folder";
  import ListChecks from "@lucide/svelte/icons/list-checks";
  import Printer from "@lucide/svelte/icons/printer";
  import Lock from "@lucide/svelte/icons/lock";
  import Sparkles from "@lucide/svelte/icons/sparkles";
  import Code from "@lucide/svelte/icons/code";
  import Search from "@lucide/svelte/icons/search";
  import { SITE_URL, SITE_NAME, SITE_AUTHOR, SITE_AUTHOR_URL, SITE_REPO } from "$lib/site";

  let stars = $state<number | null>(null);

  onMount(async () => {
    try {
      const res = await fetch("https://api.github.com/repos/ImGajeed76/pdfy");
      if (res.ok) {
        const data = await res.json();
        if (typeof data.stargazers_count === "number") stars = data.stargazers_count;
      }
    } catch {
      // GitHub API unreachable; just hide the count
    }
  });

  function formatStars(n: number): string {
    if (n < 1000) return String(n);
    const k = Math.round((n / 1000) * 10) / 10;
    return String(k).replace(/\.0$/, "") + "k";
  }

  // Linear-style bordered hover: each card's ::after gradient tracks the cursor.
  // Updating per-card vars on every mouse move in the section means all cards
  // light up simultaneously and the glow doesn't flicker between cards.
  function handleCardMove(event: MouseEvent): void {
    const container = event.currentTarget as HTMLElement;
    for (const card of container.querySelectorAll<HTMLElement>(".trust-card")) {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mouse-x", `${event.clientX - rect.left}px`);
      card.style.setProperty("--mouse-y", `${event.clientY - rect.top}px`);
    }
  }

  const steps = [
    {
      icon: Folder,
      title: "Pick a folder",
      description: "Choose your project from your computer.",
    },
    {
      icon: ListChecks,
      title: "Tick the files",
      description: "Select what you want, tree included.",
    },
    {
      icon: Printer,
      title: "Print to PDF",
      description: "One click, browser-native.",
    },
  ];

  const trust = [
    {
      icon: Lock,
      title: "Local",
      description: "Your files never leave your browser.",
    },
    {
      icon: Sparkles,
      title: "Free",
      description: "Forever. No signup.",
    },
    {
      icon: Code,
      title: "Open source",
      description: "Inspect the code on GitHub.",
    },
    {
      icon: Search,
      title: "Searchable",
      description: "Real text, not screenshots.",
    },
  ];

  // SoftwareApplication schema, rendered only on the home page so search
  // engines associate it with the site root rather than every URL.
  const softwareJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE_NAME,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web Browser",
    url: `${SITE_URL}/`,
    description:
      "PDFy turns a folder of source code into a single searchable PDF with syntax highlighting. Runs in the browser, files never leave your machine.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    creator: { "@type": "Person", name: SITE_AUTHOR, url: SITE_AUTHOR_URL },
    sameAs: [SITE_REPO],
  };
  /* eslint-disable no-useless-escape */
  const softwareJsonLdHtml = `<script type="application/ld+json">${JSON.stringify(softwareJsonLd)}<\/script>`;
  /* eslint-enable no-useless-escape */
</script>

<svelte:head>
  <title>PDFy, code to PDF in the browser</title>
  <meta
    name="description"
    content="PDFy turns a folder of source code into a single searchable PDF with syntax highlighting. Runs entirely in your browser. No uploads, no signup."
  />
  <meta property="og:title" content="PDFy, code to PDF in the browser" />
  <meta
    property="og:description"
    content="Pick a folder, click print. Your code never leaves the browser."
  />
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html softwareJsonLdHtml}
</svelte:head>

<div class="bg-background text-foreground flex min-h-screen flex-col">
  <header
    class="border-foreground/15 supports-[backdrop-filter]:bg-background/70 sticky top-0 z-30 border-b backdrop-blur-md"
  >
    <nav class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 sm:px-8">
      <a href="/" class="flex items-center gap-2 text-base font-semibold tracking-tight">
        <Logo class="size-6" />
        <span>PDFy</span>
      </a>
      <div class="flex items-center gap-2">
        <Button
          href="https://github.com/ImGajeed76/pdfy"
          variant="ghost"
          size="sm"
          target="_blank"
          rel="noopener noreferrer"
          class="gap-2"
          aria-label={stars !== null
            ? `GitHub repository, ${formatStars(stars)} stars`
            : "GitHub repository"}
        >
          <Github class="size-4" />
          {#if stars !== null}
            <span class="text-sm leading-none tabular-nums">{formatStars(stars)}</span>
          {/if}
        </Button>
        <Button href="/editor" size="sm" class="group gap-2">
          Open App
          <ArrowRight class="size-4 transition-transform group-hover:translate-x-0.5" />
        </Button>
      </div>
    </nav>
  </header>

  <main class="flex-grow">
    <!-- HERO -->
    <section class="relative overflow-hidden px-6 pt-24 pb-32 sm:pt-32 sm:pb-40">
      <!-- Background grid pattern -->
      <div
        aria-hidden="true"
        class="text-foreground absolute inset-0 -z-20 opacity-[0.05]"
        style="background-image: linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px); background-size: 56px 56px;"
      ></div>
      <!-- Background fade so grid doesn't reach the edges -->
      <div
        aria-hidden="true"
        class="from-background pointer-events-none absolute inset-0 -z-10 bg-radial-[ellipse_at_center] from-30% to-transparent"
      ></div>
      <!-- Primary glow -->
      <div
        aria-hidden="true"
        class="bg-primary pointer-events-none absolute -top-32 left-1/2 -z-10 h-[520px] w-[820px] -translate-x-1/2 rounded-full opacity-15 blur-[140px]"
      ></div>

      <div
        class="relative z-10 mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-16"
      >
        <!-- Left: text -->
        <div class="text-left">
          <h1
            class="text-5xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-6xl md:text-7xl"
          >
            Folder in.<br /><span class="text-primary">Searchable</span> PDF out.
          </h1>

          <p class="text-muted-foreground mt-7 max-w-xl text-lg sm:text-xl">
            Pick a folder, click print. Everything happens in your browser.
          </p>

          <div class="mt-10 flex flex-wrap items-center gap-3">
            <Button href="/editor" size="lg" class="group h-12 gap-2 px-6 text-base">
              Open PDFy
              <ArrowRight class="size-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              href="https://github.com/ImGajeed76/pdfy"
              variant="ghost"
              size="lg"
              target="_blank"
              rel="noopener noreferrer"
              class="h-12 gap-2 px-5 text-base"
            >
              <Github class="size-4" />
              GitHub
            </Button>
          </div>

          <p class="text-muted-foreground/80 mt-8 font-mono text-xs tracking-wide">
            No uploads &nbsp;·&nbsp; No installs &nbsp;·&nbsp; No signup
          </p>
        </div>

        <!-- Right: fox -->
        <div class="hidden lg:flex lg:justify-end">
          <img
            src="/foxes/with-paper-640.webp"
            alt=""
            aria-hidden="true"
            class="pointer-events-none size-72 -rotate-6 select-none xl:size-80"
          />
        </div>
      </div>
    </section>

    <hr class="border-foreground/15 mx-auto w-3/5" aria-hidden="true" />

    <!-- HOW IT WORKS -->
    <section class="px-6 py-24 sm:py-32" use:reveal>
      <div class="mx-auto max-w-5xl">
        <div class="mb-14 flex flex-col items-center text-center">
          <span class="text-muted-foreground mb-3 font-mono text-xs tracking-wider uppercase">
            How it works
          </span>
          <h2 class="text-3xl font-semibold tracking-tight sm:text-4xl">Pick. Tick. Print.</h2>
        </div>
        <div class="bg-border/60 grid grid-cols-1 gap-px sm:grid-cols-3">
          {#each steps as step, i (step.title)}
            {@const Icon = step.icon}
            <div class="bg-background group flex flex-col gap-4 p-8">
              <div class="flex items-center justify-between">
                <span class="text-muted-foreground/70 font-mono text-sm tabular-nums">
                  0{i + 1}
                </span>
                <Icon class="text-primary size-5 transition-transform group-hover:scale-110" />
              </div>
              <h3 class="text-xl font-medium">{step.title}</h3>
              <p class="text-muted-foreground">{step.description}</p>
            </div>
          {/each}
        </div>
      </div>
    </section>

    <hr class="border-foreground/15 mx-auto w-3/5" aria-hidden="true" />

    <!-- TRUST -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <section class="trust-section px-6 py-24 sm:py-32" onmousemove={handleCardMove} use:reveal>
      <div class="mx-auto max-w-4xl">
        <div class="mb-14 flex flex-col items-center text-center">
          <span class="text-muted-foreground mb-3 font-mono text-xs tracking-wider uppercase">
            Why pdfy
          </span>
          <h2 class="text-3xl font-semibold tracking-tight sm:text-4xl">What you get.</h2>
        </div>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {#each trust as item (item.title)}
            {@const Icon = item.icon}
            <div class="trust-card">
              <div class="trust-card-inner">
                <div
                  class="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center"
                >
                  <Icon class="size-5" />
                </div>
                <div class="flex flex-col gap-1.5">
                  <h3 class="text-lg font-medium">{item.title}</h3>
                  <p class="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    </section>

    <hr class="border-foreground/15 mx-auto w-3/5" aria-hidden="true" />

    <!-- BOTTOM CTA -->
    <section class="relative overflow-hidden px-6 py-28 sm:py-36" use:reveal>
      <div
        aria-hidden="true"
        class="bg-primary pointer-events-none absolute bottom-0 left-1/2 -z-10 h-[300px] w-[600px] -translate-x-1/2 translate-y-1/2 rounded-full opacity-15 blur-[120px]"
      ></div>

      <div class="mx-auto flex max-w-3xl flex-col items-center text-center">
        <h2 class="text-3xl font-semibold tracking-tight sm:text-4xl">Ready when you are.</h2>
        <p class="text-muted-foreground mt-3">No setup. Just a folder and a click.</p>

        <!-- Trotting fox + button: fox runs in toward the button on hover -->
        <div class="mt-10 flex items-center justify-center gap-1">
          <img
            src="/foxes/trotting-192.webp"
            alt=""
            aria-hidden="true"
            class="hero-cta-fox size-20 -scale-x-100 select-none sm:size-24"
          />
          <Button href="/editor" size="lg" class="group h-12 gap-2 px-6 text-base">
            Open PDFy
            <ArrowRight class="size-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    </section>
  </main>

  <hr class="border-foreground/15 mx-auto w-3/5" aria-hidden="true" />

  <!-- FOOTER -->
  <footer class="relative px-6 py-8">
    <div
      class="text-muted-foreground mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-sm sm:flex-row"
    >
      <div class="flex items-center gap-3">
        <img
          src="/foxes/sleeping-160.webp"
          alt=""
          aria-hidden="true"
          class="pointer-events-none size-16 shrink-0 select-none sm:size-20"
          style="filter: saturate(1.1);"
        />
        <p>&copy; {new Date().getFullYear()} PDFy &middot; GPL v3.0</p>
      </div>
      <div class="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
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

<style>
  /* Trotting fox subtly trots toward the CTA button when the user hovers
     anywhere in the bottom CTA section. Tiny detail, signals momentum. */
  .hero-cta-fox {
    transition: transform 250ms cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  section:hover .hero-cta-fox {
    transform: translateX(6px);
  }

  /* Linear-style bordered hover effect for the trust cards.
   *
   * The card has a light background (= visible "border" color). A content box
   * inside with `margin: 1px` covers everything except a 1px ring, showing the
   * parent's background through that gap. A pseudo-element sits behind the
   * content with a mouse-tracking radial gradient — only visible through the
   * ring, so the effect is purely on the border.
   *
   * The :hover trigger is on the section, not on each card, so the glow doesn't
   * flicker as the cursor crosses the gap between cards. */

  .trust-card {
    position: relative;
    background: var(--border);
    isolation: isolate;
    overflow: hidden;
  }

  .trust-card::after {
    content: "";
    position: absolute;
    inset: 0;
    background: radial-gradient(
      280px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
      color-mix(in oklch, var(--primary) 75%, transparent),
      transparent 45%
    );
    opacity: 0;
    transition: opacity 500ms ease-out;
    pointer-events: none;
    z-index: 1;
  }

  .trust-section:hover .trust-card::after {
    opacity: 1;
  }

  .trust-card-inner {
    position: relative;
    z-index: 2;
    margin: 1px;
    min-height: calc(100% - 2px);
    background: var(--card);
    padding: 1.5rem;
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    box-sizing: border-box;
  }
</style>
