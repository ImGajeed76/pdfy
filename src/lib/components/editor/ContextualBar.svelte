<script lang="ts">
  import { editor } from "$lib/editor/state.svelte";
  import { Button } from "$lib/components/ui/button";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import * as ToggleGroup from "$lib/components/ui/toggle-group";
  import DatePicker from "./DatePicker.svelte";
  import { Switch } from "$lib/components/ui/switch";
  import type { IndexEntry } from "$lib/editor/types";
  import { determineFileDisplayProperties } from "$lib/fileSystem";
  import { promptText } from "$lib/editor/prompt.svelte";
  import Sun from "@lucide/svelte/icons/sun";
  import Moon from "@lucide/svelte/icons/moon";
  import Hash from "@lucide/svelte/icons/hash";
  import RotateCcw from "@lucide/svelte/icons/rotate-ccw";
  import AlignLeft from "@lucide/svelte/icons/align-left";
  import AlignCenter from "@lucide/svelte/icons/align-center";
  import AlignRight from "@lucide/svelte/icons/align-right";
  import AlignTop from "@lucide/svelte/icons/align-vertical-justify-start";
  import AlignMiddle from "@lucide/svelte/icons/align-vertical-justify-center";
  import AlignBottom from "@lucide/svelte/icons/align-vertical-justify-end";

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

  function setImageVerticalAlign(
    entry: Extract<IndexEntry, { kind: "file" }>,
    align: "top" | "center" | "bottom",
  ): void {
    editor.updateEntry(entry.id, { imageVerticalAlign: align });
  }

  function setImageWidth(entry: Extract<IndexEntry, { kind: "file" }>, width: number): void {
    editor.updateEntry(entry.id, { imageWidth: width });
  }

  async function handleEditFontSize(): Promise<void> {
    const next = await promptText({
      title: "Code font size",
      description: "Size in points.",
      label: "Size (pt)",
      value: String(editor.settings.codeFontSize),
      placeholder: "9",
    });
    if (next === null) return;
    const n = parseInt(next.trim(), 10);
    if (!isNaN(n) && n > 0) editor.updateSettings({ codeFontSize: n });
  }

  async function handleEditImageWidth(entry: Extract<IndexEntry, { kind: "file" }>): Promise<void> {
    const current = entry.imageWidth ?? editor.settings.defaultImageWidth;
    const next = await promptText({
      title: "Image width",
      description: "Width as a percentage of the page.",
      label: "Width (%)",
      value: String(current),
      placeholder: "100",
    });
    if (next === null) return;
    const n = parseInt(next.trim(), 10);
    if (!isNaN(n) && n > 0) setImageWidth(entry, n);
  }

  function resetEntry(entry: Extract<IndexEntry, { kind: "file" }>): void {
    editor.updateEntry(entry.id, {
      showLineNumbers: null,
      imageWidth: null,
      imageAlign: null,
      imageVerticalAlign: null,
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
  class="border-foreground/15 bg-muted/30 flex h-10 shrink-0 items-center gap-1 overflow-x-auto border-b px-3 py-1 text-xs"
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
    <Button
      variant="ghost"
      size="sm"
      class="h-7 gap-1.5 px-2 tabular-nums"
      onclick={handleEditFontSize}
      title="Click to set font size"
    >
      <Hash class="size-3.5" />
      {editor.settings.codeFontSize}pt
    </Button>
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
      {@const image = isImage(entry)}
      <span
        class="text-muted-foreground mr-1 truncate font-mono text-[11px]"
        title={entry.source.path}
      >
        {entry.source.name}
      </span>
      <span class="bg-border/60 mx-1 h-4 w-px"></span>
      <Button variant="ghost" size="sm" class="h-7 px-2" onclick={() => setCustomTitle(entry)}>
        {entry.customTitle ? "Title: " + entry.customTitle.slice(0, 14) : "Set title"}
      </Button>
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
        <ToggleGroup.Root
          type="single"
          value={entry.imageVerticalAlign ?? editor.settings.defaultImageVerticalAlign}
          onValueChange={(v) => v && setImageVerticalAlign(entry, v as "top" | "center" | "bottom")}
          variant="outline"
          size="sm"
        >
          <ToggleGroup.Item value="top" class="size-7 p-0" aria-label="Align top">
            <AlignTop class="size-3.5" />
          </ToggleGroup.Item>
          <ToggleGroup.Item value="center" class="size-7 p-0" aria-label="Align middle">
            <AlignMiddle class="size-3.5" />
          </ToggleGroup.Item>
          <ToggleGroup.Item value="bottom" class="size-7 p-0" aria-label="Align bottom">
            <AlignBottom class="size-3.5" />
          </ToggleGroup.Item>
        </ToggleGroup.Root>
        <Button
          variant="ghost"
          size="sm"
          class="h-7 gap-1.5 px-2 tabular-nums"
          onclick={() => handleEditImageWidth(entry)}
          title="Click to set width"
        >
          Width: {entry.imageWidth ?? editor.settings.defaultImageWidth}%
        </Button>
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
      <Button variant="ghost" size="sm" class="h-7 px-2" onclick={() => setCoverTitle(entry)}>
        Title: {entry.title.slice(0, 30)}
      </Button>
      <Button variant="ghost" size="sm" class="h-7 px-2" onclick={() => setCoverSubtitle(entry)}>
        Subtitle{entry.subtitle ? ": " + entry.subtitle.slice(0, 20) : ""}
      </Button>
      {#if entry.showDate}
        <DatePicker
          value={entry.date}
          onChange={(next) => editor.updateEntry(entry.id, { date: next })}
        />
      {/if}
      <span class="text-muted-foreground/80 ml-1 inline-flex items-center gap-1.5 text-[11px]">
        Show date
        <Switch
          checked={entry.showDate}
          onCheckedChange={(v) => editor.updateEntry(entry.id, { showDate: v })}
          class="scale-75"
        />
      </span>
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
        class="h-7 px-2"
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
