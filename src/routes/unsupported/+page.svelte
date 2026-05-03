<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import Logo from "$lib/components/Logo.svelte";
  import ExternalLink from "@lucide/svelte/icons/external-link";

  const browsers = [
    { name: "Chrome", url: "https://www.google.com/chrome/" },
    { name: "Edge", url: "https://www.microsoft.com/edge" },
    { name: "Brave", url: "https://brave.com/" },
    { name: "Arc", url: "https://arc.net/" },
    { name: "Opera", url: "https://www.opera.com/" },
    { name: "Vivaldi", url: "https://vivaldi.com/" },
  ];
</script>

<svelte:head>
  <title>Browser not supported &middot; PDFy</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<div class="bg-background text-foreground flex min-h-screen flex-col">
  <header class="border-foreground/15 border-b">
    <nav class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 sm:px-8">
      <a href="/" class="flex items-center gap-2 text-base font-semibold tracking-tight">
        <Logo class="size-6" />
        <span>PDFy</span>
      </a>
    </nav>
  </header>

  <main class="flex flex-grow items-center justify-center px-6 py-16 sm:py-24">
    <div class="mx-auto flex max-w-2xl flex-col items-center text-center">
      <img
        src="/foxes/with-paper-sad.png"
        alt=""
        aria-hidden="true"
        class="pointer-events-none size-48 select-none sm:size-56"
      />

      <h1 class="mt-6 text-4xl leading-[1.1] font-semibold tracking-tight text-balance sm:text-5xl">
        Your browser can't <span class="text-primary">unfold</span> this.
      </h1>

      <p class="text-muted-foreground mt-5 max-w-lg text-lg">
        PDFy reads folders directly from your computer using the File System Access API. Your
        current browser doesn't support it.
      </p>

      <div class="mt-12 w-full">
        <p class="text-muted-foreground mb-5 font-mono text-xs tracking-wider uppercase">
          Open PDFy in one of these instead
        </p>
        <div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {#each browsers as browser (browser.name)}
            <Button
              href={browser.url}
              variant="outline"
              target="_blank"
              rel="noopener noreferrer"
              class="group h-11 justify-between gap-3"
            >
              {browser.name}
              <ExternalLink
                class="text-muted-foreground size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Button>
          {/each}
        </div>
        <p class="text-muted-foreground/80 mt-6 text-sm leading-relaxed">
          Any Chromium-based desktop browser works. On phones and tablets the API isn't available at
          all, so you'll need a desktop or laptop.
        </p>
      </div>
    </div>
  </main>

  <footer class="border-foreground/15 border-t px-6 py-8">
    <div class="text-muted-foreground mx-auto max-w-6xl text-center text-sm sm:text-left">
      <p>&copy; {new Date().getFullYear()} PDFy &middot; GPL v3.0</p>
    </div>
  </footer>
</div>
