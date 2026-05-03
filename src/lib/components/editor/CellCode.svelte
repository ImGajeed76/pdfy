<script lang="ts">
  import { editor } from "$lib/editor/state.svelte";
  import { highlightWithShiki, type ShikiLine } from "$lib/editor/shiki";

  let { code, lang }: { code: string; lang: string } = $props();

  let lines = $state<ShikiLine[]>([]);

  $effect(() => {
    let cancelled = false;
    highlightWithShiki(code, lang, editor.settings.codeTheme).then((result) => {
      if (!cancelled) lines = result;
    });
    return () => {
      cancelled = true;
    };
  });
</script>

<!-- eslint-disable svelte/no-at-html-tags -- shiki output, escaped + inline-styled -->
<pre
  class="code-pre shiki-pre overflow-x-auto font-mono text-[12px] leading-snug whitespace-pre"><code
    class="language-{lang}"
    >{#each lines as line (line.number)}<span class="code-line"
        ><span class="code-num">{line.number}</span><span class="code-text">{@html line.html}</span
        ></span
      >{/each}</code
  ></pre>
<!-- eslint-enable svelte/no-at-html-tags -->
