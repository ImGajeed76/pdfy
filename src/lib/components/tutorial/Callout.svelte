<script lang="ts">
  import type { Snippet } from "svelte";
  import Info from "@lucide/svelte/icons/info";
  import Sparkles from "@lucide/svelte/icons/sparkles";
  import TriangleAlert from "@lucide/svelte/icons/triangle-alert";

  type Kind = "note" | "tip" | "watch-out";

  let { kind = "note", children }: { kind?: Kind; children: Snippet } = $props();

  const meta = {
    note: { icon: Info, label: "Note" },
    tip: { icon: Sparkles, label: "Tip" },
    "watch-out": { icon: TriangleAlert, label: "Watch out" },
  } as const;

  const Icon = $derived(meta[kind].icon);
</script>

<aside
  class="border-foreground/15 bg-muted/20 flex gap-3 border-l-2 px-4 py-3 text-sm"
  class:border-l-primary={kind === "tip"}
  class:bg-primary={kind === "tip"}
  style={kind === "tip"
    ? "background-color: color-mix(in oklch, var(--primary) 6%, transparent);"
    : ""}
>
  <Icon
    class="mt-0.5 size-4 shrink-0 {kind === 'tip'
      ? 'text-primary'
      : kind === 'watch-out'
        ? 'text-foreground'
        : 'text-muted-foreground'}"
  />
  <div class="text-foreground/85 leading-relaxed">
    <p
      class="text-foreground mb-1 font-mono text-[10px] tracking-wider uppercase {kind === 'tip'
        ? 'text-primary'
        : ''}"
    >
      {meta[kind].label}
    </p>
    {@render children()}
  </div>
</aside>
