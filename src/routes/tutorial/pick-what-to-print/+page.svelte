<script lang="ts">
  import { SITE_NAME } from "$lib/site";
  import Pagination from "$lib/components/tutorial/Pagination.svelte";
  import Callout from "$lib/components/tutorial/Callout.svelte";
  import Kbd from "$lib/components/tutorial/Kbd.svelte";
  import MockEditor from "$lib/components/tutorial/MockEditor.svelte";
</script>

<svelte:head>
  <title>Pick which files to include in the PDF · Tutorial · {SITE_NAME}</title>
  <meta
    name="description"
    content="How to choose which source files go into your code PDF: the tree on the left is your library, the print plan in the middle is the actual PDF, drag from one to the other."
  />
  <meta
    property="og:title"
    content={`Pick which files to include in the PDF · Tutorial · ${SITE_NAME}`}
  />
  <meta property="og:description" content="Tree = library. Print plan = the actual PDF." />
  <meta property="og:type" content="article" />
</svelte:head>

<header class="mb-10">
  <p class="text-muted-foreground mb-3 font-mono text-xs tracking-wider uppercase">
    Get started, 2 of 3
  </p>
  <h1 class="text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
    Pick what to print
  </h1>
  <p class="text-muted-foreground mt-4 max-w-2xl text-lg leading-relaxed">
    Two panels both show files. They do different things. Once you see why, the rest is muscle
    memory.
  </p>
</header>

<section class="mb-12 space-y-4">
  <h2 class="text-2xl font-semibold tracking-tight">The two panels</h2>
  <div class="my-6">
    <MockEditor />
  </div>
  <p class="text-foreground/85 leading-relaxed">
    The <strong>tree</strong> on the left is everything in the folder you opened. Click around, expand
    folders, find what you want.
  </p>
  <p class="text-foreground/85 leading-relaxed">
    The <strong>print plan</strong> in the middle is what's actually going into the PDF, in the order
    you set. Files end up here only when you put them here. The tree is the library; the plan is the shopping
    cart.
  </p>
  <p class="text-foreground/85 leading-relaxed">
    The <strong>preview</strong> on the right shows how the plan will print, sheet by sheet, sized to
    A4 or US Letter.
  </p>
</section>

<section class="mb-12 space-y-4">
  <h2 class="text-2xl font-semibold tracking-tight">Adding files to the plan</h2>
  <p class="text-foreground/85 leading-relaxed">Four ways, pick whatever feels natural:</p>
  <ul class="space-y-3 pl-1">
    <li class="text-foreground/85 leading-relaxed">
      <span class="text-foreground font-medium">Drag from the tree.</span>
      <span class="text-muted-foreground">
        Drag a file or a whole folder onto the plan. Folders get walked and every file inside is
        added.
      </span>
    </li>
    <li class="text-foreground/85 leading-relaxed">
      <span class="text-foreground font-medium">Click the + on hover.</span>
      <span class="text-muted-foreground">
        Hover a file in the tree, click the small + that appears.
      </span>
    </li>
    <li class="text-foreground/85 leading-relaxed">
      <span class="text-foreground font-medium">Double-click a file.</span>
      <span class="text-muted-foreground">Same effect as the +.</span>
    </li>
    <li class="text-foreground/85 leading-relaxed">
      <span class="text-foreground font-medium">Drop from your file manager.</span>
      <span class="text-muted-foreground">
        Drag files from outside the browser into the plan panel. They get added directly to the
        plan, separate from the tree.
      </span>
    </li>
  </ul>
  <Callout kind="tip">
    <p>
      The same file can appear in the plan more than once. Useful for a header / appendix layout
      where you want to show, say, a shared types file alongside the module that imports it.
    </p>
  </Callout>
</section>

<section class="mb-12 space-y-4">
  <h2 class="text-2xl font-semibold tracking-tight">Reorder, rename, remove</h2>
  <p class="text-foreground/85 leading-relaxed">
    Inside the plan, drag entries up or down to reorder. The preview re-paginates immediately.
  </p>
  <p class="text-foreground/85 leading-relaxed">
    Press <Kbd>F2</Kbd> on the selected entry to give it a custom title (the filename is the default).
    Press <Kbd>Del</Kbd> or <Kbd>Backspace</Kbd> to remove the selected entries. Click while holding <Kbd
      >Shift</Kbd
    > to range-select; <Kbd>Ctrl</Kbd> / <Kbd>Cmd</Kbd> + click to multi-select.
  </p>
</section>

<section class="mb-12 space-y-4">
  <h2 class="text-2xl font-semibold tracking-tight">Smart-add</h2>
  <p class="text-foreground/85 leading-relaxed">
    When you open a folder, PDFy auto-fills the print plan with every code and text file in the
    tree, sorted with README first, then source files under
    <code class="font-mono text-sm">src/</code> or
    <code class="font-mono text-sm">lib/</code>, then everything else, with the project's
    lockfile-adjacent root file (<code class="font-mono text-sm">package.json</code>,
    <code class="font-mono text-sm">Cargo.toml</code>, etc.) and LICENSE near the bottom.
  </p>
  <p class="text-foreground/85 leading-relaxed">
    If you delete one of those auto-added entries from the plan, PDFy remembers that specific file
    path for this project and won't re-add it next time you open the same folder. The memory is per
    project and per exact path: it doesn't generalise to "skip all tests" or carry across folders.
  </p>
  <p class="text-foreground/85 leading-relaxed">
    Disable smart-add entirely in <a
      href="/tutorial/settings"
      class="text-primary hover:text-primary/80 underline underline-offset-4">Settings</a
    > if you'd rather start with an empty plan every time.
  </p>
</section>

<section class="space-y-4">
  <h2 class="text-2xl font-semibold tracking-tight">What about non-code files?</h2>
  <p class="text-foreground/85 leading-relaxed">
    Images get embedded directly. PDFs in your folder are rasterised page-by-page so they show up as
    part of your output. Plain text and Markdown render as code with syntax highlighting where
    applicable. Truly binary files (executables, archives) are skipped with a placeholder.
  </p>
</section>

<Pagination />
