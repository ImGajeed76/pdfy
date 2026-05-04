<script lang="ts">
  import { SITE_NAME } from "$lib/site";
  import Pagination from "$lib/components/tutorial/Pagination.svelte";
</script>

<svelte:head>
  <title>Things people get wrong · Tutorial · {SITE_NAME}</title>
  <meta
    name="description"
    content="The handful of stumbling blocks new PDFy users hit, and how to fix each one in seconds."
  />
  <meta property="og:title" content={`Things people get wrong · Tutorial · ${SITE_NAME}`} />
  <meta property="og:description" content="Common stumbling blocks and quick fixes." />
</svelte:head>

<header class="mb-10">
  <p class="text-muted-foreground mb-3 font-mono text-xs tracking-wider uppercase">Help, 1 of 2</p>
  <h1 class="text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
    Things people get wrong
  </h1>
  <p class="text-muted-foreground mt-4 max-w-2xl text-lg leading-relaxed">
    Most are five-second fixes once you know where to look.
  </p>
</header>

<section class="mb-10 space-y-3">
  <h2 class="text-2xl font-semibold tracking-tight">
    "I clicked a file in the tree but it didn't appear in the PDF"
  </h2>
  <p class="text-foreground/85 leading-relaxed">
    Clicking a file in the tree just focuses it for preview, it doesn't add it to the plan. Drag it
    into the print plan in the middle, double-click it, or click the small <strong>+</strong> that appears
    on hover.
  </p>
</section>

<section class="mb-10 space-y-3">
  <h2 class="text-2xl font-semibold tracking-tight">"Print made a 100&nbsp;MB file"</h2>
  <p class="text-foreground/85 leading-relaxed">
    The browser's print dialog defaults to your last-used printer. If that's a physical printer, the
    dialog produces a giant raster snapshot when you "save" it later. Change <strong
      >Destination</strong
    >
    to <strong>Save as PDF</strong> at the top of the dialog before clicking Save.
  </p>
</section>

<section class="mb-10 space-y-3">
  <h2 class="text-2xl font-semibold tracking-tight">
    "My .gitignore'd files aren't showing in the tree"
  </h2>
  <p class="text-foreground/85 leading-relaxed">
    They're hidden by design. Open <a
      href="/tutorial/settings"
      class="text-primary hover:text-primary/80 underline underline-offset-4">Settings</a
    >
    and turn off <strong>Respect .gitignore</strong>. Junk dirs like
    <code class="font-mono text-sm">node_modules</code> and
    <code class="font-mono text-sm">.git</code> stay hidden either way.
  </p>
</section>

<section class="mb-10 space-y-3">
  <h2 class="text-2xl font-semibold tracking-tight">"Headers and footers settings is gone"</h2>
  <p class="text-foreground/85 leading-relaxed">
    The page-layout button only appears when you have a project open. Headers and footers are stored
    per project, so the button is hidden on the empty editor state.
  </p>
</section>

<section class="mb-10 space-y-3">
  <h2 class="text-2xl font-semibold tracking-tight">"I switched browsers and lost everything"</h2>
  <p class="text-foreground/85 leading-relaxed">
    Settings, recent projects, and behavior-learning all live in the browser you used them in
    (localStorage and IndexedDB). They don't sync across browsers, devices, or incognito windows.
    Re-open the folder in the new browser; PDFy treats it as a fresh project.
  </p>
</section>

<section class="mb-10 space-y-3">
  <h2 class="text-2xl font-semibold tracking-tight">
    "The TOC says page&nbsp;3 but the cover counts as page&nbsp;1"
  </h2>
  <p class="text-foreground/85 leading-relaxed">
    By default the cover is page 1. If you want the first content page to be page 1, open the
    page-layout sheet and set <strong>Page numbering starts from</strong> to 0. The page in
    <code class="font-mono text-sm">{`{{page}}`}</code> updates everywhere, including the TOC.
  </p>
</section>

<section class="mb-10 space-y-3">
  <h2 class="text-2xl font-semibold tracking-tight">"PDFy froze on a huge folder"</h2>
  <p class="text-foreground/85 leading-relaxed">
    Smart-add walks every code/text file in the tree on first open. For a folder with tens of
    thousands of files, that's slow. Disable smart-add in
    <a
      href="/tutorial/settings"
      class="text-primary hover:text-primary/80 underline underline-offset-4">Settings</a
    > and pick files manually. Or open a subfolder if you only need part of the project.
  </p>
</section>

<section class="space-y-3">
  <h2 class="text-2xl font-semibold tracking-tight">"It works in Chrome but not Firefox/Safari"</h2>
  <p class="text-foreground/85 leading-relaxed">
    Those browsers don't ship the File System Access API. The editor route auto-redirects to the
    unsupported page. See <a
      href="/tutorial/browser-support"
      class="text-primary hover:text-primary/80 underline underline-offset-4">browser support</a
    > for the full list of what works.
  </p>
</section>

<Pagination />
