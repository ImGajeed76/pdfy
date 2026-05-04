<script lang="ts">
  import { SITE_NAME } from "$lib/site";
  import Pagination from "$lib/components/tutorial/Pagination.svelte";
  import Callout from "$lib/components/tutorial/Callout.svelte";
  import { VARIABLE_GROUPS } from "$lib/editor/template";
</script>

<svelte:head>
  <title>Templating variables · Tutorial · {SITE_NAME}</title>
  <meta
    name="description"
    content="Every Mustache variable available in PDFy headers, footers, and TOC rows."
  />
  <meta property="og:title" content={`Templating variables · Tutorial · ${SITE_NAME}`} />
  <meta property="og:description" content="Page numbers, file metadata, dates, conditionals." />
</svelte:head>

<header class="mb-10">
  <p class="text-muted-foreground mb-3 font-mono text-xs tracking-wider uppercase">
    Reference, 1 of 3
  </p>
  <h1 class="text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
    Templating variables
  </h1>
  <p class="text-muted-foreground mt-4 max-w-2xl text-lg leading-relaxed">
    The full set of variables you can put into a header, footer, or TOC row template.
  </p>
</header>

<section class="mb-12 space-y-4">
  <h2 class="text-2xl font-semibold tracking-tight">Syntax</h2>
  <p class="text-foreground/85 leading-relaxed">
    Templates use <a
      href="https://mustache.github.io/mustache.5.html"
      target="_blank"
      rel="noopener noreferrer"
      class="text-primary hover:text-primary/80 underline underline-offset-4">Mustache</a
    >. Wrap a variable name in
    <code class="font-mono text-sm">{`{{` + `…` + `}}`}</code> to insert it. For conditional
    sections, use
    <code class="font-mono text-sm">{`{{#name}}…{{/name}}`}</code> (renders when truthy) or
    <code class="font-mono text-sm">{`{{^name}}…{{/name}}`}</code> (renders when falsy).
  </p>
  <p class="text-foreground/85 leading-relaxed">
    Anything that isn't a variable renders verbatim, so you can mix in literal text:
    <code class="font-mono text-sm">{`Page {{page}} of {{pages}}`}</code>.
  </p>
</section>

<section class="mb-12 space-y-6">
  <h2 class="text-2xl font-semibold tracking-tight">All variables</h2>

  {#each VARIABLE_GROUPS as group (group.label)}
    <div>
      <h3 class="text-foreground mb-3 font-mono text-xs tracking-wider uppercase">
        {group.label}
      </h3>
      <ul class="border-foreground/10 divide-foreground/10 divide-y border-y">
        {#each group.vars as v (v.name)}
          <li class="grid grid-cols-[14rem_1fr] items-baseline gap-4 py-2.5">
            <code class="text-primary font-mono text-sm">{`{{${v.name}}}`}</code>
            <span class="text-muted-foreground text-sm">{v.help}</span>
          </li>
        {/each}
      </ul>
    </div>
  {/each}
</section>

<section class="mb-12 space-y-4">
  <h2 class="text-2xl font-semibold tracking-tight">Examples</h2>
  <p class="text-foreground/85 leading-relaxed">A few patterns worth stealing:</p>
  <div class="my-6 space-y-4">
    <div class="border-foreground/15 bg-muted/20 border p-4">
      <code class="text-primary font-mono text-sm">
        {`{{#isFile}}{{title}}{{/isFile}}`}
      </code>
      <p class="text-muted-foreground mt-2 text-sm">
        Show the section title only on file pages, leaving the cover and TOC unlabelled.
      </p>
    </div>
    <div class="border-foreground/15 bg-muted/20 border p-4">
      <code class="text-primary font-mono text-sm">
        {`{{page}} / {{pages}}`}
      </code>
      <p class="text-muted-foreground mt-2 text-sm">"3 / 12" page numbering.</p>
    </div>
    <div class="border-foreground/15 bg-muted/20 border p-4">
      <code class="text-primary font-mono text-sm">
        {`{{project}} — {{date.long}}`}
      </code>
      <p class="text-muted-foreground mt-2 text-sm">
        Project name and a fully written date in the top corner.
      </p>
    </div>
    <div class="border-foreground/15 bg-muted/20 border p-4">
      <code class="text-primary font-mono text-sm">
        {`{{^isFirstPageOfFile}}{{title}} (continued){{/isFirstPageOfFile}}`}
      </code>
      <p class="text-muted-foreground mt-2 text-sm">
        Add a "(continued)" suffix on the second sheet onwards of any file that spans multiple
        pages.
      </p>
    </div>
  </div>
</section>

<section class="space-y-4">
  <h2 class="text-2xl font-semibold tracking-tight">Autocomplete</h2>
  <Callout kind="tip">
    <p>
      In any template field, type <code class="font-mono text-sm">{`{{`}</code> to get an autocomplete
      dropdown of all the variables above. Faster than typing from memory.
    </p>
  </Callout>
</section>

<Pagination />
