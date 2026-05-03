<script lang="ts">
  import type { HTMLImgAttributes } from "svelte/elements";
  import { cn } from "$lib/utils.js";

  let { class: className, ...rest }: HTMLImgAttributes = $props();
</script>

<img src="/favicon.svg" alt="PDFy" class={cn("size-6 select-none", className)} {...rest} />
