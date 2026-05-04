/**
 * Single source of truth for the tutorial's table of contents.
 * Sidebar nav and per-page Prev/Next links both derive from this list,
 * so adding a tutorial page is a one-line change here plus the route file.
 *
 * Order in the array IS the reading order.
 */

export interface TutorialPage {
  /** URL slug under /tutorial. Empty string = the overview at /tutorial. */
  slug: string;
  /** Visible title. Used in the sidebar, in <title>, and in prev/next. */
  title: string;
  /** One-line summary, shown on the overview page and in <meta description>. */
  summary: string;
  /** Sidebar grouping. The overview page belongs to no group. */
  group: TutorialGroup | null;
}

export type TutorialGroup = "Get started" | "Customise" | "Reference" | "Help";

export const TUTORIAL_GROUPS: TutorialGroup[] = ["Get started", "Customise", "Reference", "Help"];

export const TUTORIAL_PAGES: TutorialPage[] = [
  {
    slug: "",
    title: "Overview",
    summary: "What this tutorial covers and where to find each piece.",
    group: null,
  },

  // Get started
  {
    slug: "open-a-folder",
    title: "Open a folder",
    summary: "Pick a project, what the browser asks, and what gitignore does.",
    group: "Get started",
  },
  {
    slug: "pick-what-to-print",
    title: "Pick what to print",
    summary: "The tree, the print plan, and how files move from one to the other.",
    group: "Get started",
  },
  {
    slug: "save-the-pdf",
    title: "Save the PDF",
    summary: "Click Print, then Save as PDF in your browser's dialog. That's it.",
    group: "Get started",
  },

  // Customise
  {
    slug: "cover-page",
    title: "Cover page",
    summary: "Add one, edit the title and subtitle, optional date.",
    group: "Customise",
  },
  {
    slug: "table-of-contents",
    title: "Table of contents",
    summary: "Add one, edit the heading, paginates automatically.",
    group: "Customise",
  },
  {
    slug: "headers-and-footers",
    title: "Headers and footers",
    summary: "Six slots per page, Mustache-templated, page-aware variables.",
    group: "Customise",
  },
  {
    slug: "per-file-overrides",
    title: "Per-file overrides",
    summary: "Custom titles, line numbers, image scale, alignment.",
    group: "Customise",
  },

  // Reference
  {
    slug: "templating",
    title: "Templating variables",
    summary: "All the variables you can use in headers, footers, and TOC rows.",
    group: "Reference",
  },
  {
    slug: "settings",
    title: "Settings",
    summary: "What lives in app preferences vs project settings vs per-file.",
    group: "Reference",
  },
  {
    slug: "keyboard-shortcuts",
    title: "Keyboard shortcuts",
    summary: "Every shortcut the editor recognises.",
    group: "Reference",
  },

  // Help
  {
    slug: "things-people-get-wrong",
    title: "Things people get wrong",
    summary: "Common stumbling blocks and how to fix them quickly.",
    group: "Help",
  },
  {
    slug: "browser-support",
    title: "Browser support",
    summary: "Which browsers work and why Firefox / Safari don't.",
    group: "Help",
  },
];

/** Returns prev/next pages for the given slug, in reading order. */
export function neighborsOf(slug: string): {
  prev: TutorialPage | null;
  next: TutorialPage | null;
} {
  const i = TUTORIAL_PAGES.findIndex((p) => p.slug === slug);
  if (i === -1) return { prev: null, next: null };
  return {
    prev: i > 0 ? TUTORIAL_PAGES[i - 1] : null,
    next: i < TUTORIAL_PAGES.length - 1 ? TUTORIAL_PAGES[i + 1] : null,
  };
}

/** URL helper. The overview page lives at /tutorial (empty slug). */
export function tutorialHref(slug: string): string {
  return slug ? `/tutorial/${slug}` : "/tutorial";
}
