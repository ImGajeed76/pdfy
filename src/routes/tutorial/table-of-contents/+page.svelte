<script lang="ts">
  import { SITE_NAME } from "$lib/site";
  import Pagination from "$lib/components/tutorial/Pagination.svelte";
  import Callout from "$lib/components/tutorial/Callout.svelte";
  import MockPage from "$lib/components/tutorial/MockPage.svelte";
</script>

<svelte:head>
  <title>Add a table of contents to a code PDF · Tutorial · {SITE_NAME}</title>
  <meta
    name="description"
    content="How to add a table of contents to a source-code PDF: edit the heading, customise the row template, automatic pagination."
  />
  <meta
    property="og:title"
    content={`Add a table of contents to a code PDF · Tutorial · ${SITE_NAME}`}
  />
  <meta
    property="og:description"
    content="Click +, customise rows in the headers / footers sheet."
  />
  <meta property="og:type" content="article" />
</svelte:head>

<header class="mb-10">
  <p class="text-muted-foreground mb-3 font-mono text-xs tracking-wider uppercase">
    Customise, 2 of 4
  </p>
  <h1 class="text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">Table of contents</h1>
  <p class="text-muted-foreground mt-4 max-w-2xl text-lg leading-relaxed">
    A TOC is also a real entry. Add one, customise the heading, watch it paginate.
  </p>
</header>

<section class="mb-12 space-y-4">
  <h2 class="text-2xl font-semibold tracking-tight">Add one</h2>
  <p class="text-foreground/85 leading-relaxed">
    Same place as the cover: <strong>+</strong> in the print plan header,
    <strong>Add table of contents</strong>. Drop it where you want the TOC to appear. Usually right
    after the cover.
  </p>
  <div class="my-8">
    <MockPage label="Table of contents">
      <div class="flex h-full flex-col gap-2">
        <div class="bg-foreground/40 mb-2 h-2 w-1/2 rounded-sm"></div>
        <div class="space-y-1.5">
          {#each Array(8) as _, i (i)}
            <div class="flex items-center gap-1">
              <div class="bg-foreground/15 h-1 w-3 rounded-sm"></div>
              <div
                class="bg-foreground/25 h-1 flex-1 rounded-sm"
                style:opacity={1 - i * 0.07}
              ></div>
              <div class="bg-foreground/15 h-1 w-2 rounded-sm"></div>
            </div>
          {/each}
        </div>
      </div>
    </MockPage>
  </div>
  <p class="text-foreground/85 leading-relaxed">
    The TOC populates itself from the file entries that come after it in the plan. Reorder a file in
    the plan, the TOC reorders. Add or remove a file, the TOC updates.
  </p>
</section>

<section class="mb-12 space-y-4">
  <h2 class="text-2xl font-semibold tracking-tight">Edit the heading</h2>
  <p class="text-foreground/85 leading-relaxed">
    Click the heading text in the preview. A small dialog opens. Same dialog for the optional
    subtitle. The default heading is "Contents".
  </p>
</section>

<section class="mb-12 space-y-4">
  <h2 class="text-2xl font-semibold tracking-tight">Row layout</h2>
  <p class="text-foreground/85 leading-relaxed">
    Each TOC row has three pieces: a <strong>prefix</strong> (left, e.g. the entry number), a
    <strong>title</strong>
    (left, fills available space), and a
    <strong>page number</strong> (right). Dotted leaders fill the gap.
  </p>
  <p class="text-foreground/85 leading-relaxed">
    The three columns are Mustache templates. By default they're
    <code class="font-mono text-sm">{`{{section}}`}</code>,
    <code class="font-mono text-sm">{`{{title}}`}</code>, and
    <code class="font-mono text-sm">{`{{page}}`}</code>. You can swap them in the headers / footers
    sheet (the page-layout button in the editor's header opens it).
  </p>
  <p class="text-foreground/85 leading-relaxed">
    See <a
      href="/tutorial/templating"
      class="text-primary hover:text-primary/80 underline underline-offset-4"
      >templating variables</a
    > for everything you can put in those cells.
  </p>
</section>

<section class="mb-12 space-y-4">
  <h2 class="text-2xl font-semibold tracking-tight">Multi-page TOC</h2>
  <p class="text-foreground/85 leading-relaxed">
    PDFy paginates the TOC automatically. The first page fits ~28 rows, subsequent pages fit ~35
    each. Heading and subtitle only render on the first TOC sheet, so page two onwards is just rows.
  </p>
  <Callout kind="note">
    <p>
      Page numbers in the TOC update as the document repaginates. If you add a long file early in
      the plan, every page number after it shifts and the TOC reflects that immediately.
    </p>
  </Callout>
</section>

<section class="space-y-4">
  <h2 class="text-2xl font-semibold tracking-tight">In the on-screen preview</h2>
  <p class="text-foreground/85 leading-relaxed">
    Each row is a clickable link in the preview. Click a row to jump to that entry's section in the
    preview. In the printed PDF the same links work as PDF bookmarks-style anchors.
  </p>
</section>

<Pagination />
