<script lang="ts">
  import * as Sheet from "$lib/components/ui/sheet";
  import * as ToggleGroup from "$lib/components/ui/toggle-group";
  import { Button } from "$lib/components/ui/button";
  import { Label } from "$lib/components/ui/label";
  import { Switch } from "$lib/components/ui/switch";
  import { Slider } from "$lib/components/ui/slider";
  import { editor } from "$lib/editor/state.svelte";
  import { DEFAULT_SETTINGS } from "$lib/editor/types";

  let { open = $bindable(false) }: { open: boolean } = $props();

  function reset(): void {
    editor.updateSettings({ ...DEFAULT_SETTINGS });
  }

  type ToggleKey =
    | "showLineNumbers"
    | "showCover"
    | "showToc"
    | "showGroupDividers"
    | "showPath"
    | "autoSelect"
    | "autoGroup";

  function setBool(key: ToggleKey, value: boolean): void {
    editor.updateSettings({ [key]: value });
  }
</script>

<Sheet.Root bind:open>
  <Sheet.Content class="flex w-full flex-col gap-0 sm:max-w-md">
    <Sheet.Header class="border-border/60 border-b">
      <Sheet.Title>Settings</Sheet.Title>
      <Sheet.Description>
        Defaults that apply to the whole project. Per-file overrides live in the contextual bar.
      </Sheet.Description>
    </Sheet.Header>
    <div class="flex-1 space-y-8 overflow-y-auto p-6">
      <!-- Preview -->
      <section class="space-y-4">
        <h3 class="text-foreground text-sm font-semibold">Preview</h3>

        <div class="space-y-2">
          <Label class="text-xs">Code theme</Label>
          <ToggleGroup.Root
            type="single"
            value={editor.settings.codeTheme}
            onValueChange={(v) =>
              v && editor.updateSettings({ codeTheme: v as "github-light" | "github-dark" })}
            variant="outline"
            class="w-full"
          >
            <ToggleGroup.Item value="github-light" class="flex-1">Light</ToggleGroup.Item>
            <ToggleGroup.Item value="github-dark" class="flex-1">Dark</ToggleGroup.Item>
          </ToggleGroup.Root>
        </div>

        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <Label class="text-xs">Code font size</Label>
            <span class="text-muted-foreground text-xs tabular-nums">
              {editor.settings.codeFontSize}pt
            </span>
          </div>
          <Slider
            type="single"
            value={editor.settings.codeFontSize}
            onValueChange={(v) => editor.updateSettings({ codeFontSize: v })}
            min={8}
            max={14}
            step={1}
          />
        </div>

        <div class="flex items-center justify-between gap-4">
          <Label class="text-sm">Show line numbers</Label>
          <Switch
            checked={editor.settings.showLineNumbers}
            onCheckedChange={(v) => setBool("showLineNumbers", v)}
          />
        </div>

        <div class="flex items-center justify-between gap-4">
          <Label class="text-sm">Show file path under title</Label>
          <Switch
            checked={editor.settings.showPath}
            onCheckedChange={(v) => setBool("showPath", v)}
          />
        </div>
      </section>

      <!-- Print -->
      <section class="space-y-4">
        <h3 class="text-foreground text-sm font-semibold">Print</h3>

        <div class="space-y-2">
          <Label class="text-xs">Page size</Label>
          <ToggleGroup.Root
            type="single"
            value={editor.settings.pageSize}
            onValueChange={(v) => v && editor.updateSettings({ pageSize: v as "A4" | "Letter" })}
            variant="outline"
            class="w-full"
          >
            <ToggleGroup.Item value="A4" class="flex-1">A4</ToggleGroup.Item>
            <ToggleGroup.Item value="Letter" class="flex-1">US Letter</ToggleGroup.Item>
          </ToggleGroup.Root>
        </div>

        <div class="flex items-center justify-between gap-4">
          <Label class="text-sm">Cover page</Label>
          <Switch
            checked={editor.settings.showCover}
            onCheckedChange={(v) => setBool("showCover", v)}
          />
        </div>
        <div class="flex items-center justify-between gap-4">
          <Label class="text-sm">Table of contents</Label>
          <Switch
            checked={editor.settings.showToc}
            onCheckedChange={(v) => setBool("showToc", v)}
          />
        </div>
        <div class="flex items-center justify-between gap-4">
          <Label class="text-sm">Group dividers</Label>
          <Switch
            checked={editor.settings.showGroupDividers}
            onCheckedChange={(v) => setBool("showGroupDividers", v)}
          />
        </div>
      </section>

      <!-- Behavior -->
      <section class="space-y-4">
        <h3 class="text-foreground text-sm font-semibold">Behavior</h3>

        <div class="flex items-start justify-between gap-4">
          <div class="flex flex-col">
            <Label class="text-sm">Smart-add files on folder open</Label>
            <span class="text-muted-foreground mt-0.5 text-xs">
              Auto-adds code, text, and markdown.
            </span>
          </div>
          <Switch
            checked={editor.settings.autoSelect}
            onCheckedChange={(v) => setBool("autoSelect", v)}
            class="mt-0.5"
          />
        </div>

        <div class="flex items-start justify-between gap-4">
          <div class="flex flex-col">
            <Label class="text-sm">Auto-group tests &amp; config</Label>
            <span class="text-muted-foreground mt-0.5 text-xs">
              Group test files and root configs separately.
            </span>
          </div>
          <Switch
            checked={editor.settings.autoGroup}
            onCheckedChange={(v) => setBool("autoGroup", v)}
            class="mt-0.5"
          />
        </div>
      </section>

      <!-- Per-type defaults -->
      <section class="space-y-3">
        <h3 class="text-foreground text-sm font-semibold">Default render modes</h3>
        <p class="text-muted-foreground text-xs">
          Per-file overrides win. Each row is the default for new files of that type.
        </p>
        <div class="space-y-2">
          {#each [{ key: "defaultMarkdownMode", label: "Markdown" }, { key: "defaultHtmlMode", label: "HTML" }, { key: "defaultXmlMode", label: "XML" }, { key: "defaultJsonMode", label: "JSON" }, { key: "defaultCsvMode", label: "CSV / TSV" }] as row (row.key)}
            <div class="flex items-center justify-between gap-3">
              <Label class="text-sm">{row.label}</Label>
              <ToggleGroup.Root
                type="single"
                value={editor.settings[row.key as keyof typeof editor.settings] as string}
                onValueChange={(v) => v && editor.updateSettings({ [row.key]: v })}
                variant="outline"
                size="sm"
              >
                <ToggleGroup.Item value="raw" class="px-3">Raw</ToggleGroup.Item>
                <ToggleGroup.Item value="rendered" class="px-3">
                  {row.key === "defaultJsonMode"
                    ? "Tree"
                    : row.key === "defaultCsvMode"
                      ? "Table"
                      : "Rendered"}
                </ToggleGroup.Item>
              </ToggleGroup.Root>
            </div>
          {/each}
        </div>
      </section>
    </div>
    <Sheet.Footer class="border-border/60 border-t">
      <Button variant="ghost" size="sm" onclick={reset}>Reset to defaults</Button>
      <Button variant="default" size="sm" onclick={() => (open = false)}>Done</Button>
    </Sheet.Footer>
  </Sheet.Content>
</Sheet.Root>
