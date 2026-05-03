import type { PDFYFileSystemEntry } from "$lib/types";

export function findFileById(tree: PDFYFileSystemEntry[], id: string): PDFYFileSystemEntry | null {
  for (const e of tree) {
    if (e.id === id) return e;
    if (e.kind === "directory") {
      const found = findFileById(e.children, id);
      if (found) return found;
    }
  }
  return null;
}
