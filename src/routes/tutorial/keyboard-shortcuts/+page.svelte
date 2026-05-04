<script lang="ts">
  import { SITE_NAME } from "$lib/site";
  import Pagination from "$lib/components/tutorial/Pagination.svelte";
  import Kbd from "$lib/components/tutorial/Kbd.svelte";
  import Callout from "$lib/components/tutorial/Callout.svelte";
</script>

<svelte:head>
  <title>Keyboard shortcuts · Tutorial · {SITE_NAME}</title>
  <meta name="description" content="Every keyboard shortcut the PDFy editor recognises." />
  <meta property="og:title" content={`Keyboard shortcuts · Tutorial · ${SITE_NAME}`} />
  <meta property="og:description" content="The list of editor shortcuts in PDFy." />
</svelte:head>

<header class="mb-10">
  <p class="text-muted-foreground mb-3 font-mono text-xs tracking-wider uppercase">
    Reference, 3 of 3
  </p>
  <h1 class="text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
    Keyboard shortcuts
  </h1>
  <p class="text-muted-foreground mt-4 max-w-2xl text-lg leading-relaxed">
    Short list, mostly muscle memory you already have from your file manager.
  </p>
</header>

<section class="mb-12 space-y-4">
  <h2 class="text-2xl font-semibold tracking-tight">Print plan</h2>
  <ul class="border-foreground/10 divide-foreground/10 divide-y border-y">
    <li class="flex items-center justify-between gap-4 py-3">
      <span class="text-foreground/85 text-sm">Rename selected entry</span>
      <span class="inline-flex items-center gap-1.5">
        <Kbd>F2</Kbd>
      </span>
    </li>
    <li class="flex items-center justify-between gap-4 py-3">
      <span class="text-foreground/85 text-sm">Remove selected entries</span>
      <span class="inline-flex items-center gap-1.5">
        <Kbd>Del</Kbd>
        <span class="text-muted-foreground/60 text-xs">or</span>
        <Kbd>Backspace</Kbd>
      </span>
    </li>
    <li class="flex items-center justify-between gap-4 py-3">
      <span class="text-foreground/85 text-sm">Range-select between two entries</span>
      <span class="inline-flex items-center gap-1.5">
        <Kbd>Shift</Kbd>
        <span class="text-muted-foreground/60 text-xs">+</span>
        <span class="text-muted-foreground text-xs">click</span>
      </span>
    </li>
    <li class="flex items-center justify-between gap-4 py-3">
      <span class="text-foreground/85 text-sm">Toggle individual selection</span>
      <span class="inline-flex items-center gap-1.5">
        <Kbd>Ctrl</Kbd>
        <span class="text-muted-foreground/60 text-xs">/</span>
        <Kbd>Cmd</Kbd>
        <span class="text-muted-foreground/60 text-xs">+</span>
        <span class="text-muted-foreground text-xs">click</span>
      </span>
    </li>
  </ul>
</section>

<section class="mb-12 space-y-4">
  <h2 class="text-2xl font-semibold tracking-tight">File tree</h2>
  <ul class="border-foreground/10 divide-foreground/10 divide-y border-y">
    <li class="flex items-center justify-between gap-4 py-3">
      <span class="text-foreground/85 text-sm">Add a single file to the plan</span>
      <span class="inline-flex items-center gap-1.5">
        <span class="text-muted-foreground text-xs">double-click</span>
      </span>
    </li>
    <li class="flex items-center justify-between gap-4 py-3">
      <span class="text-foreground/85 text-sm">Add a range of files to the plan</span>
      <span class="inline-flex items-center gap-1.5">
        <Kbd>Shift</Kbd>
        <span class="text-muted-foreground/60 text-xs">+</span>
        <span class="text-muted-foreground text-xs">click</span>
      </span>
    </li>
  </ul>
</section>

<section class="mb-12 space-y-4">
  <h2 class="text-2xl font-semibold tracking-tight">Project</h2>
  <ul class="border-foreground/10 divide-foreground/10 divide-y border-y">
    <li class="flex items-center justify-between gap-4 py-3">
      <span class="text-foreground/85 text-sm">Undo</span>
      <span class="inline-flex items-center gap-1.5">
        <Kbd>Ctrl</Kbd>
        <span class="text-muted-foreground/60 text-xs">/</span>
        <Kbd>Cmd</Kbd>
        <span class="text-muted-foreground/60 text-xs">+</span>
        <Kbd>Z</Kbd>
      </span>
    </li>
    <li class="flex items-center justify-between gap-4 py-3">
      <span class="text-foreground/85 text-sm">Redo</span>
      <span class="inline-flex items-center gap-1.5">
        <Kbd>Ctrl</Kbd>
        <span class="text-muted-foreground/60 text-xs">/</span>
        <Kbd>Cmd</Kbd>
        <span class="text-muted-foreground/60 text-xs">+</span>
        <Kbd>Shift</Kbd>
        <span class="text-muted-foreground/60 text-xs">+</span>
        <Kbd>Z</Kbd>
      </span>
    </li>
    <li class="flex items-center justify-between gap-4 py-3">
      <span class="text-foreground/85 text-sm">Print</span>
      <span class="inline-flex items-center gap-1.5">
        <Kbd>Ctrl</Kbd>
        <span class="text-muted-foreground/60 text-xs">/</span>
        <Kbd>Cmd</Kbd>
        <span class="text-muted-foreground/60 text-xs">+</span>
        <Kbd>P</Kbd>
      </span>
    </li>
  </ul>
</section>

<section class="space-y-4">
  <h2 class="text-2xl font-semibold tracking-tight">Discoverability</h2>
  <Callout kind="note">
    <p>
      The shortcut list above also lives in the editor itself. Hover an action's icon and the
      tooltip shows the shortcut where applicable.
    </p>
  </Callout>
</section>

<Pagination />
