/**
 * Header/footer template rendering. Uses Mustache so users get familiar
 * `{{var}}` syntax plus `{{#section}}…{{/section}}` and `{{^section}}…{{/section}}`
 * for conditionals. Logic-less by design — we expose ready-made boolean
 * flags (isCover, isFirstPageOfFile…) and pre-formatted date variants
 * instead of a full expression language.
 */

import Mustache from "mustache";
import type { IndexEntry } from "./types";

// Mustache HTML-escapes by default. We render into our own plain-text
// `<span>` slots so escaping is unwanted (and we already control the
// content boundary).
Mustache.escape = (s) => s;

export interface DateContext {
  iso: string; // 2026-05-03
  long: string; // May 3, 2026
  short: string; // 5/3/26
  year: string;
  month: string;
  day: string;
  weekday: string; // Sunday
}

export interface TimeContext {
  iso: string; // 22:13:00
  short: string; // 22:13
  hour: string;
  minute: string;
}

export interface TemplateContext {
  // Pagination
  page: number;
  pages: number;
  // Project
  project: string;
  // Per-entry
  file: string; // filename, "" for cover/toc
  path: string; // relative path, "" for cover/toc
  ext: string; // extension, "" for non-files
  title: string; // customTitle if set, else file or entry-kind label
  section: number; // 1-based entry index
  sections: number; // total entries
  // Time
  date: DateContext;
  time: TimeContext;
  // Booleans for conditional rendering ({{#flag}}…{{/flag}})
  isCover: boolean;
  isToc: boolean;
  isFile: boolean;
  isFirstPageOfFile: boolean;
  isFirstPageOfDoc: boolean;
  isLastPageOfDoc: boolean;
}

export function buildDateContext(d: Date = new Date()): DateContext {
  const pad = (n: number): string => String(n).padStart(2, "0");
  return {
    iso: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    long: d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }),
    short: d.toLocaleDateString(),
    year: String(d.getFullYear()),
    month: pad(d.getMonth() + 1),
    day: pad(d.getDate()),
    weekday: d.toLocaleDateString(undefined, { weekday: "long" }),
  };
}

export function buildTimeContext(d: Date = new Date()): TimeContext {
  const pad = (n: number): string => String(n).padStart(2, "0");
  return {
    iso: `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`,
    short: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
    hour: pad(d.getHours()),
    minute: pad(d.getMinutes()),
  };
}

export interface BuildContextInput {
  entry: IndexEntry;
  pageWithinEntry: number; // 1-based, sheet index within the entry
  globalPage: number; // 1-based, global page across the doc
  totalPages: number;
  sectionIndex: number; // 0-based entry index
  totalSections: number; // total entries
  projectName: string;
  now?: Date;
}

export function buildTemplateContext(input: BuildContextInput): TemplateContext {
  const now = input.now ?? new Date();
  const isCover = input.entry.kind === "cover";
  const isToc = input.entry.kind === "toc";
  const isFile = input.entry.kind === "file";
  let file = "";
  let path = "";
  let ext = "";
  let title = "";
  if (isFile) {
    const f = (input.entry as Extract<IndexEntry, { kind: "file" }>).source;
    file = f.name;
    path = f.path;
    const dot = f.name.lastIndexOf(".");
    ext = dot >= 0 ? f.name.slice(dot + 1) : "";
    title = (input.entry as Extract<IndexEntry, { kind: "file" }>).customTitle?.trim() || f.name;
  } else if (isCover) {
    title = (input.entry as Extract<IndexEntry, { kind: "cover" }>).title;
  } else if (isToc) {
    title = (input.entry as Extract<IndexEntry, { kind: "toc" }>).title;
  }
  return {
    page: input.globalPage,
    pages: input.totalPages,
    project: input.projectName,
    file,
    path,
    ext,
    title,
    section: input.sectionIndex + 1,
    sections: input.totalSections,
    date: buildDateContext(now),
    time: buildTimeContext(now),
    isCover,
    isToc,
    isFile,
    isFirstPageOfFile: input.pageWithinEntry === 1,
    isFirstPageOfDoc: input.globalPage === 1,
    isLastPageOfDoc: input.globalPage === input.totalPages,
  };
}

/**
 * Render one slot's template against a context. Falls back to the raw
 * template string on any Mustache parse error so a typo doesn't blank out
 * the slot — the user sees their own text and can fix it.
 */
export function renderTemplate(template: string, context: TemplateContext): string {
  if (!template) return "";
  try {
    return Mustache.render(template, context);
  } catch {
    return template;
  }
}

/**
 * Variables exposed in the template autocomplete and chip palette.
 * Grouped for the UI; the flat list is the autocomplete source.
 */
export const VARIABLE_GROUPS: Array<{
  label: string;
  vars: Array<{ name: string; help: string }>;
}> = [
  {
    label: "Pagination",
    vars: [
      { name: "page", help: "Current page number" },
      { name: "pages", help: "Total page count" },
      { name: "section", help: "Current entry index (1-based)" },
      { name: "sections", help: "Total entry count" },
    ],
  },
  {
    label: "Project",
    vars: [{ name: "project", help: "Project / root folder name" }],
  },
  {
    label: "File",
    vars: [
      { name: "file", help: "File name (e.g. state.svelte.ts)" },
      { name: "path", help: "Full relative path" },
      { name: "ext", help: "File extension" },
      { name: "title", help: "Custom title or file name" },
    ],
  },
  {
    label: "Date",
    vars: [
      { name: "date.iso", help: "2026-05-03" },
      { name: "date.long", help: "May 3, 2026" },
      { name: "date.short", help: "Locale-default short" },
      { name: "date.year", help: "2026" },
      { name: "date.month", help: "05" },
      { name: "date.day", help: "03" },
      { name: "date.weekday", help: "Sunday" },
    ],
  },
  {
    label: "Time",
    vars: [
      { name: "time.iso", help: "22:13:00" },
      { name: "time.short", help: "22:13" },
      { name: "time.hour", help: "22" },
      { name: "time.minute", help: "13" },
    ],
  },
  {
    label: "Conditionals (Mustache sections)",
    vars: [
      { name: "#isCover", help: "{{#isCover}}…{{/isCover}}" },
      { name: "#isToc", help: "{{#isToc}}…{{/isToc}}" },
      { name: "#isFile", help: "{{#isFile}}…{{/isFile}}" },
      { name: "#isFirstPageOfFile", help: "Show only on first sheet of each file" },
      { name: "#isFirstPageOfDoc", help: "Show only on the very first page" },
      { name: "#isLastPageOfDoc", help: "Show only on the last page" },
      { name: "^isCover", help: "Inverted: hide on cover" },
    ],
  },
];

export const FLAT_VARIABLES = VARIABLE_GROUPS.flatMap((g) => g.vars);
