<script lang="ts">
  // Dev-only OG card. Render this route, screenshot the .og-card element at
  // 1200x630, then run:
  //   magick input.png -trim +repage -resize 1200x630! static/og.png
  // Page meta is set noindex so Google doesn't pick it up if it leaks out.
  import Logo from "$lib/components/Logo.svelte";
</script>

<svelte:head>
  <title>OG card preview</title>
  <meta name="robots" content="noindex,nofollow" />
</svelte:head>

<div class="bg-muted/40 flex min-h-screen items-center justify-center p-8">
  <div class="og-card">
    <!-- Background grid + glow, mirrors the home hero. -->
    <div
      aria-hidden="true"
      class="text-foreground absolute inset-0 opacity-[0.05]"
      style="background-image: linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px); background-size: 56px 56px;"
    ></div>
    <div
      aria-hidden="true"
      class="from-background pointer-events-none absolute inset-0 bg-radial-[ellipse_at_center] from-30% to-transparent"
    ></div>
    <div
      aria-hidden="true"
      class="bg-primary pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full opacity-15 blur-[140px]"
    ></div>

    <!-- Foreground content. Two-column to match the home hero. -->
    <div class="relative grid h-full grid-cols-[1.3fr_1fr] items-center gap-12 px-20 py-16">
      <div class="text-left">
        <div class="mb-12 flex items-center gap-3">
          <Logo class="size-12" />
          <span class="text-3xl font-semibold tracking-tight">PDFy</span>
        </div>

        <h1
          class="text-foreground text-[88px] leading-[1.02] font-semibold tracking-tight text-balance"
        >
          Folder in.<br /><span class="text-primary">Searchable</span> PDF out.
        </h1>

        <p class="text-muted-foreground mt-8 text-2xl">
          Pick a folder, click print. Everything happens in your browser.
        </p>

        <p class="text-muted-foreground/80 mt-10 font-mono text-base tracking-wide">
          No uploads &nbsp;·&nbsp; No installs &nbsp;·&nbsp; No signup
        </p>
      </div>

      <div class="flex justify-end">
        <img
          src="/foxes/with-paper.png"
          alt=""
          aria-hidden="true"
          class="pointer-events-none size-96 -rotate-6 select-none"
        />
      </div>
    </div>
  </div>
</div>

<style>
  /* Locked-in 1200x630 card. Screenshot just this element. */
  .og-card {
    position: relative;
    width: 1200px;
    height: 630px;
    background: var(--background);
    overflow: hidden;
  }
</style>
