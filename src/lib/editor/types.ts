import type { PDFYFileSystemEntry } from "$lib/types";

/**
 * An entry in the print index. References a source file but is *independent*
 * of it — the same source file can appear in the index multiple times, each
 * with its own settings, custom title, and ID.
 *
 * Special entries (cover, toc) reference no source file.
 */
export type IndexEntry =
  | {
      id: string;
      kind: "file";
      source: PDFYFileSystemEntry & { kind: "file" };
      customTitle: string | null;
      pageBreakBefore: boolean | "auto";
      // Per-file overrides. null = use global default.
      showLineNumbers: boolean | null;
      // Image-specific (only meaningful when source is an image)
      imageWidth: number | null;
      imageAlign: "left" | "center" | "right" | null;
      imageVerticalAlign: "top" | "center" | "bottom" | null;
      imageMaxHeight: number | null;
    }
  | {
      id: string;
      kind: "cover";
      title: string;
      subtitle: string | null;
      showDate: boolean;
      /** ISO yyyy-mm-dd. null = render today's date at print time. */
      date: string | null;
    }
  | {
      id: string;
      kind: "toc";
      title: string;
      subtitle: string | null;
    };

export type CodeTheme = "github-light" | "github-dark";

export interface HeaderFooterSettings {
  topLeft: string;
  topCenter: string;
  topRight: string;
  bottomLeft: string;
  bottomCenter: string;
  bottomRight: string;
  showOnCover: boolean;
  showOnToc: boolean;
  /** Page number printed on the very first content page. Useful when users
      want the cover NOT to count as page 1. */
  pageNumberStart: number;
}

/**
 * Table-of-contents row layout. Each row's three columns are
 * Mustache-templated against the per-entry context (`{{title}}`,
 * `{{file}}`, `{{path}}`, `{{page}}`, `{{section}}`, etc.). The TOC
 * page heading itself is set per-entry on the IndexEntry, not here.
 */
export interface TocSettings {
  /** Left column of each row. */
  rowLeft: string;
  /** Optional middle column (between two leaders). Empty hides it. */
  rowCenter: string;
  /** Right column of each row. */
  rowRight: string;
}

/**
 * Project-scoped settings — stored *with the project* in IndexedDB, not
 * with the browser-wide preferences in localStorage. Each project gets
 * its own values; opening another folder doesn't drag your headers along.
 */
export interface ProjectSettings {
  headerFooter: HeaderFooterSettings;
  toc: TocSettings;
}

export const DEFAULT_HEADER_FOOTER: HeaderFooterSettings = {
  topLeft: "",
  topCenter: "",
  topRight: "",
  bottomLeft: "{{#isFile}}{{title}}{{/isFile}}{{#isToc}}{{title}}{{/isToc}}",
  bottomCenter: "",
  bottomRight: "{{page}} / {{pages}}",
  showOnCover: false,
  showOnToc: true,
  pageNumberStart: 1,
};

export const DEFAULT_TOC: TocSettings = {
  rowLeft: "{{section}}",
  rowCenter: "{{title}}",
  rowRight: "{{page}}",
};

export const DEFAULT_PROJECT_SETTINGS: ProjectSettings = {
  headerFooter: { ...DEFAULT_HEADER_FOOTER },
  toc: { ...DEFAULT_TOC },
};

/**
 * App-wide preferences — stored in localStorage and shared across every
 * project this user opens in this browser. Things like "I prefer dark
 * mode" or "default to A4". Per-document choices (header text, which
 * file gets a cover, etc.) live in ProjectSettings instead.
 */
export interface GlobalSettings {
  // Preview & code
  previewTheme: "light" | "dark";
  codeTheme: CodeTheme;
  codeFontSize: number; // pt
  showLineNumbers: boolean;

  // Print structure
  pageSize: "A4" | "Letter";

  // Image defaults
  defaultImageWidth: number; // %
  defaultImageAlign: "left" | "center" | "right";
  defaultImageVerticalAlign: "top" | "center" | "bottom";
  defaultImageMaxHeight: number; // vh in print

  // Behavior
  autoSelect: boolean;
  /** When true (default), .gitignore rules hide matching files from the
      tree. When false, .gitignore is ignored and all files show (we
      still suppress junk dirs like node_modules / .git for performance). */
  respectGitignore: boolean;
}

export const DEFAULT_SETTINGS: GlobalSettings = {
  previewTheme: "light",
  codeTheme: "github-light",
  codeFontSize: 9,
  showLineNumbers: true,
  pageSize: "A4",
  defaultImageWidth: 100,
  defaultImageAlign: "center",
  defaultImageVerticalAlign: "center",
  defaultImageMaxHeight: 80,
  autoSelect: true,
  respectGitignore: true,
};
