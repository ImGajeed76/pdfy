import type { PDFYFileSystemEntry } from "$lib/types";
import { determineFileDisplayProperties } from "$lib/fileSystem";

/**
 * Smart auto-select: walk the tree and pick reasonable defaults.
 *
 * Tier 1: include all code/text/markdown files; skip images/binaries/pdfs.
 * Tier 2: project-type-aware ordering (README first, src/ priority, etc.).
 */

type FileEntry = Extract<PDFYFileSystemEntry, { kind: "file" }>;

function flattenFiles(tree: PDFYFileSystemEntry[]): FileEntry[] {
  const out: FileEntry[] = [];
  function walk(entries: PDFYFileSystemEntry[]): void {
    for (const e of entries) {
      if (e.kind === "file") {
        out.push(e);
      } else if (e.kind === "directory") {
        walk(e.children);
      }
    }
  }
  walk(tree);
  return out;
}

function isPrintable(entry: FileEntry): boolean {
  const props = determineFileDisplayProperties(entry.name);
  return props.fileType === "code" || props.fileType === "text";
}

function detectProjectType(tree: PDFYFileSystemEntry[]): string {
  const rootNames = new Set(tree.filter((e) => e.kind === "file").map((e) => e.name));
  if (rootNames.has("package.json")) return "node";
  if (rootNames.has("Cargo.toml")) return "rust";
  if (rootNames.has("go.mod")) return "go";
  if (
    rootNames.has("pyproject.toml") ||
    rootNames.has("setup.py") ||
    rootNames.has("requirements.txt")
  )
    return "python";
  return "generic";
}

function isReadme(name: string): boolean {
  return /^readme(\..+)?$/i.test(name);
}

function isLicense(name: string): boolean {
  return /^(license|licence|copying)(\..+)?$/i.test(name);
}

function isTestPath(path: string): boolean {
  return /(^|\/)(__)?tests?(__)?\//.test(path) || /\.(test|spec)\.[a-z]+$/i.test(path);
}

function priorityOf(file: FileEntry, projectType: string): number {
  // Lower = earlier in the output.
  if (isReadme(file.name)) return 0;
  if (file.path.startsWith("src/") || file.path.startsWith("lib/")) return 10;
  if (projectType === "node" && file.name === "package.json") return 90;
  if (projectType === "rust" && file.name === "Cargo.toml") return 90;
  if (isLicense(file.name)) return 99;
  return 50;
}

/**
 * Returns ordered list of file IDs to auto-select on folder load.
 */
export function smartAutoSelect(tree: PDFYFileSystemEntry[]): FileEntry[] {
  const all = flattenFiles(tree);
  const printable = all.filter(isPrintable);
  const projectType = detectProjectType(tree);

  return printable.sort((a, b) => {
    const pa = priorityOf(a, projectType);
    const pb = priorityOf(b, projectType);
    if (pa !== pb) return pa - pb;
    // Within priority bucket, alphabetical by path.
    return a.path.localeCompare(b.path);
  });
}

/**
 * Tag a file as belonging to a "Tests" / "Config" / null group based on path.
 * Used for auto-grouping if the user enables it.
 */
export function suggestedGroup(file: FileEntry): string | null {
  if (isTestPath(file.path)) return "Tests";
  // Root-level config files.
  if (
    !file.path.includes("/") &&
    /^(\.?(eslint|prettier|tsconfig|svelte|vite|tailwind|postcss|babel|webpack|rollup|jest|vitest)\.?[a-z]*\.?(json|js|ts|cjs|mjs|yaml|yml)?)$/i.test(
      file.name,
    )
  ) {
    return "Config";
  }
  return null;
}
