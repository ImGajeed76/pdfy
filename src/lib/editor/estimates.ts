/**
 * Rough page-count estimator. We can't know exactly without rendering, but a
 * line-based heuristic is good enough for the brand-bar count display.
 */

const LINES_PER_PAGE = 50;

export function estimateLines(content: string | null | undefined): number {
  if (!content) return 0;
  return content.split("\n").length;
}

export function estimatePages(totalLines: number): number {
  if (totalLines === 0) return 0;
  return Math.max(1, Math.ceil(totalLines / LINES_PER_PAGE));
}
