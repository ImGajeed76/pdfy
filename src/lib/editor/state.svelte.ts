import { SvelteMap, SvelteSet } from "svelte/reactivity";
import type { PDFYFileSystemEntry } from "$lib/types";
import {
  openDirectory,
  readFileContent,
  determineFileDisplayProperties,
  processDirectory,
} from "$lib/fileSystem";
import { smartAutoSelect, suggestedGroup } from "./smart-select";
import { estimateLines, estimatePages } from "./estimates";
import type { GlobalSettings, IndexEntry, IndexGroup } from "./types";
import { DEFAULT_SETTINGS } from "./types";

type FileEntry = Extract<PDFYFileSystemEntry, { kind: "file" }>;

const SETTINGS_KEY = "pdfy:settings";

function loadSettings(): GlobalSettings {
  if (typeof localStorage === "undefined") return { ...DEFAULT_SETTINGS };
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function generateId(): string {
  return `e_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
}

class EditorState {
  // ── Project ─────────────────────────────────────────────────────────────
  rootHandle: FileSystemDirectoryHandle | null = $state(null);
  tree: PDFYFileSystemEntry[] | null = $state(null);
  isLoadingDirectory = $state(false);

  rootName = $derived(this.rootHandle?.name ?? null);

  // ── Index (the print plan) ──────────────────────────────────────────────
  index: IndexEntry[] = $state([]);
  groups: IndexGroup[] = $state([]);
  selectedIndexId: string | null = $state(null);
  // Multi-select (cmd/shift-click on index entries)
  selectedIndexIds: SvelteSet<string> = new SvelteSet();

  // ── Tree state ──────────────────────────────────────────────────────────
  treeFilter = $state("");
  expandedFolders: SvelteSet<string> = new SvelteSet();
  // For visual highlighting in tree: which file is currently focused/previewed
  focusedFileId: string | null = $state(null);

  // ── File content cache ──────────────────────────────────────────────────
  contentCache: SvelteMap<string, string> = new SvelteMap();
  loadingFiles: SvelteSet<string> = new SvelteSet();

  // ── Settings ────────────────────────────────────────────────────────────
  settings: GlobalSettings = $state(loadSettings());

  // ── Undo/redo ───────────────────────────────────────────────────────────
  private undoStack: { index: IndexEntry[]; groups: IndexGroup[] }[] = [];
  private redoStack: { index: IndexEntry[]; groups: IndexGroup[] }[] = [];
  canUndo = $state(false);
  canRedo = $state(false);

  // ── Derived counts ──────────────────────────────────────────────────────
  fileEntries = $derived(this.index.filter((e) => e.kind === "file"));
  entryCount = $derived(this.index.length);
  fileCount = $derived(this.fileEntries.length);
  totalLines = $derived(
    this.fileEntries.reduce((acc, e) => {
      if (e.kind !== "file") return acc;
      const content = this.contentCache.get(e.source.id);
      return acc + estimateLines(content);
    }, 0),
  );
  pageEstimate = $derived(
    estimatePages(this.totalLines) +
      (this.settings.showCover && this.index.some((e) => e.kind === "cover") ? 1 : 0) +
      (this.settings.showToc && this.index.some((e) => e.kind === "toc")
        ? Math.max(1, Math.ceil(this.fileEntries.length / 35))
        : 0),
  );

  // ── Actions: project ────────────────────────────────────────────────────

  async openProject(): Promise<{ ok: boolean; reason?: string }> {
    this.isLoadingDirectory = true;
    const result = await openDirectory();
    this.isLoadingDirectory = false;
    if (!result) return { ok: false, reason: "cancelled-or-error" };
    this.rootHandle = result.handle;
    this.tree = result.tree;
    this.contentCache.clear();
    this.loadingFiles.clear();
    this.expandedFolders.clear();
    // Default-expand root level
    for (const e of result.tree) {
      if (e.kind === "directory") this.expandedFolders.add(e.id);
    }
    this.index = [];
    this.groups = [];
    this.undoStack = [];
    this.redoStack = [];
    this.canUndo = false;
    this.canRedo = false;
    if (this.settings.autoSelect) {
      this.applySmartAutoSelect();
    }
    // Persist as recent (lazy-loaded).
    void rememberAndPersist(this);
    return { ok: true };
  }

  /**
   * Load a project from an already-permissioned handle (used for recents).
   */
  async loadFromHandle(handle: FileSystemDirectoryHandle): Promise<void> {
    this.isLoadingDirectory = true;
    let tree: PDFYFileSystemEntry[];
    try {
      tree = await processDirectory(handle);
    } catch {
      // Permission revoked or read error.
      this.isLoadingDirectory = false;
      return;
    }
    this.isLoadingDirectory = false;
    this.rootHandle = handle;
    this.tree = tree;
    this.contentCache.clear();
    this.loadingFiles.clear();
    this.expandedFolders.clear();
    for (const e of tree) if (e.kind === "directory") this.expandedFolders.add(e.id);
    this.index = [];
    this.groups = [];
    this.undoStack = [];
    this.redoStack = [];
    this.canUndo = false;
    this.canRedo = false;
    if (this.settings.autoSelect) this.applySmartAutoSelect();
    void rememberAndPersist(this);
  }

  closeProject(): void {
    this.rootHandle = null;
    this.tree = null;
    this.index = [];
    this.groups = [];
    this.contentCache.clear();
    this.loadingFiles.clear();
    this.expandedFolders.clear();
    this.undoStack = [];
    this.redoStack = [];
    this.canUndo = false;
    this.canRedo = false;
  }

  // ── Actions: tree ───────────────────────────────────────────────────────

  toggleFolder(id: string): void {
    if (this.expandedFolders.has(id)) this.expandedFolders.delete(id);
    else this.expandedFolders.add(id);
  }

  expandAll(tree: PDFYFileSystemEntry[] = this.tree ?? []): void {
    for (const e of tree) {
      if (e.kind === "directory") {
        this.expandedFolders.add(e.id);
        this.expandAll(e.children);
      }
    }
  }

  collapseAll(): void {
    this.expandedFolders.clear();
  }

  // ── Actions: file content ───────────────────────────────────────────────

  async ensureContent(file: FileEntry): Promise<string> {
    const cached = this.contentCache.get(file.id);
    if (cached !== undefined) return cached;
    if (this.loadingFiles.has(file.id)) {
      // Already loading; spin briefly until it's there.
      return new Promise((resolve) => {
        const interval = setInterval(() => {
          const got = this.contentCache.get(file.id);
          if (got !== undefined) {
            clearInterval(interval);
            resolve(got);
          }
        }, 30);
      });
    }
    this.loadingFiles.add(file.id);
    const content = await readFileContent(file.handle);
    this.contentCache.set(file.id, content);
    this.loadingFiles.delete(file.id);
    return content;
  }

  // ── Actions: index ──────────────────────────────────────────────────────

  private snapshot(): void {
    this.undoStack.push({
      index: structuredCloneCompat(this.index),
      groups: structuredCloneCompat(this.groups),
    });
    if (this.undoStack.length > 30) this.undoStack.shift();
    this.redoStack = [];
    this.canUndo = true;
    this.canRedo = false;
  }

  undo(): void {
    const prev = this.undoStack.pop();
    if (!prev) return;
    this.redoStack.push({
      index: structuredCloneCompat(this.index),
      groups: structuredCloneCompat(this.groups),
    });
    this.index = prev.index;
    this.groups = prev.groups;
    this.canUndo = this.undoStack.length > 0;
    this.canRedo = true;
  }

  redo(): void {
    const next = this.redoStack.pop();
    if (!next) return;
    this.undoStack.push({
      index: structuredCloneCompat(this.index),
      groups: structuredCloneCompat(this.groups),
    });
    this.index = next.index;
    this.groups = next.groups;
    this.canUndo = true;
    this.canRedo = this.redoStack.length > 0;
  }

  /**
   * Add a file to the index. Always creates a new entry — same file can be
   * added multiple times, each as its own row with its own settings.
   */
  addFile(
    file: FileEntry,
    opts: { at?: number; groupId?: string | null; persistContent?: boolean } = {},
  ): IndexEntry {
    this.snapshot();
    const entry: IndexEntry = {
      id: generateId(),
      kind: "file",
      source: file,
      groupId: opts.groupId ?? null,
      customTitle: null,
      pageBreakBefore: "auto",
      renderMode: null,
      showLineNumbers: null,
      showPath: null,
      imageWidth: null,
      imageAlign: null,
      imageMaxHeight: null,
    };
    const at = opts.at ?? this.index.length;
    this.index = [...this.index.slice(0, at), entry, ...this.index.slice(at)];
    if (opts.persistContent !== false) {
      // Fire-and-forget content load.
      this.ensureContent(file).catch(() => {});
    }
    return entry;
  }

  /**
   * Add many files at once (e.g., from a folder drag). Single snapshot.
   */
  addFiles(files: FileEntry[], opts: { at?: number; groupId?: string | null } = {}): void {
    if (files.length === 0) return;
    this.snapshot();
    const newEntries: IndexEntry[] = files.map((file) => ({
      id: generateId(),
      kind: "file",
      source: file,
      groupId: opts.groupId ?? null,
      customTitle: null,
      pageBreakBefore: "auto",
      renderMode: null,
      showLineNumbers: null,
      showPath: null,
      imageWidth: null,
      imageAlign: null,
      imageMaxHeight: null,
    }));
    const at = opts.at ?? this.index.length;
    this.index = [...this.index.slice(0, at), ...newEntries, ...this.index.slice(at)];
    for (const file of files) {
      this.ensureContent(file).catch(() => {});
    }
  }

  removeEntry(entryId: string): void {
    const idx = this.index.findIndex((e) => e.id === entryId);
    if (idx < 0) return;
    this.snapshot();
    this.index = this.index.filter((e) => e.id !== entryId);
    if (this.selectedIndexId === entryId) this.selectedIndexId = null;
    this.selectedIndexIds.delete(entryId);
  }

  removeEntries(ids: string[]): void {
    if (ids.length === 0) return;
    this.snapshot();
    const idSet = new Set(ids);
    this.index = this.index.filter((e) => !idSet.has(e.id));
    if (this.selectedIndexId && idSet.has(this.selectedIndexId)) this.selectedIndexId = null;
    for (const id of ids) this.selectedIndexIds.delete(id);
  }

  moveEntry(entryId: string, toIndex: number): void {
    const fromIndex = this.index.findIndex((e) => e.id === entryId);
    if (fromIndex < 0 || fromIndex === toIndex) return;
    this.snapshot();
    const next = [...this.index];
    const [removed] = next.splice(fromIndex, 1);
    const adjusted = toIndex > fromIndex ? toIndex - 1 : toIndex;
    next.splice(adjusted, 0, removed);
    this.index = next;
  }

  moveEntryUp(entryId: string): void {
    const i = this.index.findIndex((e) => e.id === entryId);
    if (i <= 0) return;
    this.moveEntry(entryId, i - 1);
  }

  moveEntryDown(entryId: string): void {
    const i = this.index.findIndex((e) => e.id === entryId);
    if (i < 0 || i >= this.index.length - 1) return;
    this.moveEntry(entryId, i + 2);
  }

  updateEntry(entryId: string, patch: Partial<IndexEntry>): void {
    const idx = this.index.findIndex((e) => e.id === entryId);
    if (idx < 0) return;
    this.snapshot();
    const current = this.index[idx];
    // Type-narrowed merge: only allow patching same-kind entries.
    this.index = [
      ...this.index.slice(0, idx),
      { ...current, ...patch } as IndexEntry,
      ...this.index.slice(idx + 1),
    ];
  }

  reorderIndex(newOrder: IndexEntry[]): void {
    this.snapshot();
    this.index = newOrder;
  }

  // ── Actions: groups ─────────────────────────────────────────────────────

  createGroup(label: string): IndexGroup {
    const g: IndexGroup = { id: generateId(), label, collapsed: false };
    this.snapshot();
    this.groups = [...this.groups, g];
    return g;
  }

  removeGroup(groupId: string): void {
    this.snapshot();
    this.groups = this.groups.filter((g) => g.id !== groupId);
    // Un-group entries that were in it.
    this.index = this.index.map((e) =>
      e.kind === "file" && e.groupId === groupId ? { ...e, groupId: null } : e,
    );
  }

  renameGroup(groupId: string, label: string): void {
    this.snapshot();
    this.groups = this.groups.map((g) => (g.id === groupId ? { ...g, label } : g));
  }

  toggleGroupCollapse(groupId: string): void {
    // No snapshot: visual-only.
    this.groups = this.groups.map((g) =>
      g.id === groupId ? { ...g, collapsed: !g.collapsed } : g,
    );
  }

  // ── Cover & TOC specials ────────────────────────────────────────────────

  ensureCover(): IndexEntry {
    const existing = this.index.find((e) => e.kind === "cover");
    if (existing) return existing;
    const entry: IndexEntry = {
      id: generateId(),
      kind: "cover",
      title: this.rootName ?? "PDFy Project",
      subtitle: null,
      showDate: true,
    };
    this.snapshot();
    this.index = [entry, ...this.index];
    return entry;
  }

  ensureToc(): IndexEntry {
    const existing = this.index.find((e) => e.kind === "toc");
    if (existing) return existing;
    const entry: IndexEntry = {
      id: generateId(),
      kind: "toc",
      title: "Contents",
    };
    this.snapshot();
    // Place after cover if present, else first.
    const coverIdx = this.index.findIndex((e) => e.kind === "cover");
    const at = coverIdx >= 0 ? coverIdx + 1 : 0;
    this.index = [...this.index.slice(0, at), entry, ...this.index.slice(at)];
    return entry;
  }

  // ── Smart auto-select ───────────────────────────────────────────────────

  applySmartAutoSelect(): void {
    if (!this.tree) return;
    const ordered = smartAutoSelect(this.tree);
    if (this.settings.autoGroup) {
      // Map files to groups by suggested name.
      const groupNameToId: Record<string, string> = {};
      for (const file of ordered) {
        const groupName = suggestedGroup(file);
        if (groupName && !(groupName in groupNameToId)) {
          const g = this.createGroup(groupName);
          groupNameToId[groupName] = g.id;
        }
      }
      this.snapshot();
      const newEntries: IndexEntry[] = ordered.map((file) => {
        const groupName = suggestedGroup(file);
        const groupId = groupName ? (groupNameToId[groupName] ?? null) : null;
        return {
          id: generateId(),
          kind: "file",
          source: file,
          groupId,
          customTitle: null,
          pageBreakBefore: "auto",
          renderMode: null,
          showLineNumbers: null,
          showPath: null,
          imageWidth: null,
          imageAlign: null,
          imageMaxHeight: null,
        };
      });
      // Cover + TOC first if enabled.
      const head: IndexEntry[] = [];
      if (this.settings.showCover) {
        head.push({
          id: generateId(),
          kind: "cover",
          title: this.rootName ?? "PDFy Project",
          subtitle: null,
          showDate: true,
        });
      }
      if (this.settings.showToc) {
        head.push({ id: generateId(), kind: "toc", title: "Contents" });
      }
      this.index = [...head, ...newEntries];
    } else {
      this.snapshot();
      const head: IndexEntry[] = [];
      if (this.settings.showCover) {
        head.push({
          id: generateId(),
          kind: "cover",
          title: this.rootName ?? "PDFy Project",
          subtitle: null,
          showDate: true,
        });
      }
      if (this.settings.showToc) {
        head.push({ id: generateId(), kind: "toc", title: "Contents" });
      }
      const newEntries: IndexEntry[] = ordered.map((file) => ({
        id: generateId(),
        kind: "file",
        source: file,
        groupId: null,
        customTitle: null,
        pageBreakBefore: "auto",
        renderMode: null,
        showLineNumbers: null,
        showPath: null,
        imageWidth: null,
        imageAlign: null,
        imageMaxHeight: null,
      }));
      this.index = [...head, ...newEntries];
    }
    // Pre-warm content cache.
    for (const file of ordered) {
      this.ensureContent(file).catch(() => {});
    }
  }

  // ── Settings ────────────────────────────────────────────────────────────

  updateSettings(patch: Partial<GlobalSettings>): void {
    this.settings = { ...this.settings, ...patch };
    if (typeof localStorage !== "undefined") {
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
      } catch {
        // Storage full or denied; setting still works in memory.
      }
    }
  }

  // ── Helpers for child components ────────────────────────────────────────

  /**
   * Get the effective render mode for a file entry, falling back to settings.
   */
  effectiveRenderMode(entry: Extract<IndexEntry, { kind: "file" }>): "raw" | "rendered" {
    if (entry.renderMode) return entry.renderMode;
    const props = determineFileDisplayProperties(entry.source.name);
    if (props.fileType === "rendered") {
      const ext = entry.source.name.split(".").pop()?.toLowerCase();
      if (ext === "md" || ext === "markdown") return this.settings.defaultMarkdownMode;
      if (ext === "html" || ext === "htm") return this.settings.defaultHtmlMode;
      if (ext === "xml") return this.settings.defaultXmlMode;
    }
    return "raw";
  }

  effectiveShowLineNumbers(entry: Extract<IndexEntry, { kind: "file" }>): boolean {
    return entry.showLineNumbers ?? this.settings.showLineNumbers;
  }

  effectiveShowPath(entry: Extract<IndexEntry, { kind: "file" }>): boolean {
    return entry.showPath ?? this.settings.showPath;
  }
}

/**
 * structuredClone polyfill that handles our entry shape.
 * structuredClone() exists in modern browsers but mishandles class instances
 * (FileSystemFileHandle is fine to share by reference). Use a simple deep
 * clone of plain fields, preserving handle references.
 */
function structuredCloneCompat<T>(value: T): T {
  // Our IndexEntry / IndexGroup are plain objects with primitive fields plus
  // file-handle references that should be shared, not cloned.
  if (Array.isArray(value)) {
    return value.map((v) => structuredCloneCompat(v)) as unknown as T;
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      // Don't clone handles or other class instances.
      if (
        v !== null &&
        typeof v === "object" &&
        // Heuristic: anything with a constructor that isn't Object.
        (v as { constructor?: { name: string } }).constructor &&
        (v as { constructor: { name: string } }).constructor.name !== "Object" &&
        !Array.isArray(v)
      ) {
        out[k] = v;
      } else {
        out[k] = structuredCloneCompat(v);
      }
    }
    return out as unknown as T;
  }
  return value;
}

export const editor = new EditorState();

/**
 * Lazy-import recent.ts to avoid a circular import at module-load time.
 * recent.ts imports `editor` from this file.
 */
async function rememberAndPersist(state: EditorState): Promise<void> {
  if (!state.rootHandle) return;
  try {
    const { rememberProject } = await import("./recent");
    await rememberProject(state.rootHandle, state.fileCount);
  } catch {
    // IndexedDB unavailable or quota exceeded; non-fatal.
  }
}
