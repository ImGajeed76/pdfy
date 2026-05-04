<script lang="ts">
  import { SITE_NAME } from "$lib/site";
  import Pagination from "$lib/components/tutorial/Pagination.svelte";
  import Callout from "$lib/components/tutorial/Callout.svelte";
  import MockSheet from "$lib/components/tutorial/MockSheet.svelte";
</script>

<svelte:head>
  <title>Headers and footers · Tutorial · {SITE_NAME}</title>
  <meta
    name="description"
    content="Six slots per page, Mustache-templated. Configure once per project, applies to every sheet."
  />
  <meta property="og:title" content={`Headers and footers · Tutorial · ${SITE_NAME}`} />
  <meta
    property="og:description"
    content="Six slots, page-aware variables, project-wide settings."
  />
</svelte:head>

<header class="mb-10">
  <p class="text-muted-foreground mb-3 font-mono text-xs tracking-wider uppercase">
    Customise, 3 of 4
  </p>
  <h1 class="text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
    Headers and footers
  </h1>
  <p class="text-muted-foreground mt-4 max-w-2xl text-lg leading-relaxed">
    Every sheet has six slots: top-left, top-center, top-right, bottom-left, bottom-center,
    bottom-right. Each is a Mustache template.
  </p>
</header>

<section class="mb-12 space-y-4">
  <h2 class="text-2xl font-semibold tracking-tight">Where to set them</h2>
  <p class="text-foreground/85 leading-relaxed">
    The headers / footers sheet lives behind the page-layout icon in the editor's header (next to
    the settings cog). It only appears when you have a project open, because the values are stored
    per project, not per browser.
  </p>

  <div class="my-8">
    <MockSheet label="Page layout">
      <div>
        <p class="text-muted-foreground/80 mb-2 font-mono text-[10px] tracking-wider uppercase">
          Top of page
        </p>
        <div class="grid grid-cols-3 gap-2">
          <div class="border-foreground/15 bg-muted/20 h-8 border"></div>
          <div class="border-foreground/15 bg-muted/20 h-8 border"></div>
          <div class="border-foreground/15 bg-muted/20 h-8 border"></div>
        </div>
      </div>
      <div>
        <p class="text-muted-foreground/80 mb-2 font-mono text-[10px] tracking-wider uppercase">
          Bottom of page
        </p>
        <div class="grid grid-cols-3 gap-2">
          <div class="border-foreground/15 bg-muted/20 h-8 border"></div>
          <div class="border-foreground/15 bg-muted/20 h-8 border"></div>
          <div class="border-foreground/15 bg-muted/20 h-8 border"></div>
        </div>
      </div>
    </MockSheet>
  </div>
</section>

<section class="mb-12 space-y-4">
  <h2 class="text-2xl font-semibold tracking-tight">Templates, not plain text</h2>
  <p class="text-foreground/85 leading-relaxed">
    Each slot accepts a Mustache template. Type <code class="font-mono text-sm">{`{{`}</code> in any field
    for an autocomplete of the variables you can use.
  </p>
  <p class="text-foreground/85 leading-relaxed">A few common patterns:</p>
  <div class="my-6 space-y-3">
    <div class="border-foreground/15 bg-muted/20 border p-4">
      <code class="text-primary font-mono text-sm">{`{{title}}`}</code>
      <p class="text-muted-foreground mt-2 text-sm">Renders the current section's title.</p>
    </div>
    <div class="border-foreground/15 bg-muted/20 border p-4">
      <code class="text-primary font-mono text-sm">{`{{page}} / {{pages}}`}</code>
      <p class="text-muted-foreground mt-2 text-sm">"3 / 12" style page numbering.</p>
    </div>
    <div class="border-foreground/15 bg-muted/20 border p-4">
      <code class="text-primary font-mono text-sm">{`{{date.iso}}`}</code>
      <p class="text-muted-foreground mt-2 text-sm">Today's date in YYYY-MM-DD format.</p>
    </div>
    <div class="border-foreground/15 bg-muted/20 border p-4">
      <code class="text-primary font-mono text-sm">{`{{project}}`}</code>
      <p class="text-muted-foreground mt-2 text-sm">The folder name.</p>
    </div>
    <div class="border-foreground/15 bg-muted/20 border p-4">
      <code class="text-primary font-mono text-sm">{`{{#isFile}}{{title}}{{/isFile}}`}</code>
      <p class="text-muted-foreground mt-2 text-sm">
        Only renders the title when the current sheet is a file (skips covers / TOC).
      </p>
    </div>
  </div>
  <p class="text-foreground/85 leading-relaxed">
    Full list on the
    <a
      href="/tutorial/templating"
      class="text-primary hover:text-primary/80 underline underline-offset-4">templating</a
    > page.
  </p>
</section>

<section class="mb-12 space-y-4">
  <h2 class="text-2xl font-semibold tracking-tight">Apply-to toggles</h2>
  <p class="text-foreground/85 leading-relaxed">
    Below the slots there are switches for whether headers / footers appear on the cover page and on
    the table of contents. Both off by default, because chrome on a cover usually looks wrong, but
    flip them on if you want consistent page numbering across the entire document.
  </p>
  <p class="text-foreground/85 leading-relaxed">
    There's also a <strong>Page numbering starts from</strong> input. If you don't want the cover to
    be page 1, set it to 0 (or any negative number for some fancier offsets). Page 1 in
    <code class="font-mono text-sm">{`{{page}}`}</code> then refers to the first content page.
  </p>
</section>

<section class="space-y-4">
  <h2 class="text-2xl font-semibold tracking-tight">Project-wide</h2>
  <Callout kind="note">
    <p>
      Header and footer values are stored with the project (in IndexedDB), not with your browser
      settings. Open another folder, you get fresh defaults. Open the same folder later, your
      templates come back.
    </p>
  </Callout>
</section>

<Pagination />
