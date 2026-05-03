<script lang="ts">
  import * as Sheet from "$lib/components/ui/sheet";
  import * as Collapsible from "$lib/components/ui/collapsible";
  import { Button } from "$lib/components/ui/button";
  import { Switch } from "$lib/components/ui/switch";
  import { Label } from "$lib/components/ui/label";
  import { editor } from "$lib/editor/state.svelte";
  import {
    DEFAULT_HEADER_FOOTER,
    DEFAULT_TOC,
    type HeaderFooterSettings,
    type TocSettings,
  } from "$lib/editor/types";
  import { VARIABLE_GROUPS } from "$lib/editor/template";
  import TemplateInput from "./TemplateInput.svelte";
  import ChevronDown from "@lucide/svelte/icons/chevron-down";
  import Sparkles from "@lucide/svelte/icons/sparkles";

  let { open = $bindable(false) }: { open: boolean } = $props();

  type SlotKey = keyof Pick<
    HeaderFooterSettings,
    "topLeft" | "topCenter" | "topRight" | "bottomLeft" | "bottomCenter" | "bottomRight"
  >;

  const TOP_SLOTS: Array<{ key: SlotKey; label: string }> = [
    { key: "topLeft", label: "Top left" },
    { key: "topCenter", label: "Top center" },
    { key: "topRight", label: "Top right" },
  ];
  const BOTTOM_SLOTS: Array<{ key: SlotKey; label: string }> = [
    { key: "bottomLeft", label: "Bottom left" },
    { key: "bottomCenter", label: "Bottom center" },
    { key: "bottomRight", label: "Bottom right" },
  ];

  let varsOpen = $state(false);

  function update<K extends keyof HeaderFooterSettings>(
    key: K,
    value: HeaderFooterSettings[K],
  ): void {
    editor.updateProjectSettings({
      headerFooter: { ...editor.projectSettings.headerFooter, [key]: value },
    });
  }

  function reset(): void {
    editor.updateProjectSettings({
      headerFooter: { ...DEFAULT_HEADER_FOOTER },
      toc: { ...DEFAULT_TOC },
    });
  }

  function clearAll(): void {
    editor.updateProjectSettings({
      headerFooter: {
        ...editor.projectSettings.headerFooter,
        topLeft: "",
        topCenter: "",
        topRight: "",
        bottomLeft: "",
        bottomCenter: "",
        bottomRight: "",
      },
      toc: { rowLeft: "", rowCenter: "", rowRight: "" },
    });
  }

  function updateToc<K extends keyof TocSettings>(key: K, value: TocSettings[K]): void {
    editor.updateProjectSettings({
      toc: { ...editor.projectSettings.toc, [key]: value },
    });
  }
</script>

<Sheet.Root bind:open>
  <Sheet.Content class="flex w-full flex-col gap-0 sm:max-w-3xl">
    <Sheet.Header class="border-foreground/15 border-b">
      <p class="text-muted-foreground/80 mb-1 font-mono text-[10px] tracking-wider uppercase">
        Project settings · saved with this folder
      </p>
      <Sheet.Title>Page layout</Sheet.Title>
      <Sheet.Description>
        Header / footer slots and table-of-contents rows. All fields are Mustache-templated — type
        <code class="font-mono text-[11px]">&#123;&#123;</code> for autocomplete.
      </Sheet.Description>
    </Sheet.Header>

    <div class="flex-1 space-y-8 overflow-y-auto p-6">
      <!-- Top of page -->
      <section class="space-y-3">
        <h3 class="text-foreground text-xs font-semibold tracking-wider uppercase">Top of page</h3>
        <div class="space-y-3">
          {#each TOP_SLOTS as slot (slot.key)}
            <div class="space-y-1.5">
              <Label class="text-muted-foreground text-[10px] tracking-wide uppercase">
                {slot.label}
              </Label>
              <TemplateInput
                value={editor.projectSettings.headerFooter[slot.key]}
                onChange={(next) => update(slot.key, next)}
                placeholder=""
              />
            </div>
          {/each}
        </div>
      </section>

      <!-- Bottom of page -->
      <section class="space-y-3">
        <h3 class="text-foreground text-xs font-semibold tracking-wider uppercase">
          Bottom of page
        </h3>
        <div class="space-y-3">
          {#each BOTTOM_SLOTS as slot (slot.key)}
            <div class="space-y-1.5">
              <Label class="text-muted-foreground text-[10px] tracking-wide uppercase">
                {slot.label}
              </Label>
              <TemplateInput
                value={editor.projectSettings.headerFooter[slot.key]}
                onChange={(next) => update(slot.key, next)}
                placeholder=""
              />
            </div>
          {/each}
        </div>
      </section>

      <!-- Table of contents -->
      <section class="space-y-3">
        <h3 class="text-foreground text-xs font-semibold tracking-wider uppercase">
          Table of contents
        </h3>
        <p class="text-muted-foreground text-xs">
          Each row's three pieces: a <em>prefix</em> + <em>title</em> on the left side, then dotted
          leaders, then a <em>page</em> on the right. Per-row variables (<code class="font-mono"
            >&#123;&#123;title&#125;&#125;</code
          >,
          <code class="font-mono">&#123;&#123;path&#125;&#125;</code>,
          <code class="font-mono">&#123;&#123;page&#125;&#125;</code>,
          <code class="font-mono">&#123;&#123;section&#125;&#125;</code>) refer to that file. The
          TOC heading itself is editable directly on the page.
        </p>
        <div class="space-y-3">
          <div class="space-y-1.5">
            <Label class="text-muted-foreground text-[10px] tracking-wide uppercase">
              Row · prefix (left, before the title)
            </Label>
            <TemplateInput
              value={editor.projectSettings.toc.rowLeft}
              onChange={(next) => updateToc("rowLeft", next)}
              placeholder=""
            />
          </div>
          <div class="space-y-1.5">
            <Label class="text-muted-foreground text-[10px] tracking-wide uppercase">
              Row · title (left side, fills available space)
            </Label>
            <TemplateInput
              value={editor.projectSettings.toc.rowCenter}
              onChange={(next) => updateToc("rowCenter", next)}
              placeholder=""
            />
          </div>
          <div class="space-y-1.5">
            <Label class="text-muted-foreground text-[10px] tracking-wide uppercase">
              Row · page (right, after the leaders)
            </Label>
            <TemplateInput
              value={editor.projectSettings.toc.rowRight}
              onChange={(next) => updateToc("rowRight", next)}
              placeholder=""
            />
          </div>
        </div>
      </section>

      <!-- Variable reference (collapsed by default) -->
      <Collapsible.Root bind:open={varsOpen}>
        <Collapsible.Trigger
          class="border-foreground/15 hover:border-primary/40 hover:bg-primary/5 group flex w-full items-center gap-2 border px-3 py-2 text-left text-sm transition-colors"
        >
          <Sparkles class="text-primary size-4" />
          <span class="flex-1">
            <span class="text-foreground font-medium">Available variables</span>
            <span class="text-muted-foreground ml-2 text-xs">
              type {`{{`} in any field for autocomplete
            </span>
          </span>
          <ChevronDown
            class="text-muted-foreground size-4 transition-transform group-data-[state=open]:rotate-180"
          />
        </Collapsible.Trigger>
        <Collapsible.Content
          class="border-foreground/15 mt-2 space-y-3 border border-t-0 px-3 py-3"
        >
          <p class="text-muted-foreground text-xs">
            Wrap any name in
            <code class="font-mono">&#123;&#123;…&#125;&#125;</code>
            to insert it. For conditionals (sections), use
            <code class="font-mono"
              >&#123;&#123;#flag&#125;&#125;…&#123;&#123;/flag&#125;&#125;</code
            >
            and
            <code class="font-mono"
              >&#123;&#123;^flag&#125;&#125;…&#123;&#123;/flag&#125;&#125;</code
            >
            for the inverted form.
          </p>
          {#each VARIABLE_GROUPS as group (group.label)}
            <div class="space-y-1.5">
              <p class="text-muted-foreground/80 text-[10px] font-semibold tracking-wide uppercase">
                {group.label}
              </p>
              <ul class="grid grid-cols-1 gap-x-4 gap-y-1 text-xs sm:grid-cols-2">
                {#each group.vars as v (v.name)}
                  <li class="flex items-baseline gap-2">
                    <code class="text-primary font-mono text-[11px]">{v.name}</code>
                    <span class="text-muted-foreground truncate text-[11px]">{v.help}</span>
                  </li>
                {/each}
              </ul>
            </div>
          {/each}
        </Collapsible.Content>
      </Collapsible.Root>

      <!-- Apply-to toggles -->
      <section class="space-y-3">
        <h3 class="text-foreground text-xs font-semibold tracking-wider uppercase">Apply to</h3>
        <div class="flex items-center justify-between gap-4">
          <Label class="text-sm">Show on cover page</Label>
          <Switch
            checked={editor.projectSettings.headerFooter.showOnCover}
            onCheckedChange={(v) => update("showOnCover", v)}
          />
        </div>
        <div class="flex items-center justify-between gap-4">
          <Label class="text-sm">Show on table of contents</Label>
          <Switch
            checked={editor.projectSettings.headerFooter.showOnToc}
            onCheckedChange={(v) => update("showOnToc", v)}
          />
        </div>
        <div class="flex items-center justify-between gap-4">
          <Label class="text-sm">Page numbering starts from</Label>
          <input
            type="number"
            min="0"
            max="9999"
            class="border-foreground/15 bg-background focus-visible:border-primary focus-visible:ring-primary/30 h-7 w-16 border px-2 text-sm tabular-nums focus-visible:ring-2 focus-visible:outline-none"
            value={editor.projectSettings.headerFooter.pageNumberStart}
            oninput={(e) => {
              const n = parseInt((e.currentTarget as HTMLInputElement).value, 10);
              if (!isNaN(n)) update("pageNumberStart", n);
            }}
          />
        </div>
      </section>
    </div>

    <Sheet.Footer class="border-foreground/15 border-t">
      <Button variant="ghost" size="sm" onclick={clearAll}>Clear all</Button>
      <Button variant="ghost" size="sm" onclick={reset}>Reset to defaults</Button>
      <Button variant="default" size="sm" onclick={() => (open = false)}>Done</Button>
    </Sheet.Footer>
  </Sheet.Content>
</Sheet.Root>
