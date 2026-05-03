<script lang="ts">
  /**
   * Renders the header and footer rows of one paper sheet, evaluating
   * each of the six template slots against a per-sheet context. Designed
   * to live inside .preview-section as flex-shrink:0 rows above/below the
   * .preview-body so capacity calculations can subtract their height.
   */
  import { editor } from "$lib/editor/state.svelte";
  import {
    buildTemplateContext,
    renderTemplate,
    type BuildContextInput,
  } from "$lib/editor/template";

  let {
    placement,
    contextInput,
  }: {
    placement: "header" | "footer";
    contextInput: BuildContextInput;
  } = $props();

  let hf = $derived(editor.projectSettings.headerFooter);

  let suppressed = $derived(
    (contextInput.entry.kind === "cover" && !hf.showOnCover) ||
      (contextInput.entry.kind === "toc" && !hf.showOnToc),
  );

  let context = $derived(buildTemplateContext(contextInput));

  let leftSlot = $derived(placement === "header" ? hf.topLeft : hf.bottomLeft);
  let centerSlot = $derived(placement === "header" ? hf.topCenter : hf.bottomCenter);
  let rightSlot = $derived(placement === "header" ? hf.topRight : hf.bottomRight);

  let leftText = $derived(suppressed ? "" : renderTemplate(leftSlot, context));
  let centerText = $derived(suppressed ? "" : renderTemplate(centerSlot, context));
  let rightText = $derived(suppressed ? "" : renderTemplate(rightSlot, context));

  let isEmpty = $derived(!leftText && !centerText && !rightText);
</script>

{#if !isEmpty}
  <div class="sheet-chrome sheet-chrome--{placement}" role="presentation" aria-hidden="true">
    <span class="sheet-chrome__cell sheet-chrome__cell--left">{leftText}</span>
    <span class="sheet-chrome__cell sheet-chrome__cell--center">{centerText}</span>
    <span class="sheet-chrome__cell sheet-chrome__cell--right">{rightText}</span>
  </div>
{/if}

<style>
  .sheet-chrome {
    flex: 0 0 auto;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    align-items: center;
    gap: 1cm;
    font-size: 9pt;
    color: var(--color-muted-foreground, #888);
  }
  /* Asymmetric padding: the OUTER side (toward the sheet edge) gets the
     standard print-margin distance (~0.7cm, similar to Word/Pages
     headers); the INNER side (toward the body) is essentially zero so
     chrome text sits right against the body content. The body's
     padding-top/bottom on the chrome side is also collapsed via :has()
     in Preview.svelte so the gap doesn't compound. */
  .sheet-chrome--header {
    padding: 0.7cm 1.5cm 0.1cm;
  }
  .sheet-chrome--footer {
    padding: 0.1cm 1.5cm 0.7cm;
  }
  /* No divider line — just the content sits in the margin band. */
  .sheet-chrome__cell {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
  }
  .sheet-chrome__cell--left {
    text-align: left;
  }
  .sheet-chrome__cell--center {
    text-align: center;
  }
  .sheet-chrome__cell--right {
    text-align: right;
  }
</style>
