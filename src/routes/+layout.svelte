<script lang="ts">
  import "../app.css";
  import { Toaster } from "$lib/components/ui/sonner";
  import { page } from "$app/state";
  import { SITE_URL, SITE_NAME, SITE_TAGLINE } from "$lib/site";

  let { children } = $props();

  const canonical = $derived(`${SITE_URL}${page.url.pathname}`);
  const ogImage = `${SITE_URL}/og.png`;
</script>

<svelte:head>
  <link rel="canonical" href={canonical} />

  <meta property="og:site_name" content={SITE_NAME} />
  <meta property="og:locale" content="en_US" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content={canonical} />
  <meta property="og:image" content={ogImage} />
  <meta property="og:image:type" content="image/png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content={`${SITE_NAME}, ${SITE_TAGLINE}`} />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:image" content={ogImage} />
</svelte:head>

<div class="print:hidden">
  <Toaster richColors />
</div>
{@render children()}
