<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import Logo from "$lib/components/Logo.svelte";
  import Github from "$lib/components/icons/Github.svelte";
  import ArrowRight from "@lucide/svelte/icons/arrow-right";
  import ChevronDown from "@lucide/svelte/icons/chevron-down";
  import { SITE_NAME, SITE_URL, SITE_AUTHOR, SITE_AUTHOR_URL, SITE_REPO } from "$lib/site";

  // FAQ content is rendered twice: once as visible <details> entries, once
  // as FAQPage JSON-LD so Google can surface rich snippets.
  // - `a` is the answer text shown to humans AND embedded in the JSON-LD.
  // - `links` is optional, only rendered in the visible page (not in JSON-LD)
  //   so the schema stays plain-text while the page gets real internal links.
  type FaqLink = { href: string; label: string };
  const faqs: { q: string; a: string; links?: FaqLink[] }[] = [
    {
      q: "Do my files leave the browser?",
      a: "No. PDFy uses the browser's File System Access API to read your folder, runs every step locally, and hands the result to your browser's print dialog. There is no upload step at any point.",
      links: [{ href: "/privacy", label: "Privacy page" }],
    },
    {
      q: "Is PDFy free?",
      a: "Yes, free forever. PDFy is open-source under GPL v3 and there is no account to create, no email required, and no paywalled features. The source is on GitHub if you want to inspect it or fork it.",
    },
    {
      q: "Can I use PDFy to submit a coding assignment?",
      a: "Yes. PDFy is a popular way to turn a coding assignment into a single PDF that professors and graders can read. The output has syntax highlighting, optional line numbers, a cover page with your name and project title, and a table of contents. Everything stays on your machine while you build it, and the final PDF is plain searchable text, so an instructor can copy snippets out of it for feedback.",
      links: [
        { href: "/tutorial/open-a-folder", label: "Open a folder" },
        { href: "/tutorial/cover-page", label: "Cover page" },
        { href: "/tutorial/per-file-overrides", label: "Line numbers and overrides" },
      ],
    },
    {
      q: "Which programming languages are supported for syntax highlighting?",
      a: "PDFy uses Shiki, which supports over 200 languages. The common ones include JavaScript, TypeScript, Python, Java, C, C++, C#, Go, Rust, Ruby, PHP, Swift, Kotlin, Scala, Dart, R, Julia, Lua, Perl, Elixir, Erlang, Haskell, OCaml, F#, Clojure, Shell, Bash, Zsh, PowerShell, SQL, HTML, CSS, SCSS, JSON, YAML, TOML, XML, Markdown, GraphQL, Dockerfile, Nginx, Makefile, Vim script, Solidity, Zig, Nim, V, and many more. Plain text and Markdown render cleanly even when no specific language is detected.",
    },
    {
      q: "Does PDFy include line numbers?",
      a: "Yes. Line numbers are off by default to keep the output clean, but you can turn them on per file from the editor's per-file overrides. Useful for code reviews, assignment submissions where the grader needs to refer to specific lines, and for any handout where the reader will discuss the code with someone else.",
      links: [
        { href: "/tutorial/per-file-overrides", label: "Per-file overrides" },
        { href: "/tutorial/settings", label: "Settings reference" },
      ],
    },
    {
      q: "Which browsers work?",
      a: "Anything with the File System Access API: Chrome, Edge, Brave, Opera, Arc. Firefox and Safari haven't shipped the API yet, so PDFy can't open folders there. The site itself loads fine and explains the situation if you visit on an unsupported browser.",
      links: [{ href: "/tutorial/browser-support", label: "Browser support details" }],
    },
    {
      q: "Does the PDF stay searchable?",
      a: "Yes. The output is real text, not a screenshot. You can Ctrl-F your way through it, copy lines, and let any code-aware tool index it. Syntax highlighting is preserved as styled text, not as images, so file size stays small and the output is friendly to grep, archive search, and copyright registration tooling.",
    },
    {
      q: "What file types does it handle?",
      a: "Source code in any language Shiki supports gets syntax-highlighted. Plain text and Markdown are formatted nicely. Images get embedded. Binary files are skipped with a placeholder. PDFs already in your folder are rasterised and embedded page-by-page.",
    },
    {
      q: "How big a project can I print?",
      a: "Limited mostly by your browser's memory and how much of your folder you actually pick. Hundreds of files is comfortable. Tens of thousands works but the preview slows down. There is no server-side cap because there is no server.",
    },
    {
      q: "Can I customise the cover, table of contents, headers and footers?",
      a: "Yes. The cover and TOC titles are click-to-edit. Headers and footers have six slots (top and bottom, left, center, right) that accept Mustache templates with variables like {{title}}, {{page}}, {{path}}, {{date}}.",
      links: [
        { href: "/tutorial/cover-page", label: "Cover page" },
        { href: "/tutorial/table-of-contents", label: "Table of contents" },
        { href: "/tutorial/headers-and-footers", label: "Headers and footers" },
        { href: "/tutorial/templating", label: "Templating variables" },
      ],
    },
    {
      q: "Does it work offline?",
      a: "After the first visit, the page itself is cached by the browser. The first time you use a new language for syntax highlighting, the grammar gets fetched from a CDN. Once it's cached, subsequent runs are fully offline.",
    },
    {
      q: "Will my company's repo be safe to use this on?",
      a: "Yes. Nothing is uploaded, no third party sees your code, and there is no telemetry tied to file contents. The privacy page lists exactly what crosses the network (analytics page views, the GitHub API call for the home page's star count, and the static site assets themselves).",
      links: [{ href: "/privacy", label: "Privacy page" }],
    },
    {
      q: "Why use PDFy instead of just printing each file?",
      a: "PDFy aggregates many files into one document, generates a cover and TOC, runs syntax highlighting consistently, paginates wrap-aware so long lines don't break, and lets you reorder or rename sections without touching the source files.",
    },
  ];

  function slug(s: string): string {
    return s
      .toLowerCase()
      .replace(/['"?]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: SITE_NAME, item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "FAQ", item: `${SITE_URL}/faq` },
    ],
  };

  /* eslint-disable no-useless-escape */
  const faqJsonLdHtml = `<script type="application/ld+json">${JSON.stringify(faqJsonLd)}<\/script>`;
  const breadcrumbJsonLdHtml = `<script type="application/ld+json">${JSON.stringify(breadcrumbJsonLd)}<\/script>`;
  /* eslint-enable no-useless-escape */
</script>

<svelte:head>
  <title>FAQ, {SITE_NAME}</title>
  <meta
    name="description"
    content="Common questions about PDFy: which programming languages are supported, using PDFy for coding assignments, line numbers, browser support, file size limits, and where your code goes."
  />
  <meta property="og:title" content={`FAQ, ${SITE_NAME}`} />
  <meta
    property="og:description"
    content="Languages supported, using PDFy for assignments, line numbers, browser support, and what happens to your code."
  />
  <meta property="og:type" content="website" />
  <!-- eslint-disable svelte/no-at-html-tags -->
  {@html faqJsonLdHtml}
  {@html breadcrumbJsonLdHtml}
  <!-- eslint-enable svelte/no-at-html-tags -->
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
    <!-- HERO: heading on the left, sitting fox on the right. -->
    <section class="relative overflow-hidden px-6 pt-24 pb-16 sm:pt-32 sm:pb-24">
      <div
        aria-hidden="true"
        class="bg-primary pointer-events-none absolute -top-32 left-1/2 -z-10 h-[420px] w-[700px] -translate-x-1/2 rounded-full opacity-[0.08] blur-[140px]"
      ></div>

      <div class="mx-auto grid max-w-5xl items-center gap-12 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
        <div class="text-left">
          <span class="text-muted-foreground mb-4 block font-mono text-xs tracking-wider uppercase">
            Frequently asked
          </span>
          <h1 class="text-4xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-5xl">
            Questions people actually ask.
          </h1>
          <p class="text-muted-foreground mt-6 max-w-lg text-lg leading-relaxed sm:text-xl">
            The short list. If yours isn't here, the
            <a
              href={SITE_REPO}
              target="_blank"
              rel="noopener noreferrer"
              class="text-primary hover:text-primary/80 underline underline-offset-4"
            >
              GitHub issues</a
            > are open.
          </p>
        </div>

        <div class="hidden lg:flex lg:justify-end">
          <img
            src="/foxes/sitting-640.webp"
            alt=""
            aria-hidden="true"
            class="pointer-events-none size-72 select-none xl:size-80"
            style="filter: saturate(1.05);"
          />
        </div>
      </div>
    </section>

    <hr class="border-foreground/15 mx-auto w-3/5" aria-hidden="true" />

    <article class="mx-auto max-w-3xl px-6 py-16 sm:py-24">
      <ul class="divide-foreground/10 divide-y">
        {#each faqs as f, i (f.q)}
          {@const id = slug(f.q)}
          <li {id} class="scroll-mt-24">
            <details class="faq-item group">
              <summary
                class="hover:text-primary flex cursor-pointer items-start gap-6 py-6 transition-colors select-none"
              >
                <span class="text-muted-foreground/60 mt-1 font-mono text-xs tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  class="flex-1 text-lg leading-snug font-medium tracking-tight text-balance sm:text-xl"
                >
                  {f.q}
                </span>
                <ChevronDown
                  class="text-muted-foreground/60 mt-1.5 size-5 shrink-0 transition-transform group-open:rotate-180"
                />
              </summary>
              <div class="pb-6 pl-12">
                <p class="text-muted-foreground text-base leading-relaxed sm:text-lg">
                  {f.a}
                </p>
                {#if f.links && f.links.length > 0}
                  <p
                    class="text-muted-foreground/80 mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-2 text-sm"
                  >
                    <span class="font-mono text-[10px] tracking-wider uppercase">Related</span>
                    {#each f.links as link (link.href)}
                      <a
                        href={link.href}
                        class="text-primary hover:text-primary/80 underline underline-offset-4"
                      >
                        {link.label}
                      </a>
                    {/each}
                  </p>
                {/if}
              </div>
            </details>
          </li>
        {/each}
      </ul>
    </article>
  </main>

  <hr class="border-foreground/15 mx-auto w-3/5" aria-hidden="true" />

  <!-- BOTTOM CTA: matches the home page's bottom CTA. -->
  <section class="relative overflow-hidden px-6 py-24 sm:py-32">
    <div
      aria-hidden="true"
      class="bg-primary pointer-events-none absolute bottom-0 left-1/2 -z-10 h-[300px] w-[600px] -translate-x-1/2 translate-y-1/2 rounded-full opacity-15 blur-[120px]"
    ></div>

    <div class="mx-auto flex max-w-3xl flex-col items-center text-center">
      <h2 class="text-3xl font-semibold tracking-tight sm:text-4xl">Try it.</h2>
      <p class="text-muted-foreground mt-3">A folder, a click, a PDF. That's the whole pitch.</p>
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

  <hr class="border-foreground/15 mx-auto w-3/5" aria-hidden="true" />

  <footer class="relative px-6 py-8">
    <div
      class="text-muted-foreground mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-sm sm:flex-row"
    >
      <p>&copy; {new Date().getFullYear()} {SITE_NAME} &middot; GPL v3.0</p>
      <div class="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
        <a href="/tutorial" class="hover:text-foreground transition-colors">Tutorial</a>
        <a href="/faq" class="text-foreground" aria-current="page">FAQ</a>
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
  /* Hide the default <details> marker; the chevron handles the affordance. */
  summary::-webkit-details-marker {
    display: none;
  }
  summary {
    list-style: none;
  }
</style>
