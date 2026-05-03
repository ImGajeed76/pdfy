<script lang="ts">
  import { editor } from "$lib/editor/state.svelte";
  import { Button } from "$lib/components/ui/button";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import * as ToggleGroup from "$lib/components/ui/toggle-group";
  import type { IndexEntry } from "$lib/editor/types";
  import { determineFileDisplayProperties } from "$lib/fileSystem";
  import { promptText } from "$lib/editor/prompt.svelte";
  import Sun from "@lucide/svelte/icons/sun";
  import Moon from "@lucide/svelte/icons/moon";
  import Hash from "@lucide/svelte/icons/hash";
  import RotateCcw from "@lucide/svelte/icons/rotate-ccw";
  import Edit3 from "@lucide/svelte/icons/edit-3";
  import AlignLeft from "@lucide/svelte/icons/align-left";
  import AlignCenter from "@lucide/svelte/icons/align-center";
  import AlignRight from "@lucide/svelte/icons/align-right";

  let selected = $derived(editor.index.filter((e) => editor.selectedIndexIds.has(e.id)));
  let count = $derived(selected.length);

  let mode = $derived<"global" | "single-file" | "single-cover" | "single-toc" | "multi">(
    count === 0
      ? "global"
      : count === 1
        ? selected[0].kind === "file"
          ? "single-file"
          : selected[0].kind === "cover"
            ? "single-cover"
            : "single-toc"
        : "multi",
  );

  function fileEntry(): Extract<IndexEntry, { kind: "file" }> | null {
    if (mode === "single-file" && selected[0].kind === "file") return selected[0];
    return null;
  }

  function coverEntry(): Extract<IndexEntry, { kind: "cover" }> | null {
    if (mode === "single-cover" && selected[0].kind === "cover") return selected[0];
    return null;
  }

  function tocEntry(): Extract<IndexEntry, { kind: "toc" }> | null {
    if (mode === "single-toc" && selected[0].kind === "toc") return selected[0];
    return null;
  }

  function isImage(entry: Extract<IndexEntry, { kind: "file" }>): boolean {
    return determineFileDisplayProperties(entry.source.name).fileType === "graphic";
  }

  function isRenderable(
    entry: Extract<IndexEntry, { kind: "file" }>,
  ): "md" | "html" | "xml" | "csv" | "svg" | "json" | null {
    const ext = entry.source.name.split(".").pop()?.toLowerCase();
    if (!ext) return null;
    if (ext === "md" || ext === "markdown") return "md";
    if (ext === "html" || ext === "htm") return "html";
    if (ext === "xml") return "xml";
    if (ext === "csv" || ext === "tsv") return "csv";
    if (ext === "svg") return "svg";
    if (ext === "json" || ext === "jsonc" || ext === "json5") return "json";
    return null;
  }

  function effectiveRenderMode(entry: Extract<IndexEntry, { kind: "file" }>): "raw" | "rendered" {
    if (entry.renderMode) return entry.renderMode;
    const ext = entry.source.name.split(".").pop()?.toLowerCase();
    if (ext === "md" || ext === "markdown") return editor.settings.defaultMarkdownMode;
    if (ext === "html" || ext === "htm") return editor.settings.defaultHtmlMode;
    if (ext === "xml") return editor.settings.defaultXmlMode;
    if (ext === "csv" || ext === "tsv") return editor.settings.defaultCsvMode;
    if (ext === "json" || ext === "jsonc" || ext === "json5")
      return editor.settings.defaultJsonMode;
    if (ext === "svg") return "rendered";
    return "raw";
  }

  function setRenderMode(
    entry: Extract<IndexEntry, { kind: "file" }>,
    mode: "raw" | "rendered" | null,
  ): void {
    editor.updateEntry(entry.id, { renderMode: mode });
  }

  function setLineNumbers(
    entry: Extract<IndexEntry, { kind: "file" }>,
    value: boolean | null,
  ): void {
    editor.updateEntry(entry.id, { showLineNumbers: value });
  }

  async function setCustomTitle(entry: Extract<IndexEntry, { kind: "file" }>): Promise<void> {
    const next = await promptText({
      title: "Custom title",
      description: "Override the default filename used as the section heading.",
      label: "Title",
      value: entry.customTitle ?? "",
      placeholder: entry.source.name,
    });
    if (next === null) return;
    editor.updateEntry(entry.id, { customTitle: next.trim() || null });
  }

  function setImageAlign(
    entry: Extract<IndexEntry, { kind: "file" }>,
    align: "left" | "center" | "right",
  ): void {
    editor.updateEntry(entry.id, { imageAlign: align });
  }

  function setImageWidth(entry: Extract<IndexEntry, { kind: "file" }>, width: number): void {
    editor.updateEntry(entry.id, { imageWidth: width });
  }

  function resetEntry(entry: Extract<IndexEntry, { kind: "file" }>): void {
    editor.updateEntry(entry.id, {
      renderMode: null,
      showLineNumbers: null,
      showPath: null,
      imageWidth: null,
      imageAlign: null,
      imageMaxHeight: null,
    });
  }

  async function setCoverTitle(entry: Extract<IndexEntry, { kind: "cover" }>): Promise<void> {
    const next = await promptText({
      title: "Cover title",
      label: "Title",
      value: entry.title,
      placeholder: editor.rootName ?? "PDFy Project",
    });
    if (next === null) return;
    editor.updateEntry(entry.id, { title: next.trim() || (editor.rootName ?? "PDFy Project") });
  }

  async function setCoverSubtitle(entry: Extract<IndexEntry, { kind: "cover" }>): Promise<void> {
    const next = await promptText({
      title: "Subtitle",
      description: "Optional. Leave empty to remove.",
      label: "Subtitle",
      value: entry.subtitle ?? "",
      placeholder: "e.g. Source code submission",
    });
    if (next === null) return;
    editor.updateEntry(entry.id, { subtitle: next.trim() || null });
  }
</script>

<div
  class="border-border/60 bg-muted/30 flex h-10 shrink-0 items-center gap-1 overflow-x-auto border-b px-3 py-1 text-xs"
>
  {#if mode === "global"}
    <span
      class="text-muted-foreground/70 mr-2 hidden font-mono text-[10px] tracking-wider uppercase sm:inline"
    >
      Defaults
    </span>
    <!-- Theme -->
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        {#snippet child({ props })}
          <Button {...props} variant="ghost" size="sm" class="h-7 gap-1.5 px-2">
            {#if editor.settings.codeTheme === "github-dark"}
              <Moon class="size-3.5" />
              Dark
            {:else}
              <Sun class="size-3.5" />
              Light
            {/if}
          </Button>
        {/snippet}
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item onclick={() => editor.updateSettings({ codeTheme: "github-light" })}>
          <Sun class="size-4" />
          Light
        </DropdownMenu.Item>
        <DropdownMenu.Item onclick={() => editor.updateSettings({ codeTheme: "github-dark" })}>
          <Moon class="size-4" />
          Dark
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
    <!-- Font size -->
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        {#snippet child({ props })}
          <Button {...props} variant="ghost" size="sm" class="h-7 gap-1.5 px-2 tabular-nums">
            <Hash class="size-3.5" />
            {editor.settings.codeFontSize}pt
          </Button>
        {/snippet}
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        {#each [8, 9, 10, 11, 12, 13, 14] as size (size)}
          <DropdownMenu.Item onclick={() => editor.updateSettings({ codeFontSize: size })}>
            {size}pt
          </DropdownMenu.Item>
        {/each}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
    <!-- Line numbers -->
    <Button
      variant="ghost"
      size="sm"
      class="h-7 gap-1.5 px-2"
      onclick={() => editor.updateSettings({ showLineNumbers: !editor.settings.showLineNumbers })}
    >
      <span class="font-mono text-[10px]">123</span>
      Line numbers: {editor.settings.showLineNumbers ? "on" : "off"}
    </Button>
    <!-- Page size -->
    <Button
      variant="ghost"
      size="sm"
      class="h-7 gap-1.5 px-2"
      onclick={() =>
        editor.updateSettings({
          pageSize: editor.settings.pageSize === "A4" ? "Letter" : "A4",
        })}
    >
      Page: {editor.settings.pageSize}
    </Button>
    <span class="bg-border/60 mx-1 h-4 w-px"></span>
    <span class="text-muted-foreground/70 text-[11px]">
      Pick an item in the plan to override per-file.
    </span>
  {:else if mode === "single-file"}
    {@const entry = fileEntry()}
    {#if entry}
      {@const renderable = isRenderable(entry)}
      {@const image = isImage(entry)}
      <span
        class="text-muted-foreground mr-1 truncate font-mono text-[11px]"
        title={entry.source.path}
      >
        {entry.source.name}
      </span>
      <span class="bg-border/60 mx-1 h-4 w-px"></span>
      <Button
        variant="ghost"
        size="sm"
        class="h-7 gap-1.5 px-2"
        onclick={() => setCustomTitle(entry)}
      >
        <Edit3 class="size-3.5" />
        {entry.customTitle ? "Title: " + entry.customTitle.slice(0, 14) : "Set title"}
      </Button>
      {#if renderable && renderable !== "svg"}
        {@const labelRendered =
          renderable === "csv" ? "Table" : renderable === "json" ? "Tree" : "Rendered"}
        <span class="bg-border/60 mx-1 h-4 w-px"></span>
        <ToggleGroup.Root
          type="single"
          value={effectiveRenderMode(entry)}
          onValueChange={(v) => v && setRenderMode(entry, v as "raw" | "rendered")}
          variant="outline"
          size="sm"
        >
          <ToggleGroup.Item value="raw" class="h-7 px-2">Raw</ToggleGroup.Item>
          <ToggleGroup.Item value="rendered" class="h-7 px-2">{labelRendered}</ToggleGroup.Item>
        </ToggleGroup.Root>
      {/if}
      {#if image}
        <span class="bg-border/60 mx-1 h-4 w-px"></span>
        <ToggleGroup.Root
          type="single"
          value={entry.imageAlign ?? editor.settings.defaultImageAlign}
          onValueChange={(v) => v && setImageAlign(entry, v as "left" | "center" | "right")}
          variant="outline"
          size="sm"
        >
          <ToggleGroup.Item value="left" class="size-7 p-0" aria-label="Align left">
            <AlignLeft class="size-3.5" />
          </ToggleGroup.Item>
          <ToggleGroup.Item value="center" class="size-7 p-0" aria-label="Align center">
            <AlignCenter class="size-3.5" />
          </ToggleGroup.Item>
          <ToggleGroup.Item value="right" class="size-7 p-0" aria-label="Align right">
            <AlignRight class="size-3.5" />
          </ToggleGroup.Item>
        </ToggleGroup.Root>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            {#snippet child({ props })}
              <Button {...props} variant="ghost" size="sm" class="h-7 gap-1.5 px-2 tabular-nums">
                Width: {entry.imageWidth ?? editor.settings.defaultImageWidth}%
              </Button>
            {/snippet}
          </DropdownMenu.Trigger>
          <DropdownMenu.Content>
            {#each [25, 50, 75, 100] as w (w)}
              <DropdownMenu.Item onclick={() => setImageWidth(entry, w)}>{w}%</DropdownMenu.Item>
            {/each}
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      {/if}
      {#if !image}
        <span class="bg-border/60 mx-1 h-4 w-px"></span>
        <Button
          variant="ghost"
          size="sm"
          class="h-7 gap-1.5 px-2"
          onclick={() =>
            setLineNumbers(
              entry,
              entry.showLineNumbers === null ? !editor.settings.showLineNumbers : null,
            )}
        >
          <span class="font-mono text-[10px]">123</span>
          {#if entry.showLineNumbers === null}
            Lines: default
          {:else if entry.showLineNumbers}
            Lines: on
          {:else}
            Lines: off
          {/if}
        </Button>
      {/if}
      <span class="ml-auto"></span>
      <Button
        variant="ghost"
        size="sm"
        class="text-muted-foreground hover:text-foreground h-7 gap-1.5 px-2"
        onclick={() => resetEntry(entry)}
        title="Reset overrides for this file"
      >
        <RotateCcw class="size-3.5" />
        Reset
      </Button>
    {/if}
  {:else if mode === "single-cover"}
    {@const entry = coverEntry()}
    {#if entry}
      <span class="text-muted-foreground mr-1 font-mono text-[10px] tracking-wider uppercase"
        >Cover</span
      >
      <span class="bg-border/60 mx-1 h-4 w-px"></span>
      <Button
        variant="ghost"
        size="sm"
        class="h-7 gap-1.5 px-2"
        onclick={() => setCoverTitle(entry)}
      >
        <Edit3 class="size-3.5" />
        Title: {entry.title.slice(0, 30)}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        class="h-7 gap-1.5 px-2"
        onclick={() => setCoverSubtitle(entry)}
      >
        Subtitle{entry.subtitle ? ": " + entry.subtitle.slice(0, 20) : ""}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        class="h-7 gap-1.5 px-2"
        onclick={() => editor.updateEntry(entry.id, { showDate: !entry.showDate })}
      >
        Date: {entry.showDate ? "on" : "off"}
      </Button>
    {/if}
  {:else if mode === "single-toc"}
    {@const entry = tocEntry()}
    {#if entry}
      <span class="text-muted-foreground mr-1 font-mono text-[10px] tracking-wider uppercase"
        >TOC</span
      >
      <span class="bg-border/60 mx-1 h-4 w-px"></span>
      <Button
        variant="ghost"
        size="sm"
        class="h-7 gap-1.5 px-2"
        onclick={async () => {
          const next = await promptText({
            title: "Table of contents title",
            label: "Title",
            value: entry.title,
            placeholder: "Contents",
          });
          if (next === null) return;
          editor.updateEntry(entry.id, { title: next.trim() || "Contents" });
        }}
      >
        <Edit3 class="size-3.5" />
        Title: {entry.title}
      </Button>
    {/if}
  {:else}
    <span class="text-muted-foreground mr-1 font-mono text-[10px] tracking-wider uppercase">
      {count} selected
    </span>
    <span class="bg-border/60 mx-1 h-4 w-px"></span>
    <Button
      variant="ghost"
      size="sm"
      class="h-7 gap-1.5 px-2"
      onclick={() => {
        for (const e of selected) {
          if (e.kind === "file") editor.updateEntry(e.id, { showLineNumbers: true });
        }
      }}
    >
      Lines on for all
    </Button>
    <Button
      variant="ghost"
      size="sm"
      class="h-7 gap-1.5 px-2"
      onclick={() => {
        for (const e of selected) {
          if (e.kind === "file") editor.updateEntry(e.id, { showLineNumbers: false });
        }
      }}
    >
      Lines off for all
    </Button>
    <Button
      variant="ghost"
      size="sm"
      class="text-muted-foreground hover:text-foreground h-7 gap-1.5 px-2"
      onclick={() => editor.removeEntries(selected.map((e) => e.id))}
    >
      Remove all
    </Button>
    <Button
      variant="ghost"
      size="sm"
      class="text-muted-foreground hover:text-foreground ml-auto h-7 gap-1.5 px-2"
      onclick={() => editor.clearSelection()}
    >
      Clear selection
    </Button>
  {/if}
</div>
