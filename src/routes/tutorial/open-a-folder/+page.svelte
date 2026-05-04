<script lang="ts">
  import { SITE_NAME } from "$lib/site";
  import Pagination from "$lib/components/tutorial/Pagination.svelte";
  import Callout from "$lib/components/tutorial/Callout.svelte";
  import MockBrowserPrompt from "$lib/components/tutorial/MockBrowserPrompt.svelte";
</script>

<svelte:head>
  <title>Open a project folder for code-to-PDF · Tutorial · {SITE_NAME}</title>
  <meta
    name="description"
    content="How to open a local code folder in PDFy: what the browser asks, how the File System Access API works, how .gitignore is handled, and how to come back to a project later."
  />
  <meta
    property="og:title"
    content={`Open a project folder for code-to-PDF · Tutorial · ${SITE_NAME}`}
  />
  <meta
    property="og:description"
    content="Pick a code folder, grant the browser permission, and you're in. No upload step."
  />
  <meta property="og:type" content="article" />
</svelte:head>

<header class="mb-10">
  <p class="text-muted-foreground mb-3 font-mono text-xs tracking-wider uppercase">
    Get started, 1 of 3
  </p>
  <h1 class="text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">Open a folder</h1>
  <p class="text-muted-foreground mt-4 max-w-2xl text-lg leading-relaxed">
    Pick a project folder. The browser asks for permission once. PDFy reads it, that's the entire
    setup.
  </p>
</header>

<section class="mb-12 space-y-4">
  <h2 class="text-2xl font-semibold tracking-tight">From the home page</h2>
  <p class="text-foreground/85 leading-relaxed">
    Click <strong>Open PDFy</strong> on the home page (or <strong>Open App</strong> in the header). You
    land on the editor. The first thing you see is a button asking you to pick a folder.
  </p>
  <p class="text-foreground/85 leading-relaxed">
    Clicking it opens your operating system's folder picker. Pick the project root. PDFy works best
    when you point it at the top-level folder rather than at one subdirectory at a time, because
    then the file tree mirrors what you'd see in your editor.
  </p>
</section>

<section class="mb-12 space-y-4">
  <h2 class="text-2xl font-semibold tracking-tight">What the browser asks</h2>
  <p class="text-foreground/85 leading-relaxed">
    Right after you pick a folder, the browser shows a permission prompt. Roughly something like
    this, depending on which browser you use:
  </p>

  <div class="my-6">
    <MockBrowserPrompt />
  </div>

  <p class="text-foreground/85 leading-relaxed">
    Click the confirm button. The browser is just double-checking that the site is allowed to read
    the folder you just picked. PDFy can't see anything outside that folder, ever. The privacy page
    has the
    <a href="/privacy" class="text-primary hover:text-primary/80 underline underline-offset-4"
      >full breakdown</a
    >.
  </p>

  <Callout kind="note">
    <p>
      The permission lives until you close the tab. PDFy stores a permission token in IndexedDB so
      you can come back later via the recents list, but the browser still re-asks before reading
      anything on a new visit.
    </p>
  </Callout>
</section>

<section class="mb-12 space-y-4">
  <h2 class="text-2xl font-semibold tracking-tight">.gitignore is respected</h2>
  <p class="text-foreground/85 leading-relaxed">
    By default PDFy reads any <code class="font-mono text-sm">.gitignore</code> files in the folder
    and hides anything they exclude. So your <code class="font-mono text-sm">node_modules</code>,
    your <code class="font-mono text-sm">build/</code>, your
    <code class="font-mono text-sm">.next/</code>, all the noise you don't want in a code printout,
    gone by default.
  </p>
  <p class="text-foreground/85 leading-relaxed">
    If you want them back (rare, but it happens with submissions that explicitly require generated
    files), there's a toggle in
    <a
      href="/tutorial/settings"
      class="text-primary hover:text-primary/80 underline underline-offset-4">Settings</a
    >
    to turn this off. PDFy still hides huge dirs like <code class="font-mono text-sm">.git</code>
    and <code class="font-mono text-sm">node_modules</code> for performance even when the toggle is off.
  </p>
</section>

<section class="space-y-4">
  <h2 class="text-2xl font-semibold tracking-tight">Coming back later</h2>
  <p class="text-foreground/85 leading-relaxed">
    Once you've opened a folder, PDFy remembers it under a recents list. Next visit, open the
    recents sheet from the editor's header and click the project; the browser will ask for
    permission again, then drop you back into the same plan you had.
  </p>
</section>

<Pagination />
