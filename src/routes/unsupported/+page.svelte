<script lang="ts">
  import { onMount } from "svelte";
  import { Button } from "$lib/components/ui/button";
  import Logo from "$lib/components/Logo.svelte";
  import ExternalLink from "@lucide/svelte/icons/external-link";
  import Copy from "@lucide/svelte/icons/copy";
  import Check from "@lucide/svelte/icons/check";
  import RefreshCw from "@lucide/svelte/icons/refresh-cw";

  // Brave exposes navigator.brave.isBrave() (async) for reliable detection.
  // Brave's user-agent string masks itself as Chrome to defeat fingerprinting,
  // so UA sniffing doesn't work, this is the official check.
  type BraveNavigator = Navigator & { brave?: { isBrave?: () => Promise<boolean> } };

  let isBrave = $state(false);
  let copied = $state(false);

  // Direct anchor to the flag: skips the "search for it" step. The flag id
  // has been stable across recent Brave versions; if it ever moves, the
  // /flags root still works as a fallback.
  const BRAVE_FLAG_URL = "brave://flags/#file-system-access-api";

  onMount(async () => {
    const nav = navigator as BraveNavigator;
    if (typeof nav.brave?.isBrave === "function") {
      try {
        isBrave = await nav.brave.isBrave();
      } catch {
        // Some Brave forks may throw, treat as not Brave.
      }
    }
  });

  async function copyFlagUrl(): Promise<void> {
    try {
      await navigator.clipboard.writeText(BRAVE_FLAG_URL);
      copied = true;
      setTimeout(() => (copied = false), 2000);
    } catch {
      // Clipboard API blocked, the URL is visible on screen so the user can
      // still select-and-copy it manually.
    }
  }

  // When the user is already on Brave, drop Brave from the "switch browser"
  // list since the answer is to flip a flag, not install something else.
  const browsersAll = [
    { name: "Chrome", url: "https://www.google.com/chrome/" },
    { name: "Edge", url: "https://www.microsoft.com/edge" },
    { name: "Brave", url: "https://brave.com/" },
    { name: "Arc", url: "https://arc.net/" },
    { name: "Opera", url: "https://www.opera.com/" },
    { name: "Vivaldi", url: "https://vivaldi.com/" },
  ];
  const browsers = $derived(isBrave ? browsersAll.filter((b) => b.name !== "Brave") : browsersAll);
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
        src="/foxes/with-paper-sad-448.webp"
        alt=""
        aria-hidden="true"
        class="pointer-events-none size-48 select-none sm:size-56"
      />

      {#if isBrave}
        <h1
          class="mt-6 text-4xl leading-[1.1] font-semibold tracking-tight text-balance sm:text-5xl"
        >
          Almost <span class="text-primary">there.</span>
        </h1>
        <p class="text-muted-foreground mt-5 max-w-lg text-lg">
          Brave disables the File System Access API by default for privacy. Flip one flag and PDFy
          works.
        </p>

        <!-- Brave fix card: the primary action for a Brave user. Numbered
             list inside a single bordered panel keeps the visual weight low
             while making the steps unmistakable. -->
        <div class="border-foreground/15 mt-10 w-full border p-6 text-left sm:p-8">
          <p class="text-muted-foreground mb-5 font-mono text-xs tracking-wider uppercase">
            Enable the flag in Brave
          </p>
          <ol class="space-y-5 text-base sm:text-lg">
            <li class="flex gap-4">
              <span
                class="text-primary mt-0.5 shrink-0 font-mono text-sm tabular-nums"
                aria-hidden="true">01</span
              >
              <div class="min-w-0 flex-1">
                <p class="text-foreground/90 leading-snug">
                  Copy this URL and paste it into Brave's address bar.
                </p>
                <div
                  class="border-foreground/15 bg-muted/40 mt-3 flex items-center gap-2 border p-2"
                >
                  <code
                    class="text-foreground flex-1 truncate font-mono text-sm select-all sm:text-base"
                    >{BRAVE_FLAG_URL}</code
                  >
                  <button
                    type="button"
                    onclick={copyFlagUrl}
                    class="border-foreground/15 hover:bg-foreground/5 inline-flex h-8 shrink-0 items-center gap-1.5 border px-2.5 font-mono text-xs tracking-wider uppercase transition-colors"
                    aria-label={copied ? "Copied" : "Copy URL to clipboard"}
                  >
                    {#if copied}
                      <Check class="text-primary size-3.5" />
                      Copied
                    {:else}
                      <Copy class="size-3.5" />
                      Copy
                    {/if}
                  </button>
                </div>
                <p class="text-muted-foreground/80 mt-2 text-sm">
                  Browsers won't let websites link directly to internal pages, so you have to paste
                  it yourself.
                </p>
              </div>
            </li>
            <li class="flex gap-4">
              <span
                class="text-primary mt-0.5 shrink-0 font-mono text-sm tabular-nums"
                aria-hidden="true">02</span
              >
              <p class="text-foreground/90 flex-1 leading-snug">
                Set <strong class="text-foreground">File System Access API</strong> to
                <strong class="text-foreground">Enabled</strong>.
              </p>
            </li>
            <li class="flex gap-4">
              <span
                class="text-primary mt-0.5 shrink-0 font-mono text-sm tabular-nums"
                aria-hidden="true">03</span
              >
              <p class="text-foreground/90 flex-1 leading-snug">
                Click <strong class="text-foreground">Relaunch</strong> at the bottom of the page.
              </p>
            </li>
            <li class="flex gap-4">
              <span
                class="text-primary mt-0.5 shrink-0 font-mono text-sm tabular-nums"
                aria-hidden="true">04</span
              >
              <p class="text-foreground/90 flex-1 leading-snug">Come back here and reload PDFy.</p>
            </li>
          </ol>

          <div class="border-foreground/10 mt-6 flex flex-wrap gap-3 border-t pt-6">
            <Button href="/editor" size="sm" class="group h-9 gap-2">
              <RefreshCw class="size-3.5 transition-transform group-hover:rotate-180" />
              Try again
            </Button>
          </div>
        </div>

        <!-- Demoted fallback: a Brave user who doesn't want to flip a flag
             can still grab a different browser. -->
        <div class="mt-12 w-full">
          <p class="text-muted-foreground mb-4 font-mono text-xs tracking-wider uppercase">
            Or use a different browser
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
        </div>
      {:else}
        <h1
          class="mt-6 text-4xl leading-[1.1] font-semibold tracking-tight text-balance sm:text-5xl"
        >
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
            Any Chromium-based desktop browser works. On phones and tablets the API isn't available
            at all, so you'll need a desktop or laptop.
          </p>
        </div>
      {/if}
    </div>
  </main>

  <footer class="border-foreground/15 border-t px-6 py-8">
    <div class="text-muted-foreground mx-auto max-w-6xl text-center text-sm sm:text-left">
      <p>&copy; {new Date().getFullYear()} PDFy &middot; GPL v3.0</p>
    </div>
  </footer>
</div>
