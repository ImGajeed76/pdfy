<script lang="ts">
  import { SITE_NAME } from "$lib/site";
  import Pagination from "$lib/components/tutorial/Pagination.svelte";
  import Callout from "$lib/components/tutorial/Callout.svelte";
  import MockPage from "$lib/components/tutorial/MockPage.svelte";
</script>

<svelte:head>
  <title>Cover page · Tutorial · {SITE_NAME}</title>
  <meta
    name="description"
    content="Add a cover page to a PDFy export, edit the title and subtitle in place, optional date."
  />
  <meta property="og:title" content={`Cover page · Tutorial · ${SITE_NAME}`} />
  <meta
    property="og:description"
    content="Click +, then click the cover title to edit it. That's the whole interaction."
  />
</svelte:head>

<header class="mb-10">
  <p class="text-muted-foreground mb-3 font-mono text-xs tracking-wider uppercase">
    Customise, 1 of 4
  </p>
  <h1 class="text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">Cover page</h1>
  <p class="text-muted-foreground mt-4 max-w-2xl text-lg leading-relaxed">
    The cover is a real entry in your plan, not a checkbox. Add it, click to edit it.
  </p>
</header>

<section class="mb-12 space-y-4">
  <h2 class="text-2xl font-semibold tracking-tight">Add one</h2>
  <p class="text-foreground/85 leading-relaxed">
    In the print plan panel, click the <strong>+</strong> button in the header and pick
    <strong>Add cover page</strong>. The cover appears at the current position in the plan, which
    usually means right at the top.
  </p>
  <p class="text-foreground/85 leading-relaxed">
    The default title is your folder name. The cover counts as the first page when page numbering
    starts.
  </p>
</section>

<section class="mb-12 space-y-4">
  <h2 class="text-2xl font-semibold tracking-tight">Edit it in place</h2>
  <div class="my-8">
    <MockPage label="Cover">
      <div class="flex h-full flex-col items-center justify-center gap-2 text-center">
        <div class="bg-foreground/40 h-2.5 w-3/4 rounded-sm"></div>
        <div class="bg-foreground/20 h-1.5 w-1/2 rounded-sm"></div>
        <div class="bg-foreground/15 mt-4 h-1 w-1/3 rounded-sm"></div>
      </div>
    </MockPage>
  </div>
  <p class="text-foreground/85 leading-relaxed">
    In the preview, click the cover title to edit. A small dialog opens with a single text field.
    Same for the subtitle (which is optional, click <strong>+ Add subtitle</strong> to add one).
  </p>
  <p class="text-foreground/85 leading-relaxed">
    The title falls back to the folder name if you leave it empty, so you can never end up with a
    blank cover by accident.
  </p>
</section>

<section class="mb-12 space-y-4">
  <h2 class="text-2xl font-semibold tracking-tight">Date</h2>
  <p class="text-foreground/85 leading-relaxed">
    Below the cover title in the contextual bar (visible when the cover is selected in the plan)
    there's a toggle for <strong>Show date</strong> and a date picker for the date itself. Leave the picker
    empty to render today's date at print time.
  </p>
  <Callout kind="tip">
    <p>
      Locking a date is useful for graded submissions where the deadline is tomorrow but you wrote
      everything two weeks ago. Set the date to the deadline and reprint without re-editing the day
      before.
    </p>
  </Callout>
</section>

<section class="space-y-4">
  <h2 class="text-2xl font-semibold tracking-tight">Multiple covers</h2>
  <p class="text-foreground/85 leading-relaxed">
    Nothing stops you from adding more than one cover entry. Useful for splitting a long document
    into chapters, each introduced by its own cover. Each cover is independent: separate title,
    subtitle, date.
  </p>
</section>

<Pagination />
