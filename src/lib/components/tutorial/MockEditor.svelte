<script lang="ts">
  // Three-pane editor mockup. Abstract: each pane is just a labeled column
  // with a few placeholder rows. Reader gets the spatial relationship without
  // us having to keep this in sync with the real UI.
</script>

<div class="border-foreground/15 bg-foreground/10 grid grid-cols-[1fr_1.2fr_1.6fr] gap-px border">
  <!-- TREE pane -->
  <div class="bg-background flex flex-col p-3">
    <p class="text-muted-foreground/80 mb-3 font-mono text-[10px] tracking-wider uppercase">Tree</p>
    <div class="space-y-1.5">
      <div class="flex items-center gap-1.5 text-xs">
        <span class="bg-primary/40 size-2.5 rounded-sm"></span>
        <span class="bg-foreground/30 h-2 w-16 rounded-sm"></span>
      </div>
      <div class="flex items-center gap-1.5 pl-4 text-xs">
        <span class="bg-foreground/20 size-2.5 rounded-sm"></span>
        <span class="bg-foreground/20 h-2 w-12 rounded-sm"></span>
      </div>
      <div class="flex items-center gap-1.5 pl-4 text-xs">
        <span class="bg-foreground/20 size-2.5 rounded-sm"></span>
        <span class="bg-foreground/20 h-2 w-20 rounded-sm"></span>
      </div>
      <div class="flex items-center gap-1.5 pl-4 text-xs">
        <span class="bg-foreground/20 size-2.5 rounded-sm"></span>
        <span class="bg-foreground/20 h-2 w-14 rounded-sm"></span>
      </div>
      <div class="flex items-center gap-1.5 text-xs">
        <span class="bg-primary/40 size-2.5 rounded-sm"></span>
        <span class="bg-foreground/30 h-2 w-10 rounded-sm"></span>
      </div>
      <div class="flex items-center gap-1.5 text-xs">
        <span class="bg-foreground/20 size-2.5 rounded-sm"></span>
        <span class="bg-foreground/20 h-2 w-16 rounded-sm"></span>
      </div>
    </div>
  </div>

  <!-- PLAN pane -->
  <div class="bg-background flex flex-col p-3">
    <p class="text-muted-foreground/80 mb-3 font-mono text-[10px] tracking-wider uppercase">
      Print plan
    </p>
    <div class="space-y-1.5">
      <div class="border-foreground/15 bg-muted/20 flex items-center gap-2 border px-2 py-1.5">
        <span class="bg-primary/60 size-2.5 rounded-sm"></span>
        <span class="bg-foreground/40 h-2 w-12 rounded-sm"></span>
      </div>
      <div class="border-foreground/15 bg-muted/20 flex items-center gap-2 border px-2 py-1.5">
        <span class="bg-primary/60 size-2.5 rounded-sm"></span>
        <span class="bg-foreground/40 h-2 w-20 rounded-sm"></span>
      </div>
      <div class="border-foreground/15 bg-muted/20 flex items-center gap-2 border px-2 py-1.5">
        <span class="bg-foreground/30 size-2.5 rounded-sm"></span>
        <span class="bg-foreground/40 h-2 w-16 rounded-sm"></span>
      </div>
      <div class="border-foreground/15 bg-muted/20 flex items-center gap-2 border px-2 py-1.5">
        <span class="bg-foreground/30 size-2.5 rounded-sm"></span>
        <span class="bg-foreground/40 h-2 w-14 rounded-sm"></span>
      </div>
    </div>
  </div>

  <!-- PREVIEW pane -->
  <div class="bg-muted/30 flex flex-col items-center p-3">
    <p
      class="text-muted-foreground/80 mb-3 self-start font-mono text-[10px] tracking-wider uppercase"
    >
      Preview
    </p>
    <div class="border-foreground/15 bg-background w-3/4 space-y-1.5 border p-3 shadow-sm">
      <div class="bg-foreground/30 h-2 w-1/2 rounded-sm"></div>
      <div class="space-y-1 pt-1">
        <div class="bg-foreground/15 h-1.5 w-full rounded-sm"></div>
        <div class="bg-foreground/15 h-1.5 w-5/6 rounded-sm"></div>
        <div class="bg-foreground/15 h-1.5 w-full rounded-sm"></div>
        <div class="bg-foreground/15 h-1.5 w-3/4 rounded-sm"></div>
        <div class="bg-foreground/15 h-1.5 w-full rounded-sm"></div>
        <div class="bg-foreground/15 h-1.5 w-4/6 rounded-sm"></div>
      </div>
    </div>
  </div>
</div>
