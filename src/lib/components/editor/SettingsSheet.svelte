<script lang="ts">
  import * as Sheet from "$lib/components/ui/sheet";
  import { Button } from "$lib/components/ui/button";
  import { Label } from "$lib/components/ui/label";
  import { editor } from "$lib/editor/state.svelte";
  import { DEFAULT_SETTINGS } from "$lib/editor/types";

  let { open = $bindable(false) }: { open: boolean } = $props();

  function reset(): void {
    editor.updateSettings({ ...DEFAULT_SETTINGS });
  }

  type Toggle =
    | "showLineNumbers"
    | "showCover"
    | "showToc"
    | "showGroupDividers"
    | "showPath"
    | "autoSelect"
    | "autoGroup";

  function toggle(key: Toggle): void {
    editor.updateSettings({ [key]: !editor.settings[key] });
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
    <div class="flex-1 space-y-6 overflow-y-auto p-6">
      <!-- Preview -->
      <section class="space-y-3">
        <h3 class="text-foreground text-sm font-semibold">Preview</h3>
        <div class="grid grid-cols-2 gap-2">
          <Button
            variant={editor.settings.codeTheme === "github-light" ? "default" : "outline"}
            size="sm"
            onclick={() => editor.updateSettings({ codeTheme: "github-light" })}
          >
            Light theme
          </Button>
          <Button
            variant={editor.settings.codeTheme === "github-dark" ? "default" : "outline"}
            size="sm"
            onclick={() => editor.updateSettings({ codeTheme: "github-dark" })}
          >
            Dark theme
          </Button>
        </div>
        <div class="space-y-1.5">
          <Label class="text-xs">Code font size ({editor.settings.codeFontSize}pt)</Label>
          <input
            type="range"
            min="8"
            max="14"
            step="1"
            value={editor.settings.codeFontSize}
            class="w-full accent-[var(--primary)]"
            oninput={(e) =>
              editor.updateSettings({ codeFontSize: Number((e.target as HTMLInputElement).value) })}
          />
        </div>
        <label class="flex items-center justify-between text-sm">
          <span>Show line numbers</span>
          <input
            type="checkbox"
            checked={editor.settings.showLineNumbers}
            onchange={() => toggle("showLineNumbers")}
            class="size-4 accent-[var(--primary)]"
          />
        </label>
        <label class="flex items-center justify-between text-sm">
          <span>Show file path under title</span>
          <input
            type="checkbox"
            checked={editor.settings.showPath}
            onchange={() => toggle("showPath")}
            class="size-4 accent-[var(--primary)]"
          />
        </label>
      </section>

      <!-- Print -->
      <section class="space-y-3">
        <h3 class="text-foreground text-sm font-semibold">Print</h3>
        <div class="grid grid-cols-2 gap-2">
          <Button
            variant={editor.settings.pageSize === "A4" ? "default" : "outline"}
            size="sm"
            onclick={() => editor.updateSettings({ pageSize: "A4" })}
          >
            A4
          </Button>
          <Button
            variant={editor.settings.pageSize === "Letter" ? "default" : "outline"}
            size="sm"
            onclick={() => editor.updateSettings({ pageSize: "Letter" })}
          >
            US Letter
          </Button>
        </div>
        <label class="flex items-center justify-between text-sm">
          <span>Cover page</span>
          <input
            type="checkbox"
            checked={editor.settings.showCover}
            onchange={() => toggle("showCover")}
            class="size-4 accent-[var(--primary)]"
          />
        </label>
        <label class="flex items-center justify-between text-sm">
          <span>Table of contents</span>
          <input
            type="checkbox"
            checked={editor.settings.showToc}
            onchange={() => toggle("showToc")}
            class="size-4 accent-[var(--primary)]"
          />
        </label>
        <label class="flex items-center justify-between text-sm">
          <span>Group dividers</span>
          <input
            type="checkbox"
            checked={editor.settings.showGroupDividers}
            onchange={() => toggle("showGroupDividers")}
            class="size-4 accent-[var(--primary)]"
          />
        </label>
      </section>

      <!-- Behavior -->
      <section class="space-y-3">
        <h3 class="text-foreground text-sm font-semibold">Behavior</h3>
        <label class="flex items-center justify-between text-sm">
          <span>
            Smart-add files on folder open
            <span class="text-muted-foreground ml-1 block text-xs">
              Auto-adds code, text, and markdown.
            </span>
          </span>
          <input
            type="checkbox"
            checked={editor.settings.autoSelect}
            onchange={() => toggle("autoSelect")}
            class="size-4 shrink-0 accent-[var(--primary)]"
          />
        </label>
        <label class="flex items-center justify-between text-sm">
          <span>
            Auto-group tests &amp; config
            <span class="text-muted-foreground ml-1 block text-xs">
              Group test files and root configs separately.
            </span>
          </span>
          <input
            type="checkbox"
            checked={editor.settings.autoGroup}
            onchange={() => toggle("autoGroup")}
            class="size-4 shrink-0 accent-[var(--primary)]"
          />
        </label>
      </section>

      <!-- Per-type defaults -->
      <section class="space-y-3">
        <h3 class="text-foreground text-sm font-semibold">Default render modes</h3>
        <p class="text-muted-foreground text-xs">
          Per-file overrides win. Each row is the default for new files of that type.
        </p>
        <div class="space-y-2">
          {#each [{ key: "defaultMarkdownMode", label: "Markdown" }, { key: "defaultHtmlMode", label: "HTML" }, { key: "defaultXmlMode", label: "XML" }] as row (row.key)}
            <div class="flex items-center justify-between">
              <span class="text-sm">{row.label}</span>
              <div class="flex items-center gap-1">
                <Button
                  variant={editor.settings[row.key as keyof typeof editor.settings] === "raw"
                    ? "default"
                    : "outline"}
                  size="sm"
                  class="h-7 px-2 text-xs"
                  onclick={() => editor.updateSettings({ [row.key]: "raw" })}
                >
                  Raw
                </Button>
                <Button
                  variant={editor.settings[row.key as keyof typeof editor.settings] === "rendered"
                    ? "default"
                    : "outline"}
                  size="sm"
                  class="h-7 px-2 text-xs"
                  onclick={() => editor.updateSettings({ [row.key]: "rendered" })}
                >
                  Rendered
                </Button>
              </div>
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
