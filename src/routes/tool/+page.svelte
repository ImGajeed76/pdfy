<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";

  // /tool is the legacy route — redirect to /editor.
  onMount(() => {
    goto("/editor", { replaceState: true });
  });
</script>

<svelte:head>
  <meta http-equiv="refresh" content="0; url=/editor" />
  <title>Redirecting…</title>
</svelte:head>

<p class="p-4 text-sm">Redirecting to the editor…</p>
