<script lang="ts">
  import "../app.css";
  import { Toaster } from "$lib/components/ui/sonner";

  let { children } = $props();
</script>

<div class="print:hidden">
  <Toaster richColors />
</div>
{@render children()}
