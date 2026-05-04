<script lang="ts">
  import { SITE_NAME } from "$lib/site";
  import Pagination from "$lib/components/tutorial/Pagination.svelte";
  import Callout from "$lib/components/tutorial/Callout.svelte";
  import MockPrintDialog from "$lib/components/tutorial/MockPrintDialog.svelte";
</script>

<svelte:head>
  <title>Save your code as a PDF · Tutorial · {SITE_NAME}</title>
  <meta
    name="description"
    content="How to save your code as a searchable PDF using your browser's print dialog. Pick Save as PDF, match the page size, no printer required."
  />
  <meta property="og:title" content={`Save your code as a PDF · Tutorial · ${SITE_NAME}`} />
  <meta property="og:description" content="Click Print, pick Save as PDF, done." />
  <meta property="og:type" content="article" />
</svelte:head>

<header class="mb-10">
  <p class="text-muted-foreground mb-3 font-mono text-xs tracking-wider uppercase">
    Get started, 3 of 3
  </p>
  <h1 class="text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">Save the PDF</h1>
  <p class="text-muted-foreground mt-4 max-w-2xl text-lg leading-relaxed">
    PDFy doesn't generate the file itself. Your browser does. The trick is one dropdown.
  </p>
</header>

<section class="mb-12 space-y-4">
  <h2 class="text-2xl font-semibold tracking-tight">Click Print</h2>
  <p class="text-foreground/85 leading-relaxed">
    Hit the <strong>Print</strong> button in the editor's header. Or press
    <kbd
      class="border-foreground/20 bg-muted/40 inline-flex h-5 min-w-[1.5em] items-center justify-center rounded-sm border px-1.5 font-mono text-[11px] leading-none"
      >Ctrl</kbd
    >
    +
    <kbd
      class="border-foreground/20 bg-muted/40 inline-flex h-5 min-w-[1.5em] items-center justify-center rounded-sm border px-1.5 font-mono text-[11px] leading-none"
      >P</kbd
    >
    (
    <kbd
      class="border-foreground/20 bg-muted/40 inline-flex h-5 min-w-[1.5em] items-center justify-center rounded-sm border px-1.5 font-mono text-[11px] leading-none"
      >Cmd</kbd
    >
    +
    <kbd
      class="border-foreground/20 bg-muted/40 inline-flex h-5 min-w-[1.5em] items-center justify-center rounded-sm border px-1.5 font-mono text-[11px] leading-none"
      >P</kbd
    > on macOS) to use the browser shortcut directly. Either way, the browser's print dialog opens.
  </p>
</section>

<section class="mb-12 space-y-4">
  <h2 class="text-2xl font-semibold tracking-tight">Pick Save as PDF</h2>
  <p class="text-foreground/85 leading-relaxed">
    The print dialog defaults to whatever printer you used last. To get a PDF, change the <strong
      >Destination</strong
    >
    dropdown at the top to <strong>Save as PDF</strong> (or <strong>Microsoft Print to PDF</strong> on
    Windows).
  </p>

  <div class="my-6">
    <MockPrintDialog />
  </div>

  <p class="text-foreground/85 leading-relaxed">
    Click <strong>Save</strong> and pick a location. You're done. The file is a normal PDF: text-based,
    fully searchable, copy-pasteable. Tiny compared to image-based exports.
  </p>
</section>

<section class="mb-12 space-y-4">
  <h2 class="text-2xl font-semibold tracking-tight">Page size</h2>
  <p class="text-foreground/85 leading-relaxed">
    PDFy lays out the preview at A4 by default. Switch to US Letter in <a
      href="/tutorial/settings"
      class="text-primary hover:text-primary/80 underline underline-offset-4">Settings</a
    > if that's what you need; the layout adjusts and the print dialog inherits the same size.
  </p>
  <Callout kind="watch-out">
    <p>
      If the print dialog's paper size doesn't match what PDFy laid out (e.g., you set A4 in PDFy
      but the dialog says Letter), the output gets scaled or cropped. Match them before saving.
    </p>
  </Callout>
</section>

<section class="space-y-4">
  <h2 class="text-2xl font-semibold tracking-tight">No printer needed</h2>
  <p class="text-foreground/85 leading-relaxed">
    Save as PDF works on every modern OS without a printer installed. Chrome and Edge bundle a
    virtual PDF printer; macOS has had one since forever. If your dialog only shows a real printer,
    scroll the destination list, the PDF option is usually grouped under <strong>Save</strong> or
    <strong>Local destinations</strong>.
  </p>
</section>

<Pagination />
