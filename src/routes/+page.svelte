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
      title: "Pick a project folder",
      description: "Open any local folder of source code.",
    },
    {
      icon: ListChecks,
      title: "Tick the files",
      description: "Choose which files go in, in any order.",
    },
    {
      icon: Printer,
      title: "Print to PDF",
      description: "One click, syntax highlighting included.",
    },
  ];

  const trust = [
    {
      icon: Lock,
      title: "Local and private",
      description: "Your code stays in the browser. No uploads, ever.",
    },
    {
      icon: Sparkles,
      title: "Free forever",
      description: "No signup, no paywall, no email required.",
    },
    {
      icon: Code,
      title: "Open source",
      description: "GPL v3 on GitHub. Inspect, fork, self-host.",
    },
    {
      icon: Search,
      title: "Searchable text",
      description: "Real text with syntax highlighting, not screenshots.",
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
    featureList: [
      "Convert source code to PDF with syntax highlighting",
      "Searchable, text-based output (not screenshots)",
      "Wrap-aware pagination preserves long lines",
      "Cover page and table of contents",
      "Customizable headers and footers with templating",
      "Optional line numbers",
      "Respects .gitignore by default",
      "Runs entirely in the browser, no upload",
      "Free and open source under GPL v3",
    ],
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    creator: { "@type": "Person", name: SITE_AUTHOR, url: SITE_AUTHOR_URL },
    sameAs: [SITE_REPO],
  };
  /* eslint-disable no-useless-escape */
  const softwareJsonLdHtml = `<script type="application/ld+json">${JSON.stringify(softwareJsonLd)}<\/script>`;
  /* eslint-enable no-useless-escape */
</script>

<svelte:head>
  <title>PDFy, free code to PDF converter in your browser</title>
  <meta
    name="description"
    content="Convert a folder of source code into a single searchable PDF with syntax highlighting. Free, open source, no upload. Great for coding assignments, code reviews, archives, and copyright filings."
  />
  <meta
    name="keywords"
    content="code to pdf, source code to pdf, syntax highlighting pdf, print code as pdf, github repo to pdf, coding assignment pdf, source code archive"
  />
  <meta property="og:title" content="PDFy, free code to PDF converter in your browser" />
  <meta
    property="og:description"
    content="Turn a folder of source code into one searchable PDF with syntax highlighting. Runs in your browser, nothing gets uploaded."
  />
  <meta property="og:type" content="website" />
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
            Code folder in.<br /><span class="text-primary">Searchable</span> PDF out.
          </h1>

          <p class="text-muted-foreground mt-7 max-w-xl text-lg sm:text-xl">
            Turn a project into one searchable PDF with syntax highlighting. Free, open source, runs
            in your browser, nothing gets uploaded.
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
            How to turn code into a PDF
          </span>
          <h2 class="text-3xl font-semibold tracking-tight sm:text-4xl">Pick. Tick. Print.</h2>
          <p class="text-muted-foreground mt-4 max-w-xl">
            From a project folder to a finished, searchable PDF in three steps. No setup, no command
            line.
          </p>
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
            Why developers use PDFy
          </span>
          <h2 class="text-3xl font-semibold tracking-tight sm:text-4xl">
            Built for source code, not screenshots.
          </h2>
          <p class="text-muted-foreground mt-4 max-w-xl">
            Real text you can copy, search, and grep. Wrap-aware pagination so long lines don't
            break. Made for assignments, code reviews, and anywhere a screenshot won't cut it.
          </p>
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

    <!-- USE CASES: editorial vertical list. Numbered chapters, no icons, no
         cards. The shape contrast against the trust-card grid above keeps the
         eye moving. Each row gets room for keyword-rich copy without feeling
         like another box on the page. -->
    <section class="px-6 py-24 sm:py-32" use:reveal>
      <div class="mx-auto max-w-3xl">
        <div class="mb-14 max-w-xl">
          <span class="text-muted-foreground mb-3 block font-mono text-xs tracking-wider uppercase">
            What people use PDFy for
          </span>
          <h2 class="text-3xl font-semibold tracking-tight sm:text-4xl">
            One tool, every reason to print code.
          </h2>
          <p class="text-muted-foreground mt-4 leading-relaxed">
            From a CS101 submission to a copyright filing, the workflow is the same: pick the
            folder, tick the files, save the PDF.
          </p>
        </div>

        <ul class="border-foreground/10 divide-foreground/10 divide-y border-y">
          <li class="grid grid-cols-[3rem_1fr] gap-6 py-7 sm:grid-cols-[4rem_1fr] sm:gap-8 sm:py-8">
            <span
              class="text-muted-foreground/70 font-mono text-sm tabular-nums sm:text-base"
              aria-hidden="true">01</span
            >
            <div>
              <h3 class="text-lg font-medium tracking-tight sm:text-xl">Coding assignments</h3>
              <p class="text-muted-foreground mt-2 leading-relaxed">
                Submit a whole project as one searchable PDF with syntax highlighting, line numbers,
                and a cover page. Most professors and graders accept exactly this format.
              </p>
            </div>
          </li>
          <li class="grid grid-cols-[3rem_1fr] gap-6 py-7 sm:grid-cols-[4rem_1fr] sm:gap-8 sm:py-8">
            <span
              class="text-muted-foreground/70 font-mono text-sm tabular-nums sm:text-base"
              aria-hidden="true">02</span
            >
            <div>
              <h3 class="text-lg font-medium tracking-tight sm:text-xl">
                Code reviews and handouts
              </h3>
              <p class="text-muted-foreground mt-2 leading-relaxed">
                Share a project with reviewers, mentors, or students offline. Real text means they
                can copy snippets, annotate the file, and grep it from the command line.
              </p>
            </div>
          </li>
          <li class="grid grid-cols-[3rem_1fr] gap-6 py-7 sm:grid-cols-[4rem_1fr] sm:gap-8 sm:py-8">
            <span
              class="text-muted-foreground/70 font-mono text-sm tabular-nums sm:text-base"
              aria-hidden="true">03</span
            >
            <div>
              <h3 class="text-lg font-medium tracking-tight sm:text-xl">Project archives</h3>
              <p class="text-muted-foreground mt-2 leading-relaxed">
                Snapshot a repository as a single self-contained file. Useful for long-term
                archives, portfolio projects, or freezing a working copy before a major rewrite.
              </p>
            </div>
          </li>
          <li class="grid grid-cols-[3rem_1fr] gap-6 py-7 sm:grid-cols-[4rem_1fr] sm:gap-8 sm:py-8">
            <span
              class="text-muted-foreground/70 font-mono text-sm tabular-nums sm:text-base"
              aria-hidden="true">04</span
            >
            <div>
              <h3 class="text-lg font-medium tracking-tight sm:text-xl">
                Copyright and IP filings
              </h3>
              <p class="text-muted-foreground mt-2 leading-relaxed">
                Produce a clean, paginated source listing for software copyright registrations or
                patent disclosures, locally and without uploading a byte.
              </p>
            </div>
          </li>
        </ul>

        <p class="text-muted-foreground mt-8 text-center text-sm sm:text-left">
          Want the full breakdown?
          <a
            href="/code-to-pdf"
            class="text-primary hover:text-primary/80 ml-1 inline-flex items-center gap-1 underline underline-offset-4"
          >
            Read the code-to-PDF guide
            <ArrowRight class="size-3.5" />
          </a>
        </p>
      </div>
    </section>

    <hr class="border-foreground/15 mx-auto w-3/5" aria-hidden="true" />

    <!-- LEARN MORE: short paragraph with contextual links into the docs.
         Internal links from body copy carry SEO weight; the footer doesn't. -->
    <section class="px-6 py-20 sm:py-24" use:reveal>
      <div class="mx-auto max-w-3xl text-center">
        <h2 class="text-2xl font-semibold tracking-tight sm:text-3xl">Learn more</h2>
        <p class="text-muted-foreground mt-4 leading-relaxed">
          Read the
          <a
            href="/tutorial"
            class="text-primary hover:text-primary/80 underline underline-offset-4"
            >three-step tutorial</a
          >
          to make your first PDF, customise the
          <a
            href="/tutorial/cover-page"
            class="text-primary hover:text-primary/80 underline underline-offset-4">cover page</a
          >
          and
          <a
            href="/tutorial/headers-and-footers"
            class="text-primary hover:text-primary/80 underline underline-offset-4"
            >headers and footers</a
          >
          with
          <a
            href="/tutorial/templating"
            class="text-primary hover:text-primary/80 underline underline-offset-4"
            >Mustache templates</a
          >, or skim the
          <a href="/faq" class="text-primary hover:text-primary/80 underline underline-offset-4"
            >FAQ</a
          >
          for what languages are supported, how big a project can be, and where your code goes.
        </p>
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
            class="pointer-events-none size-20 -scale-x-100 select-none sm:size-24"
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
        <a href="/tutorial" class="hover:text-foreground transition-colors">Tutorial</a>
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
