<script lang="ts">
  import type { HTMLImgAttributes } from "svelte/elements";
  import { cn } from "$lib/utils.js";

  let { class: className, ...rest }: HTMLImgAttributes = $props();
</script>

<img
  src="/favicon-96x96.png"
  alt=""
  aria-hidden="true"
  class={cn("size-6 select-none", className)}
  {...rest}
/>
