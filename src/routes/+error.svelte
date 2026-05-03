<script lang="ts">
  import { page } from "$app/state";
  import { Button } from "$lib/components/ui/button";
  import Logo from "$lib/components/Logo.svelte";
  import ArrowLeft from "@lucide/svelte/icons/arrow-left";

  const status = $derived(page.status);
  const isNotFound = $derived(status === 404);

  const headline = $derived(isNotFound ? "This page got unfolded." : "Something tore.");
  const description = $derived(
    isNotFound
      ? "We couldn't find what you were looking for. The fox is, uh, taking it hard."
      : (page.error?.message ?? "An unexpected error occurred. Try again, or head home."),
  );
</script>

<svelte:head>
  <title>{isNotFound ? "Page not found" : "Something went wrong"} &middot; PDFy</title>
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
        src="/foxes/funeral.png"
        alt=""
        aria-hidden="true"
        class="pointer-events-none w-72 max-w-full select-none sm:w-96"
      />

      <p class="text-muted-foreground mt-6 font-mono text-xs tracking-wider uppercase">
        Error {status}
      </p>

      <h1 class="mt-3 text-4xl leading-[1.1] font-semibold tracking-tight text-balance sm:text-5xl">
        {headline}
      </h1>

      <p class="text-muted-foreground mt-5 max-w-lg text-lg">
        {description}
      </p>

      <div class="mt-10">
        <Button href="/" size="lg" class="group h-12 gap-2 px-6 text-base">
          <ArrowLeft class="size-4 transition-transform group-hover:-translate-x-1" />
          Back to PDFy
        </Button>
      </div>
    </div>
  </main>

  <footer class="border-foreground/15 border-t px-6 py-8">
    <div class="text-muted-foreground mx-auto max-w-6xl text-center text-sm sm:text-left">
      <p>&copy; {new Date().getFullYear()} PDFy &middot; GPL v3.0</p>
    </div>
  </footer>
</div>
