<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import Logo from "$lib/components/Logo.svelte";
  import Github from "$lib/components/icons/Github.svelte";
  import ArrowRight from "@lucide/svelte/icons/arrow-right";
  import GraduationCap from "@lucide/svelte/icons/graduation-cap";
  import FileSearch from "@lucide/svelte/icons/file-search";
  import Archive from "@lucide/svelte/icons/archive";
  import ScrollText from "@lucide/svelte/icons/scroll-text";
  import Briefcase from "@lucide/svelte/icons/briefcase";
  import Gavel from "@lucide/svelte/icons/gavel";
  import { reveal } from "$lib/actions/reveal";
  import { SITE_NAME, SITE_URL, SITE_AUTHOR, SITE_AUTHOR_URL, SITE_REPO } from "$lib/site";

  // Use-case driven structure: each section targets a real search intent.
  // The id is also the in-page anchor and is used by the on-page TOC.
  const sections = [
    { id: "students", label: "For students" },
    { id: "code-reviews", label: "For code reviews" },
    { id: "archive", label: "For archives" },
    { id: "portfolio", label: "For job applications" },
    { id: "copyright", label: "For copyright filings" },
    { id: "what-makes-it-good", label: "What makes the output good" },
    { id: "faq", label: "FAQ" },
  ];

  // FAQPage JSON-LD specific to this landing page. Different from /faq so we
  // target use-case search intents instead of generic feature questions.
  const faqs: { q: string; a: string }[] = [
    {
      q: "How do I convert a folder of source code to a PDF?",
      a: "Open PDFy, click Open folder, pick the project folder you want, tick the files in the print plan, and click Print to save the PDF. Everything runs in your browser, no upload, no install. The output is a single searchable PDF with syntax highlighting for over 200 programming languages.",
    },
    {
      q: "Is this code to PDF converter free?",
      a: "Yes. PDFy is free forever, open source under GPL v3, and there is no signup, no email, and no paywall. The code is on GitHub if you want to inspect or self-host it.",
    },
    {
      q: "Can I use this to submit a coding assignment as a PDF?",
      a: "Yes. PDFy is widely used for coding assignment submissions. The output is searchable, includes syntax highlighting, line numbers (optional), a cover page with your name and project title, and a table of contents. Most professors and graders accept this format directly.",
    },
    {
      q: "Does PDFy upload my code anywhere?",
      a: "No. PDFy uses the browser's File System Access API to read your folder locally and the browser's print dialog to produce the PDF. No file content ever leaves your machine. There is no server-side processing.",
    },
    {
      q: "Which programming languages does the syntax highlighter support?",
      a: "PDFy uses Shiki under the hood. It supports over 200 languages including Python, JavaScript, TypeScript, Java, C, C++, C#, Go, Rust, Ruby, PHP, Swift, Kotlin, Scala, Shell, SQL, HTML, CSS, JSON, YAML, Markdown, and many more.",
    },
    {
      q: "Can I convert a GitHub repository to PDF?",
      a: "Yes. Clone the repository to your machine first, then open the cloned folder in PDFy. PDFy works on any local folder, including the working copy of any Git repository. By default it respects .gitignore so node_modules and build artefacts are skipped.",
    },
  ];

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
      { "@type": "ListItem", position: 2, name: "Code to PDF", item: `${SITE_URL}/code-to-pdf` },
    ],
  };

  // HowTo JSON-LD: maps directly onto the three-step "How it works" we describe
  // so search engines understand the page is a how-to about converting code
  // to PDF.
  const howToJsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to convert source code to a PDF",
    description:
      "Turn a folder of source code into a single searchable PDF with syntax highlighting, runs entirely in your browser.",
    totalTime: "PT2M",
    tool: [{ "@type": "HowToTool", name: "PDFy" }],
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Open the project folder",
        text: "Open PDFy in a Chromium-based browser, click Open folder, and pick the local project folder you want to print.",
        url: `${SITE_URL}/tutorial/open-a-folder`,
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "Pick the files to include",
        text: "PDFy auto-fills a print plan with the project's source files. Reorder, rename, and add or remove files until the plan matches what you want in the PDF.",
        url: `${SITE_URL}/tutorial/pick-what-to-print`,
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "Save as PDF",
        text: "Click Print, then choose Save as PDF in the browser's print dialog. The result is a searchable PDF with syntax highlighting.",
        url: `${SITE_URL}/tutorial/save-the-pdf`,
      },
    ],
  };

  /* eslint-disable no-useless-escape */
  const faqJsonLdHtml = `<script type="application/ld+json">${JSON.stringify(faqJsonLd)}<\/script>`;
  const breadcrumbJsonLdHtml = `<script type="application/ld+json">${JSON.stringify(breadcrumbJsonLd)}<\/script>`;
  const howToJsonLdHtml = `<script type="application/ld+json">${JSON.stringify(howToJsonLd)}<\/script>`;
  /* eslint-enable no-useless-escape */
</script>

<svelte:head>
  <title>Code to PDF, free converter with syntax highlighting · {SITE_NAME}</title>
  <meta
    name="description"
    content="Convert source code to PDF with syntax highlighting, line numbers, and a cover page. Great for coding assignments, code reviews, project archives, and copyright filings. Free, open source, runs in your browser, no upload."
  />
  <meta
    name="keywords"
    content="code to pdf, source code to pdf, github repo to pdf, convert code to pdf, code pdf converter, syntax highlighting pdf, coding assignment pdf, code archive pdf, source code copyright pdf"
  />
  <meta property="og:title" content={`Code to PDF, free converter · ${SITE_NAME}`} />
  <meta
    property="og:description"
    content="Convert a folder of source code to a single searchable PDF with syntax highlighting. Free, open source, runs in your browser."
  />
  <meta property="og:type" content="article" />
  <!-- eslint-disable svelte/no-at-html-tags -->
  {@html faqJsonLdHtml}
  {@html breadcrumbJsonLdHtml}
  {@html howToJsonLdHtml}
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
    <!-- HERO: magazine-style float. The fox is float: right with shape-outside
         driven by its alpha channel, so the headline and paragraph wrap around
         the fox's silhouette instead of being column-locked. Long lines slide
         past the fox's narrow tail; short ones stay tucked to the left. -->
    <section class="relative overflow-hidden px-6 pt-24 pb-20 sm:pt-32 sm:pb-28">
      <div
        aria-hidden="true"
        class="bg-primary pointer-events-none absolute -top-32 left-1/2 -z-10 h-[420px] w-[700px] -translate-x-1/2 rounded-full opacity-[0.08] blur-[140px]"
      ></div>

      <div class="mx-auto max-w-5xl">
        <span class="text-muted-foreground mb-4 block font-mono text-xs tracking-wider uppercase">
          Code to PDF
        </span>

        <img
          src="/foxes/with-paper-640.webp"
          alt=""
          aria-hidden="true"
          width="640"
          height="640"
          class="hero-fox pointer-events-none mb-4 hidden select-none lg:block"
        />

        <h1 class="text-4xl leading-[1.05] font-semibold tracking-tight sm:text-5xl md:text-6xl">
          Convert source code to a <span class="text-primary">searchable PDF</span> in your browser.
        </h1>
        <p class="text-muted-foreground mt-6 text-lg leading-relaxed sm:text-xl">
          PDFy turns a folder of code into a single PDF with syntax highlighting, optional line
          numbers, a cover page, and a table of contents. Free, open source, runs locally, nothing
          gets uploaded.
        </p>

        <!-- The float ends here so buttons sit on a clean baseline below the fox. -->
        <div class="clear-right"></div>

        <div class="mt-8 flex flex-wrap items-center gap-3">
          <Button href="/editor" size="lg" class="group h-12 gap-2 px-6 text-base">
            Open PDFy
            <ArrowRight class="size-4 transition-transform group-hover:translate-x-1" />
          </Button>
          <Button href="/tutorial" variant="ghost" size="lg" class="h-12 gap-2 px-5 text-base">
            Read the tutorial
          </Button>
        </div>

        <p class="text-muted-foreground/80 mt-6 font-mono text-xs tracking-wide">
          No upload &nbsp;·&nbsp; No install &nbsp;·&nbsp; No signup
        </p>
      </div>
    </section>

    <!-- ON THIS PAGE -->
    <section class="px-6 pb-12">
      <nav class="mx-auto max-w-3xl" aria-label="On this page">
        <span
          class="text-muted-foreground/70 mb-3 block font-mono text-[10px] tracking-wider uppercase"
        >
          On this page
        </span>
        <ol class="text-muted-foreground grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
          {#each sections as s, i (s.id)}
            <li>
              <a
                href={`#${s.id}`}
                class="hover:text-primary inline-flex items-baseline gap-3 transition-colors"
              >
                <span class="text-muted-foreground/50 font-mono text-xs tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{s.label}</span>
              </a>
            </li>
          {/each}
        </ol>
      </nav>
    </section>

    <hr class="border-foreground/15 mx-auto w-3/5" aria-hidden="true" />

    <!-- INTRO: motivates why a code-to-PDF tool exists, then hands off to the
         use cases. Color comes from a soft primary glow and one inline accent;
         the reading column does the rest. No callout box, no quote rule. -->
    <article class="prose-justify relative mx-auto max-w-3xl overflow-hidden px-6 py-16 sm:py-24">
      <div
        aria-hidden="true"
        class="bg-primary pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[320px] w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.06] blur-[140px]"
      ></div>

      <p class="text-foreground/85 text-lg leading-relaxed">
        Source code is awkward to share outside of a code editor. Email clients mangle it.
        Screenshots aren't searchable. Word processors strip the formatting. The simplest portable
        format is still a PDF, and the simplest way to make a good code PDF is to point a tool at
        your project folder and let it do the layout for you.
      </p>

      <p class="text-foreground/85 mt-5 text-lg leading-relaxed">
        <span class="text-primary font-medium">PDFy is that tool.</span> It runs entirely in your browser,
        reads your folder using the File System Access API, and produces a single searchable PDF: real
        text with syntax highlighting, paginated so long lines don't break, with a cover page and table
        of contents if you want them.
      </p>

      <p class="text-muted-foreground no-justify mt-5 leading-relaxed">
        The sections below cover who reaches for PDFy, what makes the output worth using, and the
        questions people ask before they try it.
      </p>
    </article>

    <hr class="border-foreground/15 mx-auto w-3/5" aria-hidden="true" />

    <!-- USE CASES -->
    <article class="prose-justify mx-auto max-w-3xl px-6 py-16 sm:py-24" use:reveal>
      <div class="space-y-20">
        <section id="students" class="scroll-mt-24">
          <div class="bg-primary/10 text-primary mb-5 flex size-10 items-center justify-center">
            <GraduationCap class="size-5" />
          </div>
          <h2 class="text-2xl font-semibold tracking-tight sm:text-3xl">
            Submit a coding assignment as a PDF
          </h2>
          <p class="text-foreground/85 mt-5 text-base leading-relaxed sm:text-lg">
            Most computer-science programs accept (or require) coding assignments to be submitted as
            a PDF. PDFy is built for exactly this. Open the project folder, tick every file you want
            included, add a cover page with your name and the assignment title, and print to PDF.
          </p>
          <ul class="text-foreground/85 mt-5 space-y-2 pl-6 text-base sm:text-lg">
            <li class="list-disc">
              Syntax highlighting for over 200 languages including Python, Java, JavaScript, C++,
              and Rust.
            </li>
            <li class="list-disc">
              Optional line numbers per file, useful when the grader wants to refer to specific
              lines.
            </li>
            <li class="list-disc">
              Cover page and table of contents are click-to-edit, so the front matter looks the way
              you want without external tools.
            </li>
            <li class="list-disc">
              Files never leave your machine. Safe for graded submissions and for projects under an
              academic-honesty policy.
            </li>
          </ul>
          <p class="text-muted-foreground no-justify mt-5 text-sm">
            Step-by-step:
            <a
              href="/tutorial/open-a-folder"
              class="text-primary hover:text-primary/80 underline underline-offset-4"
              >Open a folder</a
            >
            →
            <a
              href="/tutorial/pick-what-to-print"
              class="text-primary hover:text-primary/80 underline underline-offset-4"
              >Pick what to print</a
            >
            →
            <a
              href="/tutorial/cover-page"
              class="text-primary hover:text-primary/80 underline underline-offset-4">Cover page</a
            >
            →
            <a
              href="/tutorial/save-the-pdf"
              class="text-primary hover:text-primary/80 underline underline-offset-4"
              >Save the PDF</a
            >.
          </p>
        </section>

        <section id="code-reviews" class="scroll-mt-24">
          <div class="bg-primary/10 text-primary mb-5 flex size-10 items-center justify-center">
            <FileSearch class="size-5" />
          </div>
          <h2 class="text-2xl font-semibold tracking-tight sm:text-3xl">
            Share a project for review or as a handout
          </h2>
          <p class="text-foreground/85 mt-5 text-base leading-relaxed sm:text-lg">
            Reviewers, mentors, and students don't always want to clone a repository to look at the
            code. A single PDF is easier to circulate, comment on, and read offline. PDFy generates
            handout-quality output: real text with syntax highlighting, page numbers, optional line
            numbers, and a header / footer that can include the project name, the current path, and
            the page number.
          </p>
          <p class="text-foreground/85 mt-5 text-base leading-relaxed sm:text-lg">
            Headers and footers use Mustache templating, so a handout for a class can show the
            course name on every page, while a review document can show the file path and the
            commit. Reorder files in the print plan to put the most important ones first.
          </p>
          <p class="text-muted-foreground no-justify mt-5 text-sm">
            Customise:
            <a
              href="/tutorial/headers-and-footers"
              class="text-primary hover:text-primary/80 underline underline-offset-4"
              >Headers and footers</a
            >
            →
            <a
              href="/tutorial/templating"
              class="text-primary hover:text-primary/80 underline underline-offset-4"
              >Templating variables</a
            >
            →
            <a
              href="/tutorial/per-file-overrides"
              class="text-primary hover:text-primary/80 underline underline-offset-4"
              >Per-file overrides</a
            >.
          </p>
        </section>

        <section id="archive" class="scroll-mt-24">
          <div class="bg-primary/10 text-primary mb-5 flex size-10 items-center justify-center">
            <Archive class="size-5" />
          </div>
          <h2 class="text-2xl font-semibold tracking-tight sm:text-3xl">
            Archive a repository as a single PDF
          </h2>
          <p class="text-foreground/85 mt-5 text-base leading-relaxed sm:text-lg">
            A PDF snapshot is a useful complement to a Git tag. It freezes a project's source as a
            single readable artifact: no clone, no checkout, no toolchain required to read it later.
            Useful before deleting a workspace, before archiving an old client project, or before a
            major rewrite.
          </p>
          <p class="text-foreground/85 mt-5 text-base leading-relaxed sm:text-lg">
            PDFy respects <code class="font-mono text-sm">.gitignore</code> by default, so the
            archive doesn't include
            <code class="font-mono text-sm">node_modules</code>,
            <code class="font-mono text-sm">build/</code>, or anything else your repo already
            ignores. The output is plain searchable text, so a future you (or a future tool) can
            grep, copy, and re-extract code from the PDF.
          </p>
          <p class="text-muted-foreground no-justify mt-5 text-sm">
            See also:
            <a
              href="/tutorial/settings"
              class="text-primary hover:text-primary/80 underline underline-offset-4">Settings</a
            >
            for the gitignore toggle, and
            <a
              href="/tutorial/table-of-contents"
              class="text-primary hover:text-primary/80 underline underline-offset-4"
              >Table of contents</a
            >
            for navigation.
          </p>
        </section>

        <section id="portfolio" class="scroll-mt-24">
          <div class="bg-primary/10 text-primary mb-5 flex size-10 items-center justify-center">
            <Briefcase class="size-5" />
          </div>
          <h2 class="text-2xl font-semibold tracking-tight sm:text-3xl">
            Send a portfolio project to a recruiter
          </h2>
          <p class="text-foreground/85 mt-5 text-base leading-relaxed sm:text-lg">
            Some companies ask candidates to submit a code sample as a PDF rather than a link to a
            repository. PDFy makes this trivial: pick the relevant files, put a cover page on it
            with your name and the project's elevator pitch, and export. The result is a single file
            you can attach to an application or email.
          </p>
          <p class="text-foreground/85 mt-5 text-base leading-relaxed sm:text-lg">
            The print plan is independent of the on-disk layout, so you can hide or omit anything
            irrelevant (test scaffolding, generated config, throwaway prototypes) without touching
            the underlying repository. Custom titles per file let you label sections like "Core
            algorithm" or "API client" instead of bare filenames.
          </p>
        </section>

        <section id="copyright" class="scroll-mt-24">
          <div class="bg-primary/10 text-primary mb-5 flex size-10 items-center justify-center">
            <Gavel class="size-5" />
          </div>
          <h2 class="text-2xl font-semibold tracking-tight sm:text-3xl">
            Source code for copyright and IP filings
          </h2>
          <p class="text-foreground/85 mt-5 text-base leading-relaxed sm:text-lg">
            Software copyright registrations and patent disclosures often require source code to be
            submitted as a paginated, readable PDF, sometimes with the first and last portions of
            the code at specific page boundaries. PDFy gives you full control over which files go in
            and the order they appear, with consistent syntax highlighting and predictable
            pagination across the whole document.
          </p>
          <p class="text-foreground/85 mt-5 text-base leading-relaxed sm:text-lg">
            Because everything runs locally, sensitive code never leaves your machine in the process
            of preparing a filing. The PDF is plain text under the hood, so the receiving office's
            tooling can index and search it like any other PDF.
          </p>
        </section>

        <section id="what-makes-it-good" class="scroll-mt-24">
          <div class="bg-primary/10 text-primary mb-5 flex size-10 items-center justify-center">
            <ScrollText class="size-5" />
          </div>
          <h2 class="text-2xl font-semibold tracking-tight sm:text-3xl">
            What makes the output good
          </h2>
          <ul class="text-foreground/85 mt-5 space-y-3 pl-6 text-base sm:text-lg">
            <li class="list-disc">
              <strong>Searchable text, not screenshots.</strong>
              The output is real text. You can copy lines out of it, grep it from the command line, and
              let any PDF reader's find feature work normally.
            </li>
            <li class="list-disc">
              <strong>Wrap-aware pagination.</strong>
              Long lines break cleanly across pages instead of disappearing off the right margin. No surprise
              truncation in the printed file.
            </li>
            <li class="list-disc">
              <strong>Syntax highlighting that actually prints.</strong>
              Powered by Shiki, the same highlighter used by VS Code's Twoslash. Over 200 languages, with
              both light and dark themes.
            </li>
            <li class="list-disc">
              <strong>Customisable cover, TOC, headers and footers.</strong>
              Click-to-edit cover and TOC titles. Six header / footer slots accept Mustache templates
              with variables for title, page, path, and date.
            </li>
            <li class="list-disc">
              <strong>Per-file overrides.</strong>
              Toggle line numbers, change the displayed title, scale embedded images, control alignment,
              all without touching the underlying file.
            </li>
            <li class="list-disc">
              <strong>Privacy-first.</strong>
              The browser reads your folder. No upload, no third-party processing, no telemetry tied to
              file contents.
            </li>
          </ul>
        </section>

        <section id="faq" class="scroll-mt-24">
          <h2 class="text-2xl font-semibold tracking-tight sm:text-3xl">FAQ</h2>
          <p class="text-muted-foreground no-justify mt-3 text-sm">
            More questions on the
            <a href="/faq" class="text-primary hover:text-primary/80 underline underline-offset-4"
              >main FAQ</a
            >.
          </p>
          <ul class="divide-foreground/10 border-foreground/10 mt-6 divide-y border-y">
            {#each faqs as f (f.q)}
              <li>
                <details class="group">
                  <summary
                    class="hover:text-primary flex cursor-pointer items-start justify-between gap-6 py-5 transition-colors select-none"
                  >
                    <span class="flex-1 text-base leading-snug font-medium sm:text-lg">
                      {f.q}
                    </span>
                    <span
                      class="text-muted-foreground/60 mt-1 transition-transform group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <p class="text-muted-foreground pb-5 text-base leading-relaxed">
                    {f.a}
                  </p>
                </details>
              </li>
            {/each}
          </ul>
        </section>
      </div>
    </article>
  </main>

  <hr class="border-foreground/15 mx-auto w-3/5" aria-hidden="true" />

  <!-- HOW IT WORKS: positioned as the launchpad to the bottom CTA, not as a
       duplicate of the hero. After the use cases, features, and FAQ have done
       their convincing, this is the 30-second action sequence. -->
  <section class="px-6 py-20 sm:py-24">
    <div class="mx-auto max-w-3xl">
      <div class="mb-10 max-w-xl">
        <span class="text-muted-foreground mb-3 block font-mono text-xs tracking-wider uppercase">
          The whole workflow
        </span>
        <h2 class="text-2xl font-semibold tracking-tight sm:text-3xl">
          Code to PDF, in three clicks.
        </h2>
      </div>
      <div class="border-foreground/15 bg-border/60 grid grid-cols-1 gap-px border sm:grid-cols-3">
        <div class="bg-background flex flex-col gap-2 p-6">
          <span class="text-primary font-mono text-xs tracking-wider uppercase">Step 1</span>
          <h3 class="text-lg font-medium">Open a project folder</h3>
          <p class="text-muted-foreground text-sm">
            Pick a local folder. PDFy reads it without uploading anything.
          </p>
        </div>
        <div class="bg-background flex flex-col gap-2 p-6">
          <span class="text-primary font-mono text-xs tracking-wider uppercase">Step 2</span>
          <h3 class="text-lg font-medium">Pick which files to include</h3>
          <p class="text-muted-foreground text-sm">
            Reorder, rename, add or remove files in the print plan.
          </p>
        </div>
        <div class="bg-background flex flex-col gap-2 p-6">
          <span class="text-primary font-mono text-xs tracking-wider uppercase">Step 3</span>
          <h3 class="text-lg font-medium">Save as PDF</h3>
          <p class="text-muted-foreground text-sm">
            Click Print, choose Save as PDF in the browser dialog.
          </p>
        </div>
      </div>
    </div>
  </section>

  <!-- BOTTOM CTA -->
  <section class="relative overflow-hidden px-6 pt-12 pb-24 sm:pt-16 sm:pb-32">
    <div
      aria-hidden="true"
      class="bg-primary pointer-events-none absolute bottom-0 left-1/2 -z-10 h-[300px] w-[600px] -translate-x-1/2 translate-y-1/2 rounded-full opacity-15 blur-[120px]"
    ></div>
    <div class="mx-auto flex max-w-3xl flex-col items-center text-center">
      <h2 class="text-3xl font-semibold tracking-tight sm:text-4xl">
        Ready to convert your code to PDF?
      </h2>
      <p class="text-muted-foreground mt-3">
        A folder, a click, a PDF. Free forever, runs in your browser.
      </p>
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
  summary::-webkit-details-marker {
    display: none;
  }
  summary {
    list-style: none;
  }

  /* Justified reading blocks. Long-form prose feels more book-like when both
     edges line up. Hyphens stay manual so the browser never breaks a word
     mid-line, even if that means slightly looser word spacing on a few rows. */
  .prose-justify p {
    text-align: justify;
    text-justify: inter-word;
    hyphens: manual;
    -webkit-hyphens: manual;
  }
  /* Short metadata-style paragraphs stay left-aligned; justifying them would
     create huge gaps. */
  .prose-justify .no-justify {
    text-align: left;
  }

  /* Hero fox: float right and let the headline + paragraph hug the fox's
     silhouette via shape-outside on its alpha channel. The image must be
     same-origin (it is, served from /foxes) for shape-outside to read pixels.
     shape-image-threshold treats anything with low alpha as "outside" so the
     wrap follows the visible fox, not the transparent padding. */
  .hero-fox {
    float: right;
    width: 18rem;
    height: auto;
    margin-left: 2rem;
    margin-bottom: 1rem;
    shape-outside: url("/foxes/with-paper-640.webp");
    shape-image-threshold: 0.5;
    shape-margin: 1rem;
  }

  @media (min-width: 1280px) {
    .hero-fox {
      width: 20rem;
      margin-left: 2.5rem;
    }
  }
</style>
