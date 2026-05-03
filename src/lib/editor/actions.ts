import type { IndexEntry } from "./types";
import { editor } from "./state.svelte";
import { promptText } from "./prompt.svelte";

export async function renameEntry(entry: IndexEntry): Promise<void> {
  if (entry.kind === "file") {
    const next = await promptText({
      title: "Custom title",
      description: "Override the default filename used as the section heading.",
      label: "Title",
      value: entry.customTitle ?? "",
      placeholder: entry.source.name,
    });
    if (next === null) return;
    editor.updateEntry(entry.id, { customTitle: next.trim() || null });
  } else if (entry.kind === "cover") {
    const next = await promptText({
      title: "Cover title",
      label: "Title",
      value: entry.title,
      placeholder: editor.rootName ?? "PDFy Project",
    });
    if (next === null) return;
    editor.updateEntry(entry.id, { title: next.trim() || (editor.rootName ?? "PDFy Project") });
  } else if (entry.kind === "toc") {
    const next = await promptText({
      title: "Table of contents title",
      label: "Title",
      value: entry.title,
      placeholder: "Contents",
    });
    if (next === null) return;
    editor.updateEntry(entry.id, { title: next.trim() || "Contents" });
  }
}
