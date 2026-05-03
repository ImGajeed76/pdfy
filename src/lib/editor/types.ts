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
      groupId: string | null;
      customTitle: string | null;
      pageBreakBefore: boolean | "auto";
      // Per-file overrides. null = use global default.
      renderMode: "raw" | "rendered" | null;
      showLineNumbers: boolean | null;
      showPath: boolean | null;
      // Image-specific (only meaningful when source is an image)
      imageWidth: number | null;
      imageAlign: "left" | "center" | "right" | null;
      imageMaxHeight: number | null;
    }
  | {
      id: string;
      kind: "cover";
      title: string;
      subtitle: string | null;
      showDate: boolean;
    }
  | {
      id: string;
      kind: "toc";
      title: string;
    };

export interface IndexGroup {
  id: string;
  label: string;
  collapsed: boolean;
}

export type RenderMode = "raw" | "rendered";

export type CodeTheme = "github-light" | "github-dark";

export interface GlobalSettings {
  // Preview & code
  previewTheme: "light" | "dark";
  codeTheme: CodeTheme;
  codeFontSize: number; // pt
  showLineNumbers: boolean;

  // Print structure
  pageSize: "A4" | "Letter";
  showCover: boolean;
  showToc: boolean;
  showGroupDividers: boolean;

  // Per-type render defaults
  defaultMarkdownMode: RenderMode;
  defaultHtmlMode: RenderMode;
  defaultXmlMode: RenderMode;
  defaultJsonMode: RenderMode;
  defaultCsvMode: RenderMode;

  // Image defaults
  defaultImageWidth: number; // %
  defaultImageAlign: "left" | "center" | "right";
  defaultImageMaxHeight: number; // vh in print

  // Behavior
  showPath: boolean;
  autoSelect: boolean;
  autoGroup: boolean;
}

export const DEFAULT_SETTINGS: GlobalSettings = {
  previewTheme: "light",
  codeTheme: "github-light",
  codeFontSize: 11,
  showLineNumbers: true,
  pageSize: "A4",
  showCover: true,
  showToc: true,
  showGroupDividers: false,
  defaultMarkdownMode: "rendered",
  defaultHtmlMode: "rendered",
  defaultXmlMode: "raw",
  defaultJsonMode: "raw",
  defaultCsvMode: "raw",
  defaultImageWidth: 100,
  defaultImageAlign: "center",
  defaultImageMaxHeight: 80,
  showPath: true,
  autoSelect: true,
  autoGroup: false,
};
