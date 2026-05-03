<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";

  // /tool is the legacy route. Redirect to /editor.
  onMount(() => {
    goto("/editor", { replaceState: true });
  });
</script>

<svelte:head>
  <title>Redirecting…</title>
  <meta name="robots" content="noindex,nofollow" />
  <meta http-equiv="refresh" content="0; url=/editor" />
</svelte:head>

<p class="p-4 text-sm">Redirecting to the editor…</p>
