<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { EditorState, Compartment } from "@codemirror/state";
  import {
    EditorView,
    keymap,
    placeholder as placeholderExt,
    Decoration,
    MatchDecorator,
    ViewPlugin,
    type DecorationSet,
    type ViewUpdate,
  } from "@codemirror/view";
  import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
  import {
    autocompletion,
    completionKeymap,
    type CompletionContext,
    type CompletionResult,
  } from "@codemirror/autocomplete";
  import { FLAT_VARIABLES } from "$lib/editor/template";

  let {
    value = "",
    placeholder = "",
    onFocus,
    onChange,
    debounceMs = 250,
  }: {
    value: string;
    placeholder?: string;
    onFocus?: (view: EditorView) => void;
    onChange?: (next: string) => void;
    /** Delay before calling onChange after the user stops typing.
        Keystrokes feel instant in the editor; downstream re-render only
        fires after the pause. */
    debounceMs?: number;
  } = $props();

  // Track the last value we sent to onChange so external prop updates
  // (e.g. Reset to defaults) sync into the editor but our own debounced
  // dispatches don't bounce back to themselves. Initial capture of
  // `value` is intentional — the $effect below updates this on real
  // external changes.
  // svelte-ignore state_referenced_locally
  let lastDispatched = $state(value);
  let pendingTimer: ReturnType<typeof setTimeout> | null = null;
  let pendingValue: string | null = null;

  function flushPending(): void {
    if (pendingTimer !== null) {
      clearTimeout(pendingTimer);
      pendingTimer = null;
    }
    if (pendingValue !== null) {
      const v = pendingValue;
      pendingValue = null;
      lastDispatched = v;
      onChange?.(v);
    }
  }

  function scheduleChange(next: string): void {
    if (next === lastDispatched) return;
    pendingValue = next;
    if (pendingTimer !== null) clearTimeout(pendingTimer);
    if (debounceMs <= 0) {
      flushPending();
      return;
    }
    pendingTimer = setTimeout(flushPending, debounceMs);
  }

  let host = $state<HTMLDivElement | null>(null);
  let view: EditorView | null = null;
  let placeholderCompartment = new Compartment();

  // Highlight {{...}}, {{#...}}, {{/...}}, {{^...}} regions so users can
  // see where their template variables live at a glance.
  const varDeco = Decoration.mark({ class: "tmpl-var" });
  const sectionDeco = Decoration.mark({ class: "tmpl-section" });
  const matcher = new MatchDecorator({
    regexp: /\{\{[#^/!&]?\s*[\w.]+\s*\}\}/g,
    decoration: (m) =>
      m[0].includes("#") || m[0].includes("/") || m[0].includes("^") ? sectionDeco : varDeco,
  });
  const highlightPlugin = ViewPlugin.fromClass(
    class {
      decorations: DecorationSet;
      constructor(v: EditorView) {
        this.decorations = matcher.createDeco(v);
      }
      update(u: ViewUpdate) {
        this.decorations = matcher.updateDeco(u, this.decorations);
      }
    },
    { decorations: (v) => v.decorations },
  );

  // Autocomplete: triggered after `{{` (with optional #/^//), shows the
  // available variables from template.ts.
  function variableCompletions(ctx: CompletionContext): CompletionResult | null {
    const before = ctx.matchBefore(/\{\{[#^/]?\s*[\w.]*$/);
    if (!before) return null;
    const after = ctx.matchBefore(/\{\{[#^/]?\s*[\w.]*\}\}?/);
    return {
      from: before.from + before.text.search(/[\w#^/.]*$/),
      options: FLAT_VARIABLES.map((v) => ({
        label: v.name,
        info: v.help,
        type: v.name.startsWith("#") || v.name.startsWith("^") ? "keyword" : "variable",
        apply: (view, completion, from, to) => {
          const insertion = completion.label;
          const restAfter = after?.text.endsWith("}}") ? "" : "}}";
          view.dispatch({
            changes: { from, to, insert: insertion + restAfter },
            selection: { anchor: from + insertion.length + restAfter.length },
          });
        },
      })),
    };
  }

  // Single-line: trap Enter to do nothing (avoid newlines in template).
  const singleLineKeymap = keymap.of([
    {
      key: "Enter",
      run: () => true,
    },
  ]);

  onMount(() => {
    if (!host) return;
    const state = EditorState.create({
      doc: value,
      extensions: [
        history(),
        keymap.of([...defaultKeymap, ...historyKeymap, ...completionKeymap]),
        singleLineKeymap,
        EditorView.lineWrapping,
        autocompletion({ override: [variableCompletions], activateOnTyping: true }),
        highlightPlugin,
        placeholderCompartment.of(placeholder ? placeholderExt(placeholder) : []),
        EditorView.updateListener.of((u) => {
          if (u.docChanged) scheduleChange(u.state.doc.toString());
          if (u.focusChanged) {
            if (u.view.hasFocus && onFocus) onFocus(u.view);
            else flushPending(); // commit immediately on blur
          }
        }),
        EditorView.theme({
          "&": {
            border: "1px solid var(--color-border)",
            borderRadius: "0",
            background: "var(--color-background)",
            fontSize: "12px",
          },
          "&.cm-focused": {
            outline: "none",
            borderColor: "var(--color-primary)",
          },
          ".cm-content": {
            padding: "6px 8px",
            fontFamily:
              "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
            caretColor: "var(--color-foreground)",
            color: "var(--color-foreground)",
            minHeight: "24px",
          },
          ".cm-scroller": { overflow: "auto" },
          ".cm-line": { padding: "0" },
          ".cm-placeholder": {
            color: "var(--color-muted-foreground)",
            opacity: "0.7",
          },
          ".tmpl-var": {
            background: "color-mix(in srgb, var(--color-primary) 18%, transparent)",
            color: "var(--color-primary)",
            borderRadius: "2px",
            padding: "0 1px",
          },
          ".tmpl-section": {
            background: "color-mix(in srgb, var(--color-primary) 28%, transparent)",
            color: "var(--color-primary)",
            fontWeight: "600",
            borderRadius: "2px",
            padding: "0 1px",
          },
          ".cm-tooltip-autocomplete": {
            background: "var(--color-popover)",
            border: "1px solid var(--color-border)",
            borderRadius: "0",
            fontSize: "12px",
          },
          ".cm-tooltip-autocomplete > ul > li[aria-selected]": {
            background: "var(--color-primary)",
            color: "var(--color-primary-foreground)",
          },
        }),
      ],
    });
    view = new EditorView({ state, parent: host });
    return () => view?.destroy();
  });

  // Sync external value changes (e.g. Reset to defaults) back into the
  // editor. Skip when the incoming value matches what we last dispatched
  // — avoids round-tripping our own debounced output and stomping on the
  // user's in-flight edits.
  $effect(() => {
    if (!view) return;
    if (value === lastDispatched) return;
    const current = view.state.doc.toString();
    if (current === value) return;
    lastDispatched = value;
    pendingValue = null;
    if (pendingTimer !== null) {
      clearTimeout(pendingTimer);
      pendingTimer = null;
    }
    view.dispatch({
      changes: { from: 0, to: current.length, insert: value },
    });
  });

  onDestroy(() => {
    flushPending();
    view?.destroy();
  });

  export function focus(): void {
    view?.focus();
  }
  export function insertAtCursor(text: string): void {
    if (!view) return;
    const { from, to } = view.state.selection.main;
    view.dispatch({
      changes: { from, to, insert: text },
      selection: { anchor: from + text.length },
    });
    view.focus();
  }
</script>

<div bind:this={host} class="template-input"></div>

<style>
  .template-input {
    width: 100%;
  }
  :global(.template-input .cm-editor) {
    min-height: 32px;
  }
</style>
