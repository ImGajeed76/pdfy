<script lang="ts">
  import { SITE_NAME } from "$lib/site";
  import Pagination from "$lib/components/tutorial/Pagination.svelte";
  import Callout from "$lib/components/tutorial/Callout.svelte";
</script>

<svelte:head>
  <title>Settings reference · Tutorial · {SITE_NAME}</title>
  <meta
    name="description"
    content="Every PDFy setting and which layer it lives on: app preferences, per-project settings, and per-entry overrides for code PDFs."
  />
  <meta property="og:title" content={`Settings reference · Tutorial · ${SITE_NAME}`} />
  <meta
    property="og:description"
    content="App preferences vs project settings vs per-entry overrides."
  />
  <meta property="og:type" content="article" />
</svelte:head>

<header class="mb-10">
  <p class="text-muted-foreground mb-3 font-mono text-xs tracking-wider uppercase">
    Reference, 2 of 3
  </p>
  <h1 class="text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">Settings</h1>
  <p class="text-muted-foreground mt-4 max-w-2xl text-lg leading-relaxed">
    Three layers, in order of how often you'd touch them.
  </p>
</header>

<section class="mb-12 space-y-4">
  <h2 class="text-2xl font-semibold tracking-tight">App preferences</h2>
  <p class="text-foreground/85 leading-relaxed">
    Open with the cog icon in the editor's header. Stored in this browser's localStorage, so they
    follow you across every project you open here.
  </p>
  <ul class="border-foreground/10 divide-foreground/10 divide-y border-y">
    <li class="grid grid-cols-[12rem_1fr] items-baseline gap-4 py-3">
      <span class="text-foreground font-medium">Code theme</span>
      <span class="text-muted-foreground text-sm">
        Light or dark Shiki theme. Affects preview and printout.
      </span>
    </li>
    <li class="grid grid-cols-[12rem_1fr] items-baseline gap-4 py-3">
      <span class="text-foreground font-medium">Code font size</span>
      <span class="text-muted-foreground text-sm">
        Point size for code rendering. 9pt by default. Click to enter any value.
      </span>
    </li>
    <li class="grid grid-cols-[12rem_1fr] items-baseline gap-4 py-3">
      <span class="text-foreground font-medium">Show line numbers</span>
      <span class="text-muted-foreground text-sm">
        Project-wide default. Per-entry override available in the contextual bar.
      </span>
    </li>
    <li class="grid grid-cols-[12rem_1fr] items-baseline gap-4 py-3">
      <span class="text-foreground font-medium">Page size</span>
      <span class="text-muted-foreground text-sm">A4 or US Letter.</span>
    </li>
    <li class="grid grid-cols-[12rem_1fr] items-baseline gap-4 py-3">
      <span class="text-foreground font-medium">Smart-add</span>
      <span class="text-muted-foreground text-sm">
        Auto-select obvious files when you open a new folder.
      </span>
    </li>
    <li class="grid grid-cols-[12rem_1fr] items-baseline gap-4 py-3">
      <span class="text-foreground font-medium">Respect .gitignore</span>
      <span class="text-muted-foreground text-sm">
        On by default. Off shows everything except junk dirs (node_modules, .git).
      </span>
    </li>
  </ul>
</section>

<section class="mb-12 space-y-4">
  <h2 class="text-2xl font-semibold tracking-tight">Project settings</h2>
  <p class="text-foreground/85 leading-relaxed">
    Open with the page-layout icon in the editor's header (only visible when a project is open).
    Stored in IndexedDB with the project, so they come back next time you open the same folder.
  </p>
  <ul class="border-foreground/10 divide-foreground/10 divide-y border-y">
    <li class="grid grid-cols-[12rem_1fr] items-baseline gap-4 py-3">
      <span class="text-foreground font-medium">Header / footer slots</span>
      <span class="text-muted-foreground text-sm">
        Six Mustache-templated slots. See <a
          href="/tutorial/headers-and-footers"
          class="text-primary hover:text-primary/80 underline underline-offset-4"
          >headers and footers</a
        >.
      </span>
    </li>
    <li class="grid grid-cols-[12rem_1fr] items-baseline gap-4 py-3">
      <span class="text-foreground font-medium">TOC row template</span>
      <span class="text-muted-foreground text-sm"> The three columns of every TOC row. </span>
    </li>
    <li class="grid grid-cols-[12rem_1fr] items-baseline gap-4 py-3">
      <span class="text-foreground font-medium">Show on cover / TOC</span>
      <span class="text-muted-foreground text-sm">
        Whether headers and footers render on the cover page and TOC.
      </span>
    </li>
    <li class="grid grid-cols-[12rem_1fr] items-baseline gap-4 py-3">
      <span class="text-foreground font-medium">Page numbering starts from</span>
      <span class="text-muted-foreground text-sm">
        Set to 0 if you don't want the cover to count as page 1.
      </span>
    </li>
  </ul>
</section>

<section class="mb-12 space-y-4">
  <h2 class="text-2xl font-semibold tracking-tight">Per-entry overrides</h2>
  <p class="text-foreground/85 leading-relaxed">
    Live on the entry itself. Always win over project and app defaults. See <a
      href="/tutorial/per-file-overrides"
      class="text-primary hover:text-primary/80 underline underline-offset-4">per-file overrides</a
    >.
  </p>
</section>

<section class="space-y-4">
  <h2 class="text-2xl font-semibold tracking-tight">Where is everything stored?</h2>
  <Callout kind="note">
    <p>
      App preferences live in localStorage. Project settings, the print plan, and learned smart-add
      rejections live in IndexedDB, keyed to the directory handle. Clearing site data wipes both.
      The privacy page has the
      <a href="/privacy" class="text-primary hover:text-primary/80 underline underline-offset-4"
        >full breakdown</a
      >.
    </p>
  </Callout>
</section>

<Pagination />
