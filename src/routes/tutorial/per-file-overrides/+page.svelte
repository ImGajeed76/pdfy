<script lang="ts">
  import { SITE_NAME } from "$lib/site";
  import Pagination from "$lib/components/tutorial/Pagination.svelte";
  import Callout from "$lib/components/tutorial/Callout.svelte";
  import MockToolbar from "$lib/components/tutorial/MockToolbar.svelte";
  import MockButton from "$lib/components/tutorial/MockButton.svelte";
</script>

<svelte:head>
  <title>Per-file overrides · Tutorial · {SITE_NAME}</title>
  <meta
    name="description"
    content="Custom titles, line numbers per file, image scale and alignment, page-break controls."
  />
  <meta property="og:title" content={`Per-file overrides · Tutorial · ${SITE_NAME}`} />
  <meta
    property="og:description"
    content="Per-entry settings live in the contextual bar at the top of the editor."
  />
</svelte:head>

<header class="mb-10">
  <p class="text-muted-foreground mb-3 font-mono text-xs tracking-wider uppercase">
    Customise, 4 of 4
  </p>
  <h1 class="text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
    Per-file overrides
  </h1>
  <p class="text-muted-foreground mt-4 max-w-2xl text-lg leading-relaxed">
    Most settings apply project-wide, but you can override them on a single entry when you need to.
  </p>
</header>

<section class="mb-12 space-y-4">
  <h2 class="text-2xl font-semibold tracking-tight">The contextual bar</h2>
  <p class="text-foreground/85 leading-relaxed">
    Select a single entry in the print plan and a thin toolbar appears at the top of the editor. It
    changes based on what the entry is: a code file, an image, a cover, the TOC.
  </p>
  <div class="my-6">
    <MockToolbar>
      <MockButton label="Title" />
      <MockButton label="Lines: default" icon="123" />
      <MockButton icon="↺" label="Reset" />
    </MockToolbar>
  </div>
  <p class="text-foreground/85 leading-relaxed">
    With nothing selected, the bar shows project-wide defaults instead.
  </p>
</section>

<section class="mb-12 space-y-4">
  <h2 class="text-2xl font-semibold tracking-tight">Common overrides</h2>

  <h3 class="text-lg font-medium">Custom title</h3>
  <p class="text-foreground/85 leading-relaxed">
    Click <strong>Title</strong> in the contextual bar (or press
    <kbd
      class="border-foreground/20 bg-muted/40 inline-flex h-5 min-w-[1.5em] items-center justify-center rounded-sm border px-1.5 font-mono text-[11px] leading-none"
      >F2</kbd
    >
    with the entry selected). Replaces the filename used as the section heading and in headers / footers
    / TOC. Useful for "Authentication module" instead of
    <code class="font-mono text-sm">auth.ts</code>.
  </p>

  <h3 class="mt-6 text-lg font-medium">Line numbers</h3>
  <p class="text-foreground/85 leading-relaxed">
    Project-wide line numbers come from
    <a
      href="/tutorial/settings"
      class="text-primary hover:text-primary/80 underline underline-offset-4">Settings</a
    >. The contextual bar lets you flip them on or off for just this entry. The button cycles
    through three states: default, on, off.
  </p>

  <h3 class="mt-6 text-lg font-medium">Image alignment and width</h3>
  <p class="text-foreground/85 leading-relaxed">
    Image entries get extra controls in the contextual bar: horizontal align (left, center, right),
    vertical align (top, middle, bottom), and a width percentage button. Click the width to enter a
    custom value.
  </p>

  <h3 class="mt-6 text-lg font-medium">Reset to defaults</h3>
  <p class="text-foreground/85 leading-relaxed">
    The <strong>Reset</strong> button clears every per-entry override on the selected entry, putting it
    back on project-wide defaults.
  </p>
</section>

<section class="mb-12 space-y-4">
  <h2 class="text-2xl font-semibold tracking-tight">Settings layered three deep</h2>
  <p class="text-foreground/85 leading-relaxed">The mental model:</p>
  <ol class="space-y-3 pl-1">
    <li class="text-foreground/85 leading-relaxed">
      <span class="text-foreground font-medium">App preferences</span>
      <span class="text-muted-foreground">
        (settings cog) live in localStorage, follow you across every project on this browser.
      </span>
    </li>
    <li class="text-foreground/85 leading-relaxed">
      <span class="text-foreground font-medium">Project settings</span>
      <span class="text-muted-foreground">
        (page-layout sheet) live with the project in IndexedDB. Headers, footers, TOC rows.
      </span>
    </li>
    <li class="text-foreground/85 leading-relaxed">
      <span class="text-foreground font-medium">Per-entry overrides</span>
      <span class="text-muted-foreground">
        (contextual bar) live on the entry itself. Always win over the layers above.
      </span>
    </li>
  </ol>
  <Callout kind="tip">
    <p>
      For most documents you'll only ever touch app preferences once, project settings a few times
      per project, and per-entry overrides almost never. The defaults are tuned to "good enough" so
      you don't have to.
    </p>
  </Callout>
</section>

<section class="space-y-4">
  <h2 class="text-2xl font-semibold tracking-tight">Multi-select shortcuts</h2>
  <p class="text-foreground/85 leading-relaxed">
    Select multiple entries with <kbd
      class="border-foreground/20 bg-muted/40 inline-flex h-5 min-w-[1.5em] items-center justify-center rounded-sm border px-1.5 font-mono text-[11px] leading-none"
      >Shift</kbd
    >-click (range) or
    <kbd
      class="border-foreground/20 bg-muted/40 inline-flex h-5 min-w-[1.5em] items-center justify-center rounded-sm border px-1.5 font-mono text-[11px] leading-none"
      >Ctrl</kbd
    >
    /
    <kbd
      class="border-foreground/20 bg-muted/40 inline-flex h-5 min-w-[1.5em] items-center justify-center rounded-sm border px-1.5 font-mono text-[11px] leading-none"
      >Cmd</kbd
    >-click (toggle individual). When more than one is selected, the contextual bar shows the
    actions that make sense for a group: remove, etc. See
    <a
      href="/tutorial/keyboard-shortcuts"
      class="text-primary hover:text-primary/80 underline underline-offset-4">keyboard shortcuts</a
    >.
  </p>
</section>

<Pagination />
