<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { editor } from "$lib/editor/state.svelte";
  import { toast } from "svelte-sonner";
  import FolderOpen from "@lucide/svelte/icons/folder-open";
  import Sparkles from "@lucide/svelte/icons/sparkles";

  async function handleOpen(): Promise<void> {
    const result = await editor.openProject();
    if (!result.ok && result.reason !== "cancelled-or-error") {
      toast.error("Could not open the folder.");
    }
  }
</script>

<div
  class="bg-background relative flex h-full flex-col items-center justify-center overflow-hidden px-6 py-12 text-center"
>
  <!-- Subtle ambient glow matching the homepage -->
  <div
    aria-hidden="true"
    class="bg-primary pointer-events-none absolute top-0 left-1/2 -z-10 h-[400px] w-[700px] -translate-x-1/2 rounded-full opacity-10 blur-[140px]"
  ></div>

  <img
    src="/foxes/with-paper.png"
    alt=""
    aria-hidden="true"
    class="pointer-events-none mb-6 size-40 select-none sm:size-52"
  />

  <p class="text-muted-foreground mb-2 font-mono text-xs tracking-wider uppercase">Editor</p>
  <h1 class="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
    Open a project to get started.
  </h1>
  <p class="text-muted-foreground mt-4 max-w-md text-base">
    Pick a folder on your computer. PDFy will read the files locally and you'll compose the PDF you
    want.
  </p>

  <div class="mt-10 flex items-center gap-3">
    <Button onclick={handleOpen} size="lg" class="group h-12 gap-2 px-6 text-base">
      <FolderOpen class="size-4" />
      Open a folder
    </Button>
  </div>

  <p class="text-muted-foreground/70 mt-10 max-w-md text-xs">
    <Sparkles class="inline size-3.5 align-text-bottom" />
    By default, all your code, text, and markdown files will be added to the print plan automatically.
    You can change anything before printing.
  </p>
</div>
