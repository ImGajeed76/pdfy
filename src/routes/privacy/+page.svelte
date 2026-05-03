<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import Logo from "$lib/components/Logo.svelte";
  import Github from "$lib/components/icons/Github.svelte";
  import ArrowRight from "@lucide/svelte/icons/arrow-right";
  import { SITE_NAME, SITE_AUTHOR, SITE_AUTHOR_URL, SITE_REPO } from "$lib/site";

  // Pin the date so the page doesn't claim to have been updated on every
  // build. Bump manually when the substance changes.
  const lastUpdated = "2026-05-04";

  const sections = [
    { id: "files", label: "Your files" },
    { id: "browser-storage", label: "What's stored locally" },
    { id: "network", label: "What goes over the network" },
    { id: "cookies", label: "Cookies" },
    { id: "accounts", label: "No accounts, no email" },
    { id: "changes", label: "If something changes" },
    { id: "questions", label: "Questions" },
  ];
</script>

<svelte:head>
  <title>Privacy, {SITE_NAME}</title>
  <meta
    name="description"
    content="What PDFy does and does not do with your data. Files never leave your browser. Analytics is cookieless and self-hosted."
  />
  <meta property="og:title" content={`Privacy, ${SITE_NAME}`} />
  <meta
    property="og:description"
    content="Plain-language disclosures. Files stay local. Analytics is cookieless."
  />
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
    <!-- HERO: heading on the left, sleeping fox on the right. Mirrors the home page. -->
    <section class="relative overflow-hidden px-6 pt-24 pb-16 sm:pt-32 sm:pb-24">
      <div
        aria-hidden="true"
        class="bg-primary pointer-events-none absolute -top-32 left-1/2 -z-10 h-[420px] w-[700px] -translate-x-1/2 rounded-full opacity-[0.08] blur-[140px]"
      ></div>

      <div class="mx-auto grid max-w-5xl items-center gap-12 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
        <div class="text-left">
          <span class="text-muted-foreground mb-4 block font-mono text-xs tracking-wider uppercase">
            Privacy
          </span>
          <h1 class="text-4xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-5xl">
            What happens to your stuff.
          </h1>
          <p class="text-muted-foreground mt-6 max-w-lg text-lg leading-relaxed sm:text-xl">
            Short answer: nothing leaves your browser.<br />
            The longer answer is on this page so you can check.
          </p>
          <p class="text-muted-foreground/70 mt-6 font-mono text-xs tracking-wide">
            Last updated {lastUpdated}
          </p>
        </div>

        <div class="hidden lg:flex lg:justify-end">
          <img
            src="/foxes/sleeping-640.webp"
            alt=""
            aria-hidden="true"
            class="pointer-events-none size-72 select-none xl:size-80"
            style="filter: saturate(1.05);"
          />
        </div>
      </div>
    </section>

    <!-- TOC: tiny anchored table of contents so the page feels navigable. -->
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

    <!-- BODY: numbered sections, generous spacing, narrow reading column. -->
    <article class="mx-auto max-w-3xl px-6 py-16 sm:py-24">
      <div class="space-y-16 sm:space-y-20">
        <section id="files" class="scroll-mt-24 space-y-4">
          <span class="text-primary/80 font-mono text-xs tracking-wider tabular-nums">01</span>
          <h2 class="text-2xl font-semibold tracking-tight sm:text-3xl">Your files</h2>
          <p class="text-foreground/85 text-base leading-relaxed sm:text-lg">
            PDFy reads the folder you pick using the browser's File System Access API. The contents
            stay on your machine the entire time. Nothing is uploaded. The PDF is generated by your
            browser's print dialog, so even the final document never touches a server we run.
          </p>
        </section>

        <section id="browser-storage" class="scroll-mt-24 space-y-4">
          <span class="text-primary/80 font-mono text-xs tracking-wider tabular-nums">02</span>
          <h2 class="text-2xl font-semibold tracking-tight sm:text-3xl">What's stored locally</h2>
          <p class="text-foreground/85 text-base leading-relaxed sm:text-lg">
            So you can come back to a project without picking the folder again, PDFy keeps a few
            things in your browser:
          </p>
          <ul class="space-y-3 pl-1">
            <li class="text-foreground/85 leading-relaxed">
              <span class="text-foreground font-medium">Recent project handles</span>
              <span class="text-muted-foreground">
                in IndexedDB. These are permission tokens, not file contents. The browser still asks
                before reading anything.</span
              >
            </li>
            <li class="text-foreground/85 leading-relaxed">
              <span class="text-foreground font-medium">Per-project state</span>
              <span class="text-muted-foreground">
                in IndexedDB: which files are in your print plan, custom titles, header / footer
                templates, table of contents settings.</span
              >
            </li>
            <li class="text-foreground/85 leading-relaxed">
              <span class="text-foreground font-medium">App preferences</span>
              <span class="text-muted-foreground">
                in localStorage: theme, font size, page size, etc.</span
              >
            </li>
          </ul>
          <p class="text-muted-foreground text-base leading-relaxed">
            All of this lives only in the browser you're using right now. Clearing site data wipes
            it all.
          </p>
        </section>

        <section id="network" class="scroll-mt-24 space-y-4">
          <span class="text-primary/80 font-mono text-xs tracking-wider tabular-nums">03</span>
          <h2 class="text-2xl font-semibold tracking-tight sm:text-3xl">
            What goes over the network
          </h2>
          <p class="text-foreground/85 text-base leading-relaxed sm:text-lg">
            Three things, all aggregate or static, none personal:
          </p>
          <ul class="space-y-3 pl-1">
            <li class="text-foreground/85 leading-relaxed">
              <span class="text-foreground font-medium">Analytics.</span>
              <span class="text-muted-foreground">
                A self-hosted Plausible instance counts page views and a few interaction events
                (e.g. "opened the tool"). No cookies, no cross-site tracking, no fingerprinting. IP
                addresses are used to compute the visitor's country and then discarded. Plausible is
                open-source and the instance runs at
                <code class="text-foreground/70 font-mono text-sm">plausible.axonotes.ch</code>.
              </span>
            </li>
            <li class="text-foreground/85 leading-relaxed">
              <span class="text-foreground font-medium">GitHub star count.</span>
              <span class="text-muted-foreground">
                The home page asks GitHub once for the {SITE_NAME} repo's star count. No information about
                you is sent.
              </span>
            </li>
            <li class="text-foreground/85 leading-relaxed">
              <span class="text-foreground font-medium">The site itself.</span>
              <span class="text-muted-foreground">
                HTML, CSS, fonts and images are served from Vercel's CDN. Vercel may keep standard
                request logs (IP, user-agent, timestamp) for the usual operational reasons.
              </span>
            </li>
          </ul>
        </section>

        <section id="cookies" class="scroll-mt-24 space-y-4">
          <span class="text-primary/80 font-mono text-xs tracking-wider tabular-nums">04</span>
          <h2 class="text-2xl font-semibold tracking-tight sm:text-3xl">Cookies</h2>
          <p class="text-foreground/85 text-base leading-relaxed sm:text-lg">
            PDFy doesn't set any. Plausible is intentionally cookieless. Nothing to consent to,
            nothing to opt out of.
          </p>
        </section>

        <section id="accounts" class="scroll-mt-24 space-y-4">
          <span class="text-primary/80 font-mono text-xs tracking-wider tabular-nums">05</span>
          <h2 class="text-2xl font-semibold tracking-tight sm:text-3xl">No accounts, no email</h2>
          <p class="text-foreground/85 text-base leading-relaxed sm:text-lg">
            PDFy doesn't have a sign-up form, doesn't ask for an email, and has no notion of a user
            account. There is nothing to delete because there is nothing stored about you on any
            server.
          </p>
        </section>

        <section id="changes" class="scroll-mt-24 space-y-4">
          <span class="text-primary/80 font-mono text-xs tracking-wider tabular-nums">06</span>
          <h2 class="text-2xl font-semibold tracking-tight sm:text-3xl">If something changes</h2>
          <p class="text-foreground/85 text-base leading-relaxed sm:text-lg">
            This page tracks what the app actually does. If the behaviour changes, this page changes
            with it. The date at the top of the page is the source of truth, and the full edit
            history lives in the
            <a
              href={SITE_REPO}
              target="_blank"
              rel="noopener noreferrer"
              class="text-primary hover:text-primary/80 underline underline-offset-4"
            >
              GitHub repo</a
            >.
          </p>
        </section>

        <section id="questions" class="scroll-mt-24 space-y-4">
          <span class="text-primary/80 font-mono text-xs tracking-wider tabular-nums">07</span>
          <h2 class="text-2xl font-semibold tracking-tight sm:text-3xl">Questions</h2>
          <p class="text-foreground/85 text-base leading-relaxed sm:text-lg">
            Open an issue on
            <a
              href={SITE_REPO}
              target="_blank"
              rel="noopener noreferrer"
              class="text-primary hover:text-primary/80 underline underline-offset-4"
            >
              GitHub</a
            >, or reach the author at
            <a
              href={SITE_AUTHOR_URL}
              target="_blank"
              rel="noopener noreferrer"
              class="text-primary hover:text-primary/80 underline underline-offset-4"
            >
              {SITE_AUTHOR_URL.replace(/^https?:\/\//, "")}</a
            >.
          </p>
        </section>
      </div>
    </article>
  </main>

  <hr class="border-foreground/15 mx-auto w-3/5" aria-hidden="true" />

  <footer class="relative px-6 py-8">
    <div
      class="text-muted-foreground mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-sm sm:flex-row"
    >
      <p>&copy; {new Date().getFullYear()} {SITE_NAME} &middot; GPL v3.0</p>
      <div class="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
        <a href="/faq" class="hover:text-foreground transition-colors">FAQ</a>
        <a href="/privacy" class="text-foreground" aria-current="page">Privacy</a>
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
