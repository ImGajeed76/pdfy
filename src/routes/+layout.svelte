<script lang="ts">
  import "../app.css";
  import { Toaster } from "$lib/components/ui/sonner";
  import { page } from "$app/state";
  import {
    SITE_URL,
    SITE_NAME,
    SITE_TAGLINE,
    SITE_DESCRIPTION,
    SITE_AUTHOR,
    SITE_AUTHOR_URL,
    SITE_REPO,
  } from "$lib/site";

  let { children } = $props();

  const canonical = $derived(`${SITE_URL}${page.url.pathname}`);
  const ogImage = `${SITE_URL}/og.png`;

  // WebSite + Organization schema applied site-wide so search engines have a
  // single canonical brand identity to attach to every page. Pages with their
  // own JSON-LD (SoftwareApplication on /, FAQPage on /faq) layer on top.
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    alternateName: `${SITE_NAME}, ${SITE_TAGLINE}`,
    url: `${SITE_URL}/`,
    description: SITE_DESCRIPTION,
    inLanguage: "en",
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: `${SITE_URL}/`,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/web-app-manifest-512x512.png`,
        width: 512,
        height: 512,
      },
      sameAs: [SITE_REPO, SITE_AUTHOR_URL],
      founder: { "@type": "Person", name: SITE_AUTHOR, url: SITE_AUTHOR_URL },
    },
  };

  /* eslint-disable no-useless-escape */
  const websiteJsonLdHtml = `<script type="application/ld+json">${JSON.stringify(websiteJsonLd)}<\/script>`;
  /* eslint-enable no-useless-escape */
</script>

<svelte:head>
  <link rel="canonical" href={canonical} />

  <!-- Site-wide OG scaffold. og:title / og:description / og:type are set per
       page so they stay unique; SvelteKit doesn't dedupe meta tags, so adding
       fallbacks here would produce duplicate tags that confuse OG parsers. -->
  <meta property="og:site_name" content={SITE_NAME} />
  <meta property="og:locale" content="en_US" />
  <meta property="og:url" content={canonical} />
  <meta property="og:image" content={ogImage} />
  <meta property="og:image:type" content="image/png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content={`${SITE_NAME}, ${SITE_TAGLINE}`} />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:image" content={ogImage} />

  <!-- Author for the indexed content -->
  <meta name="author" content={SITE_AUTHOR} />

  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html websiteJsonLdHtml}
</svelte:head>

<div class="print:hidden">
  <Toaster richColors />
</div>
{@render children()}
