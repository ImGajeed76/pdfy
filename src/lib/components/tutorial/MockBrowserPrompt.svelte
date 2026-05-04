<script lang="ts">
  // Stylized "browser is asking for permission" dialog. Generic look, not a
  // pixel match for any specific browser.
</script>

<figure
  class="border-foreground/15 bg-background mx-auto w-full max-w-md border shadow-lg"
  role="presentation"
>
  <div class="border-foreground/10 flex items-center gap-2 border-b px-4 py-2.5">
    <span class="bg-foreground/20 size-2 rounded-full"></span>
    <span class="bg-foreground/20 size-2 rounded-full"></span>
    <span class="bg-foreground/20 size-2 rounded-full"></span>
    <span class="text-muted-foreground/70 ml-3 font-mono text-[10px] tracking-wide">
      pdfy.oseifert.ch wants to
    </span>
  </div>
  <div class="space-y-3 p-4">
    <p class="text-foreground text-sm font-medium">View files in this folder</p>
    <p class="text-muted-foreground text-xs leading-relaxed">
      The site is asking to read files from the folder you just picked. It can't see anything
      outside that folder.
    </p>
    <div class="flex justify-end gap-2 pt-1">
      <span
        class="border-foreground/20 text-muted-foreground inline-flex h-7 items-center border px-3 text-xs"
      >
        Cancel
      </span>
      <span
        class="bg-primary text-primary-foreground inline-flex h-7 items-center px-3 text-xs font-medium"
      >
        View files
      </span>
    </div>
  </div>
</figure>
