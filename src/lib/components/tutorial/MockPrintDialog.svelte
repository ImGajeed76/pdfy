<script lang="ts">
  // Stylized version of the Chrome print dialog (the side-panel one).
  // Highlights the Destination row so the reader sees where they pick
  // "Save as PDF". Labels are English; the real dialog uses the browser's
  // language.
  import ExternalLink from "@lucide/svelte/icons/external-link";
</script>

<figure
  class="border-foreground/15 bg-background mx-auto flex w-full max-w-sm flex-col border shadow-lg"
  role="presentation"
>
  <!-- Header: title + page count -->
  <div class="border-foreground/10 flex items-center justify-between gap-3 border-b px-5 py-3">
    <p class="text-foreground text-sm font-medium">Print</p>
    <p class="text-muted-foreground text-xs">11 pages</p>
  </div>

  <!-- Form rows -->
  <div class="space-y-4 px-5 py-4">
    <!-- Destination, highlighted -->
    <div class="grid grid-cols-[5.5rem_1fr] items-center gap-3">
      <span class="text-muted-foreground text-xs">Destination</span>
      <div
        class="border-primary bg-primary/5 inline-flex h-8 items-center justify-between gap-2 border px-2.5 text-xs"
      >
        <span class="text-foreground inline-flex items-center gap-1.5">
          <span class="bg-primary/40 size-3 rounded-sm"></span>
          <span class="font-medium">Save as PDF</span>
        </span>
        <span class="text-muted-foreground/60">▾</span>
      </div>
    </div>

    <div class="grid grid-cols-[5.5rem_1fr] items-center gap-3">
      <span class="text-muted-foreground text-xs">Pages</span>
      <div
        class="border-foreground/15 inline-flex h-8 items-center justify-between gap-2 border px-2.5 text-xs"
      >
        <span class="text-foreground/80">All</span>
        <span class="text-muted-foreground/60">▾</span>
      </div>
    </div>

    <div class="grid grid-cols-[5.5rem_1fr] items-center gap-3">
      <span class="text-muted-foreground text-xs">Pages per sheet</span>
      <div
        class="border-foreground/15 inline-flex h-8 items-center justify-between gap-2 border px-2.5 text-xs"
      >
        <span class="text-foreground/80">1</span>
        <span class="text-muted-foreground/60">▾</span>
      </div>
    </div>

    <div class="grid grid-cols-[5.5rem_1fr] items-center gap-3">
      <span class="text-muted-foreground text-xs">Margins</span>
      <div
        class="border-foreground/15 inline-flex h-8 items-center justify-between gap-2 border px-2.5 text-xs"
      >
        <span class="text-foreground/80">Default</span>
        <span class="text-muted-foreground/60">▾</span>
      </div>
    </div>

    <div class="grid grid-cols-[5.5rem_1fr] items-start gap-3">
      <span class="text-muted-foreground pt-1 text-xs">Options</span>
      <span class="inline-flex items-center gap-2 text-xs">
        <span class="border-foreground/30 bg-background size-3.5 border"></span>
        <span class="text-foreground/80">Background graphics</span>
      </span>
    </div>

    <span class="text-muted-foreground/80 inline-flex items-center gap-1.5 text-[11px]">
      Print using system dialog
      <ExternalLink class="size-3" />
    </span>
  </div>

  <!-- Spacer so the footer sits at a "tall panel" rest position -->
  <div class="min-h-12 flex-1"></div>

  <!-- Footer buttons -->
  <div class="border-foreground/10 flex justify-end gap-2 border-t px-5 py-3">
    <span
      class="border-foreground/20 text-muted-foreground inline-flex h-8 items-center rounded-full border px-4 text-xs"
    >
      Cancel
    </span>
    <span
      class="bg-primary text-primary-foreground inline-flex h-8 items-center rounded-full px-4 text-xs font-medium"
    >
      Save
    </span>
  </div>
</figure>
