<script lang="ts">
  import * as Sheet from "$lib/components/ui/sheet";
  import * as ToggleGroup from "$lib/components/ui/toggle-group";
  import { Button } from "$lib/components/ui/button";
  import { Label } from "$lib/components/ui/label";
  import { Switch } from "$lib/components/ui/switch";
  import { editor } from "$lib/editor/state.svelte";
  import { DEFAULT_SETTINGS } from "$lib/editor/types";
  import { promptText } from "$lib/editor/prompt.svelte";

  let { open = $bindable(false) }: { open: boolean } = $props();

  function reset(): void {
    editor.updateSettings({ ...DEFAULT_SETTINGS });
  }

  type ToggleKey = "showLineNumbers" | "autoSelect" | "respectGitignore";

  function setBool(key: ToggleKey, value: boolean): void {
    editor.updateSettings({ [key]: value });
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
</script>

<Sheet.Root bind:open>
  <Sheet.Content class="flex w-full flex-col gap-0 sm:max-w-md">
    <Sheet.Header class="border-foreground/15 border-b">
      <p class="text-muted-foreground/80 mb-1 font-mono text-[10px] tracking-wider uppercase">
        App preferences · saved per browser
      </p>
      <Sheet.Title>Settings</Sheet.Title>
      <Sheet.Description>
        Defaults that follow you across every project you open in this browser. Per-file overrides
        live in the contextual bar; per-project bits like headers &amp; footers live in their own
        panel.
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

        <div class="flex items-center justify-between gap-4">
          <Label class="text-sm">Code font size</Label>
          <Button
            variant="outline"
            size="sm"
            class="h-7 px-2 tabular-nums"
            onclick={handleEditFontSize}
          >
            {editor.settings.codeFontSize}pt
          </Button>
        </div>

        <div class="flex items-center justify-between gap-4">
          <Label class="text-sm">Show line numbers</Label>
          <Switch
            checked={editor.settings.showLineNumbers}
            onCheckedChange={(v) => setBool("showLineNumbers", v)}
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
      </section>
    </div>
    <Sheet.Footer class="border-foreground/15 border-t">
      <Button variant="ghost" size="sm" onclick={reset}>Reset to defaults</Button>
      <Button variant="default" size="sm" onclick={() => (open = false)}>Done</Button>
    </Sheet.Footer>
  </Sheet.Content>
</Sheet.Root>
