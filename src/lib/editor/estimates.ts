/**
 * Page-count estimator. Mirrors the wrap-aware visual-line pagination used
 * inside PreviewSection so the brand-bar count matches the rendered sheets.
 */
import { determineFileDisplayProperties } from "$lib/fileSystem";
import type { GlobalSettings, IndexEntry } from "./types";

const PT_TO_PX = 4 / 3;
const CM_TO_PX = 96 / 2.54;
const MM_TO_PX = CM_TO_PX / 10;
const IN_TO_PX = 96;
const MARGIN_PX = 1.5 * CM_TO_PX;
const CODE_LINE_HEIGHT = 1.45;
const MONO_CHAR_WIDTH = 0.62;
const LINE_NUM_EM = 3;

export function estimateLines(content: string | null | undefined): number {
  if (!content) return 0;
  return content.split("\n").length;
}

/** Visual rows that fit on one sheet — must match PreviewSection. */
export function visualLinesPerPage(pageSize: "A4" | "Letter", fontSizePt: number): number {
  const sheetH = pageSize === "A4" ? 297 * MM_TO_PX : 11 * IN_TO_PX;
  const contentH = sheetH - 2 * MARGIN_PX;
  const lineH = fontSizePt * PT_TO_PX * CODE_LINE_HEIGHT;
  return Math.max(1, Math.floor(contentH / lineH));
}

/** Monospace characters that fit on one row — must match PreviewSection. */
export function charsPerLine(
  pageSize: "A4" | "Letter",
  fontSizePt: number,
  hasLineNumbers: boolean,
): number {
  const sheetW = pageSize === "A4" ? 210 * MM_TO_PX : 8.5 * IN_TO_PX;
  const contentW = sheetW - 2 * MARGIN_PX;
  const fontPx = fontSizePt * PT_TO_PX;
  const numW = hasLineNumbers ? LINE_NUM_EM * fontPx : 0;
  const charW = fontPx * MONO_CHAR_WIDTH;
  return Math.max(20, Math.floor((contentW - numW) / charW));
}

/**
 * How many sheets a code/text body occupies given wrap-aware sizing.
 */
function estimateCodePages(content: string, settings: GlobalSettings): number {
  const budget = visualLinesPerPage(settings.pageSize, settings.codeFontSize);
  const charCap = charsPerLine(settings.pageSize, settings.codeFontSize, settings.showLineNumbers);
  let pages = 1;
  let used = 0;
  for (const text of content.split("\n")) {
    const rows = Math.max(1, Math.ceil(text.length / charCap));
    if (used + rows > budget && used > 0) {
      pages += 1;
      used = rows;
    } else {
      used += rows;
    }
  }
  return pages;
}

/**
 * Estimate the number of printed sheets a single index entry produces.
 * - cover, toc: 1 sheet
 * - image / binary / pdf: 1 sheet (the actual measured count from
 *   PreviewSection wins via editor.measuredPageCounts)
 * - text/code: wrap-aware pagination
 */
export function estimatePagesForEntry(
  entry: IndexEntry,
  settings: GlobalSettings,
  fileEntryCount: number,
  contentLookup: (id: string) => string | null | undefined,
): number {
  if (entry.kind === "cover") return 1;
  if (entry.kind === "toc") return Math.max(1, Math.ceil(fileEntryCount / 35));
  // file
  const ft = determineFileDisplayProperties(entry.source.name).fileType;
  if (ft === "graphic" || ft === "binary") return 1;
  const ext = entry.source.name.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return 1;
  const content = contentLookup(entry.source.id);
  if (!content) return 1;
  return estimateCodePages(content, settings);
}
