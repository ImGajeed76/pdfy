<script lang="ts">
  import { SITE_NAME } from "$lib/site";
  import Pagination from "$lib/components/tutorial/Pagination.svelte";
  import Callout from "$lib/components/tutorial/Callout.svelte";
  import Check from "@lucide/svelte/icons/check";
  import X from "@lucide/svelte/icons/x";
</script>

<svelte:head>
  <title>Browser support · Tutorial · {SITE_NAME}</title>
  <meta
    name="description"
    content="Which browsers PDFy works in, and why Firefox and Safari are blocked at the editor."
  />
  <meta property="og:title" content={`Browser support · Tutorial · ${SITE_NAME}`} />
  <meta property="og:description" content="Chrome, Edge, Brave, Opera, Arc, Vivaldi." />
</svelte:head>

<header class="mb-10">
  <p class="text-muted-foreground mb-3 font-mono text-xs tracking-wider uppercase">Help, 2 of 2</p>
  <h1 class="text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">Browser support</h1>
  <p class="text-muted-foreground mt-4 max-w-2xl text-lg leading-relaxed">
    Anything Chromium-based works. Firefox and Safari can't.
  </p>
</header>

<section class="mb-12 space-y-4">
  <h2 class="text-2xl font-semibold tracking-tight">The list</h2>
  <ul class="border-foreground/10 divide-foreground/10 divide-y border-y">
    <li class="flex items-center justify-between gap-4 py-3">
      <span class="text-foreground/85 text-sm">Chrome</span>
      <Check class="text-primary size-4" />
    </li>
    <li class="flex items-center justify-between gap-4 py-3">
      <span class="text-foreground/85 text-sm">Edge</span>
      <Check class="text-primary size-4" />
    </li>
    <li class="flex items-center justify-between gap-4 py-3">
      <span class="text-foreground/85 text-sm">Brave</span>
      <Check class="text-primary size-4" />
    </li>
    <li class="flex items-center justify-between gap-4 py-3">
      <span class="text-foreground/85 text-sm">Opera</span>
      <Check class="text-primary size-4" />
    </li>
    <li class="flex items-center justify-between gap-4 py-3">
      <span class="text-foreground/85 text-sm">Arc</span>
      <Check class="text-primary size-4" />
    </li>
    <li class="flex items-center justify-between gap-4 py-3">
      <span class="text-foreground/85 text-sm">Vivaldi</span>
      <Check class="text-primary size-4" />
    </li>
    <li class="flex items-center justify-between gap-4 py-3">
      <span class="text-muted-foreground text-sm">Firefox</span>
      <X class="text-muted-foreground/70 size-4" />
    </li>
    <li class="flex items-center justify-between gap-4 py-3">
      <span class="text-muted-foreground text-sm">Safari</span>
      <X class="text-muted-foreground/70 size-4" />
    </li>
  </ul>
</section>

<section class="mb-12 space-y-4">
  <h2 class="text-2xl font-semibold tracking-tight">Why some browsers don't work</h2>
  <p class="text-foreground/85 leading-relaxed">
    PDFy reads your folder using the
    <a
      href="https://developer.mozilla.org/docs/Web/API/File_System_Access_API"
      target="_blank"
      rel="noopener noreferrer"
      class="text-primary hover:text-primary/80 underline underline-offset-4"
      >File System Access API</a
    >. The whole "no uploads" promise depends on it: PDFy hands the picker to your browser, your
    browser returns a handle to the folder you pick, and PDFy reads files via that handle. No file
    ever crosses the network.
  </p>
  <p class="text-foreground/85 leading-relaxed">
    Firefox and Safari haven't shipped the API. They could, and probably will eventually, but as of
    this writing they don't. PDFy detects the missing API on the editor route and redirects to a
    friendly explanation page so you don't sit looking at a broken button.
  </p>
</section>

<section class="mb-12 space-y-4">
  <h2 class="text-2xl font-semibold tracking-tight">Mobile</h2>
  <p class="text-foreground/85 leading-relaxed">
    Chromium-based mobile browsers (Chrome on Android, Edge on Android) implement the API, but the
    folder picker UX on mobile is awkward and the small screen makes the three-pane editor hard to
    use. PDFy is best on desktop.
  </p>
</section>

<section class="space-y-4">
  <h2 class="text-2xl font-semibold tracking-tight">If you're stuck on Firefox or Safari</h2>
  <Callout kind="tip">
    <p>
      Install Chrome, Edge, or Brave just for this task. They run side-by-side with your usual
      browser and you don't need to import anything; you just open
      <code class="font-mono text-sm">pdfy.oseifert.ch</code> in the new browser and you're set. The export
      is a normal PDF, viewable anywhere.
    </p>
  </Callout>
</section>

<Pagination />
