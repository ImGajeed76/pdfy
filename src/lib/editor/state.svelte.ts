import { SvelteMap, SvelteSet } from "svelte/reactivity";
import type { PDFYFileSystemEntry } from "$lib/types";
import { openDirectory, readFileContent, processDirectory } from "$lib/fileSystem";
import { smartAutoSelect } from "./smart-select";
import { estimateLines, estimatePagesForEntry } from "./estimates";
import type { GlobalSettings, IndexEntry, ProjectSettings } from "./types";
import {
  DEFAULT_HEADER_FOOTER,
  DEFAULT_PROJECT_SETTINGS,
  DEFAULT_SETTINGS,
  DEFAULT_TOC,
} from "./types";

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
  /** IDB id for the current project. Set when remembered/loaded. */
  projectId: string | null = $state(null);

  rootName = $derived(this.rootHandle?.name ?? null);

  // ── Index (the print plan) ──────────────────────────────────────────────
  index: IndexEntry[] = $state([]);
  /** Multi-select. Single click replaces, shift-click extends, cmd/ctrl
   *  toggles. Drives the contextual settings bar. */
  selectedIndexIds: SvelteSet<string> = new SvelteSet();
  /** Anchor for shift-click range selection. */
  selectionAnchorId: string | null = $state(null);
  /** Scroll-position derived: currently most-visible entry in preview. */
  currentEntryId: string | null = $state(null);
  /** True when an autosave is queued. Drives the saving indicator. */
  isAutosaving = $state(false);

  // ── Tree state ──────────────────────────────────────────────────────────
  treeFilter = $state("");
  expandedFolders: SvelteSet<string> = new SvelteSet();
  // For visual highlighting in tree: which file is currently focused/previewed
  focusedFileId: string | null = $state(null);
  // Anchor for shift-click range-add in the tree.
  treeAnchorFileId: string | null = $state(null);
  // "Reveal in tree" pulse: bumped on every reveal so the same file can be
  // re-pulsed (a plain id wouldn't trigger the effect when it doesn't change).
  revealPulseId: string | null = $state(null);
  revealPulseTick = $state(0);

  // ── File content cache ──────────────────────────────────────────────────
  contentCache: SvelteMap<string, string> = new SvelteMap();
  loadingFiles: SvelteSet<string> = new SvelteSet();

  // ── Measured page counts ────────────────────────────────────────────────
  /** Actual sheet count for a code/PDF entry, written by PreviewSection
      after pagination. Falls back to estimatePagesForEntry() when
      missing (entry not yet rendered, or single-sheet entry like image). */
  measuredPageCounts: SvelteMap<string, number> = new SvelteMap();

  // ── Settings ────────────────────────────────────────────────────────────
  /** App-wide preferences. Persist in localStorage and follow the user
      across every project they open in this browser. */
  settings: GlobalSettings = $state(loadSettings());
  /** Per-project settings (header/footer templates, etc). Persist in
      IndexedDB alongside the project's index; reset to defaults
      whenever a fresh project is opened. */
  projectSettings: ProjectSettings = $state({ ...DEFAULT_PROJECT_SETTINGS });

  // ── Undo/redo ───────────────────────────────────────────────────────────
  private undoStack: { index: IndexEntry[] }[] = [];
  private redoStack: { index: IndexEntry[] }[] = [];
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
  pageEstimate = $derived.by(() => {
    const fileEntryCount = this.fileEntries.length;
    let total = 0;
    for (const e of this.index) {
      const measured = this.measuredPageCounts.get(e.id);
      total +=
        measured ??
        estimatePagesForEntry(e, this.settings, fileEntryCount, (id) => this.contentCache.get(id));
    }
    return total;
  });

  /** 1-based global page number where each entry begins (without the
      pageNumberStart offset — apply that at the call site). Drives the
      TOC's right-column page numbers and Preview's per-entry startPage. */
  entryStartPages = $derived.by(() => {
    const fileEntryCount = this.fileEntries.length;
    // eslint-disable-next-line svelte/prefer-svelte-reactivity -- derived snapshot, not reactive
    const out = new Map<string, number>();
    let acc = 0;
    for (const e of this.index) {
      out.set(e.id, acc + 1);
      const measured = this.measuredPageCounts.get(e.id);
      acc +=
        measured ??
        estimatePagesForEntry(e, this.settings, fileEntryCount, (id) => this.contentCache.get(id));
    }
    return out;
  });

  // ── Actions: project ────────────────────────────────────────────────────

  async openProject(): Promise<{ ok: boolean; reason?: string }> {
    this.isLoadingDirectory = true;
    const result = await openDirectory({ respectGitignore: this.settings.respectGitignore });
    this.isLoadingDirectory = false;
    if (!result) return { ok: false, reason: "cancelled-or-error" };
    await this.adoptHandleAndTree(result.handle, result.tree, { freshTreeOnly: false });
    return { ok: true };
  }

  /**
   * Load a project from an already-permissioned handle (used for recents).
   */
  async loadFromHandle(handle: FileSystemDirectoryHandle): Promise<void> {
    this.isLoadingDirectory = true;
    let tree: PDFYFileSystemEntry[];
    try {
      tree = await processDirectory(
        handle,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        this.settings.respectGitignore,
      );
    } catch {
      this.isLoadingDirectory = false;
      return;
    }
    this.isLoadingDirectory = false;
    await this.adoptHandleAndTree(handle, tree, { freshTreeOnly: false });
  }

  /**
   * Re-walk the current root with the latest gitignore preference. Called
   * by the file tree's "show gitignored" toggle so the visible tree
   * updates without losing the user's index/groups (we're just changing
   * what the *tree* shows; the index keeps any files already added).
   */
  async rescanTree(): Promise<void> {
    if (!this.rootHandle) return;
    this.isLoadingDirectory = true;
    try {
      const tree = await processDirectory(
        this.rootHandle,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        this.settings.respectGitignore,
      );
      this.tree = tree;
      // Re-expand any directories we previously had open that still exist.
      // eslint-disable-next-line svelte/prefer-svelte-reactivity -- local lookup, not reactive state
      const stillExists = new Set<string>();
      const walk = (es: PDFYFileSystemEntry[]): void => {
        for (const e of es) {
          if (e.kind === "directory") {
            stillExists.add(e.id);
            walk(e.children);
          }
        }
      };
      walk(tree);
      for (const id of [...this.expandedFolders]) {
        if (!stillExists.has(id)) this.expandedFolders.delete(id);
      }
    } finally {
      this.isLoadingDirectory = false;
    }
  }

  /**
   * Internal: adopt a directory handle and freshly walked tree. Restore saved
   * project state if present, otherwise apply smart auto-select. Sets up
   * autosave for subsequent mutations.
   */
  private async adoptHandleAndTree(
    handle: FileSystemDirectoryHandle,
    tree: PDFYFileSystemEntry[],
    _opts: { freshTreeOnly: boolean },
  ): Promise<void> {
    this.rootHandle = handle;
    this.tree = tree;
    this.contentCache.clear();
    this.loadingFiles.clear();
    this.expandedFolders.clear();
    for (const e of tree) if (e.kind === "directory") this.expandedFolders.add(e.id);
    this.index = [];
    this.projectSettings = { ...DEFAULT_PROJECT_SETTINGS };
    this.undoStack = [];
    this.redoStack = [];
    this.canUndo = false;
    this.canRedo = false;
    this.selectedIndexIds.clear();
    this.selectionAnchorId = null;
    this.currentEntryId = null;

    // Look up the project id for this handle (if known) so behavior-learning
    // and saved state both have access to the right project key BEFORE we
    // run smart-auto-select.
    const knownId = await tryFindProjectId(handle);
    if (knownId) {
      this.projectId = knownId;
      await this.loadLearnedRejections();
    }

    // Try to restore saved state for this project (matched by handle equality).
    const restored = await tryRestoreProjectState(handle);
    if (restored) {
      this.projectId = restored.id;
      // Re-link saved index entries to the FRESH tree's source objects so
      // counts/badges line up. Saved entries' ids match by path, but their
      // .source references the old handles.
      // eslint-disable-next-line svelte/prefer-svelte-reactivity -- local lookup, not reactive state
      const idToFile = new Map<string, Extract<PDFYFileSystemEntry, { kind: "file" }>>();
      function walk(entries: PDFYFileSystemEntry[]): void {
        for (const e of entries) {
          if (e.kind === "file") idToFile.set(e.id, e);
          else walk(e.children);
        }
      }
      walk(tree);
      const beforeCount = restored.state.index.filter((e) => e.kind === "file").length;
      this.index = restored.state.index
        .map((entry) => {
          if (entry.kind !== "file") return entry;
          // OS-dropped entries (added via drag from the file manager) live
          // outside the project tree. Their handle is intact in the saved
          // entry; keep them as-is.
          if (entry.source.id.startsWith("__os__/")) return entry;
          const fresh = idToFile.get(entry.source.id);
          if (!fresh) return null; // file no longer exists in the tree
          return { ...entry, source: fresh } as IndexEntry;
        })
        .filter((e): e is IndexEntry => e !== null);
      // Restore per-project settings if the saved state included them
      // (older saves predate this field — fall back to defaults).
      // Field-level merge so older saves (which only had headerFooter,
      // not toc) still get sensible defaults for the newer fields.
      const saved = restored.state.settings;
      this.projectSettings = saved
        ? {
            headerFooter: { ...DEFAULT_HEADER_FOOTER, ...saved.headerFooter },
            toc: { ...DEFAULT_TOC, ...saved.toc },
          }
        : { ...DEFAULT_PROJECT_SETTINGS };
      const afterCount = this.index.filter((e) => e.kind === "file").length;
      const dropped = beforeCount - afterCount;
      // Pre-warm content for restored files.
      for (const e of this.index) {
        if (e.kind === "file") this.ensureContent(e.source).catch(() => {});
      }
      // Surface a toast that the previous state was restored.
      void notifyRestored(afterCount, dropped);
    } else if (this.settings.autoSelect) {
      this.applySmartAutoSelect();
    }
    void rememberAndPersist(this);
  }

  closeProject(): void {
    this.rootHandle = null;
    this.tree = null;
    this.index = [];
    this.projectSettings = { ...DEFAULT_PROJECT_SETTINGS };
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

  /**
   * Expand all ancestor folders for a given file path so the file is visible
   * in the tree. Path is the entry id (a /-separated relative path).
   */
  revealInTree(filePath: string): void {
    const parts = filePath.split("/");
    let acc = "";
    for (let i = 0; i < parts.length - 1; i++) {
      acc = acc ? `${acc}/${parts[i]}` : parts[i];
      this.expandedFolders.add(acc);
    }
    this.focusedFileId = filePath;
    this.revealPulseId = filePath;
    this.revealPulseTick++;
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
    this.undoStack.push({ index: structuredCloneCompat(this.index) });
    if (this.undoStack.length > 30) this.undoStack.shift();
    this.redoStack = [];
    this.canUndo = true;
    this.canRedo = false;
  }

  undo(): void {
    const prev = this.undoStack.pop();
    if (!prev) return;
    this.redoStack.push({ index: structuredCloneCompat(this.index) });
    this.index = prev.index;
    this.canUndo = this.undoStack.length > 0;
    this.canRedo = true;
  }

  redo(): void {
    const next = this.redoStack.pop();
    if (!next) return;
    this.undoStack.push({ index: structuredCloneCompat(this.index) });
    this.index = next.index;
    this.canUndo = true;
    this.canRedo = this.redoStack.length > 0;
  }

  /**
   * Add a file to the index. Always creates a new entry — same file can be
   * added multiple times, each as its own row with its own settings.
   */
  addFile(file: FileEntry, opts: { at?: number; persistContent?: boolean } = {}): IndexEntry {
    this.snapshot();
    // If user re-adds a previously rejected file, clear the rejection.
    if (this.learnedRejections.has(file.path)) {
      this.learnedRejections.delete(file.path);
      void unlearnRejection(file.path, this.projectId);
    }
    const entry: IndexEntry = {
      id: generateId(),
      kind: "file",
      source: file,
      customTitle: null,
      pageBreakBefore: "auto",
      showLineNumbers: null,
      imageWidth: null,
      imageAlign: null,
      imageVerticalAlign: null,
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
  addFiles(files: FileEntry[], opts: { at?: number } = {}): void {
    if (files.length === 0) return;
    this.snapshot();
    const newEntries: IndexEntry[] = files.map((file) => ({
      id: generateId(),
      kind: "file",
      source: file,
      customTitle: null,
      pageBreakBefore: "auto",
      showLineNumbers: null,
      imageWidth: null,
      imageAlign: null,
      imageVerticalAlign: null,
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
    const removed = this.index[idx];
    this.snapshot();
    this.index = this.index.filter((e) => e.id !== entryId);
    this.selectedIndexIds.delete(entryId);
    if (this.currentEntryId === entryId) this.currentEntryId = null;
    if (this.selectionAnchorId === entryId) this.selectionAnchorId = null;
    // Behavior-learning: if a smart-added file is removed, remember the
    // rejection for next time this project is opened.
    if (removed.kind === "file" && this.smartAddedPaths.has(removed.source.path)) {
      void learnRejection(removed.source.path, this.projectId);
      this.learnedRejections.add(removed.source.path);
    }
  }

  removeEntries(ids: string[]): void {
    if (ids.length === 0) return;
    this.snapshot();
    const idSet = new Set(ids);
    this.index = this.index.filter((e) => !idSet.has(e.id));
    for (const id of ids) this.selectedIndexIds.delete(id);
    if (this.currentEntryId && idSet.has(this.currentEntryId)) this.currentEntryId = null;
    if (this.selectionAnchorId && idSet.has(this.selectionAnchorId)) this.selectionAnchorId = null;
  }

  /**
   * Add all files between the tree anchor and the given file id (inclusive),
   * walking the tree in depth-first order. Used for shift-click in the tree.
   */
  addTreeRange(toFileId: string): number {
    if (!this.tree) return 0;
    const flat: Extract<PDFYFileSystemEntry, { kind: "file" }>[] = [];
    function walk(es: PDFYFileSystemEntry[]): void {
      for (const e of es) {
        if (e.kind === "file") flat.push(e);
        else walk(e.children);
      }
    }
    walk(this.tree);
    const fromIdx = this.treeAnchorFileId
      ? flat.findIndex((f) => f.id === this.treeAnchorFileId)
      : -1;
    const toIdx = flat.findIndex((f) => f.id === toFileId);
    if (toIdx < 0) return 0;
    if (fromIdx < 0) {
      // No anchor: just add the single file.
      this.addFile(flat[toIdx]);
      return 1;
    }
    const [a, b] = fromIdx <= toIdx ? [fromIdx, toIdx] : [toIdx, fromIdx];
    const slice = flat.slice(a, b + 1);
    this.addFiles(slice);
    return slice.length;
  }

  /** Selection helpers used by IndexItem click handling. */
  selectOne(id: string): void {
    this.selectedIndexIds.clear();
    this.selectedIndexIds.add(id);
    this.selectionAnchorId = id;
  }

  toggleSelection(id: string): void {
    if (this.selectedIndexIds.has(id)) {
      this.selectedIndexIds.delete(id);
    } else {
      this.selectedIndexIds.add(id);
      this.selectionAnchorId = id;
    }
  }

  selectRange(toId: string): void {
    if (!this.selectionAnchorId) {
      this.selectOne(toId);
      return;
    }
    const fromIdx = this.index.findIndex((e) => e.id === this.selectionAnchorId);
    const toIdx = this.index.findIndex((e) => e.id === toId);
    if (fromIdx < 0 || toIdx < 0) {
      this.selectOne(toId);
      return;
    }
    const [a, b] = fromIdx <= toIdx ? [fromIdx, toIdx] : [toIdx, fromIdx];
    this.selectedIndexIds.clear();
    for (let i = a; i <= b; i++) this.selectedIndexIds.add(this.index[i].id);
  }

  clearSelection(): void {
    this.selectedIndexIds.clear();
    this.selectionAnchorId = null;
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
      date: null,
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
      subtitle: null,
    };
    this.snapshot();
    // Place after cover if present, else first.
    const coverIdx = this.index.findIndex((e) => e.kind === "cover");
    const at = coverIdx >= 0 ? coverIdx + 1 : 0;
    this.index = [...this.index.slice(0, at), entry, ...this.index.slice(at)];
    return entry;
  }

  // ── Smart auto-select ───────────────────────────────────────────────────

  /** Paths the user has previously rejected for this project. */
  private learnedRejections: Set<string> = new Set();
  /** Track which paths were just smart-added so removals can be learned. */
  private smartAddedPaths: Set<string> = new Set();

  async loadLearnedRejections(): Promise<void> {
    if (!this.projectId) return;
    try {
      const { loadRejections } = await import("./behavior");
      const r = await loadRejections(this.projectId);
      this.learnedRejections = new Set(r.paths);
    } catch {
      this.learnedRejections = new Set();
    }
  }

  applySmartAutoSelect(): void {
    if (!this.tree) return;
    const ordered = smartAutoSelect(this.tree).filter((f) => !this.learnedRejections.has(f.path));
    this.smartAddedPaths = new Set(ordered.map((f) => f.path));
    this.snapshot();
    // Every fresh project gets a cover + TOC by default. Users can
    // delete them from the index panel if they don't want them.
    const head: IndexEntry[] = [
      {
        id: generateId(),
        kind: "cover",
        title: this.rootName ?? "PDFy Project",
        subtitle: null,
        showDate: true,
        date: null,
      },
      { id: generateId(), kind: "toc", title: "Contents", subtitle: null },
    ];
    const newEntries: IndexEntry[] = ordered.map((file) => ({
      id: generateId(),
      kind: "file",
      source: file,
      customTitle: null,
      pageBreakBefore: "auto",
      showLineNumbers: null,
      imageWidth: null,
      imageAlign: null,
      imageVerticalAlign: null,
      imageMaxHeight: null,
    }));
    this.index = [...head, ...newEntries];
    // Pre-warm content cache.
    for (const file of ordered) {
      this.ensureContent(file).catch(() => {});
    }
  }

  // ── Settings ────────────────────────────────────────────────────────────

  updateSettings(patch: Partial<GlobalSettings>): void {
    // Mutate fields in place. Replacing the whole object would invalidate
    // every $derived/$effect that reads any setting — even ones unrelated
    // to the changed property. Per-property writes scope reactivity to the
    // consumers that actually care.
    for (const key of Object.keys(patch) as Array<keyof GlobalSettings>) {
      const value = patch[key];
      if (value === undefined) continue;
      // Cast: TS can't prove key/value alignment across the union.
      (this.settings as unknown as Record<string, unknown>)[key] = value;
    }
    if (typeof localStorage !== "undefined") {
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
      } catch {
        // Storage full or denied; setting still works in memory.
      }
    }
  }

  /** Update a per-project setting (header/footer template, etc). Triggers
      the same autosave path as index/group changes — the persistence
      effect in editor/+page.svelte already reads `projectSettings`. */
  updateProjectSettings(patch: Partial<ProjectSettings>): void {
    // Same property-level mutation as updateSettings — and one level deeper
    // for the nested headerFooter / toc objects, so e.g. changing one TOC
    // row template doesn't invalidate header/footer consumers.
    if (patch.headerFooter) {
      for (const key of Object.keys(patch.headerFooter) as Array<
        keyof ProjectSettings["headerFooter"]
      >) {
        const value = patch.headerFooter[key];
        if (value === undefined) continue;
        (this.projectSettings.headerFooter as unknown as Record<string, unknown>)[key] = value;
      }
    }
    if (patch.toc) {
      for (const key of Object.keys(patch.toc) as Array<keyof ProjectSettings["toc"]>) {
        const value = patch.toc[key];
        if (value === undefined) continue;
        (this.projectSettings.toc as unknown as Record<string, unknown>)[key] = value;
      }
    }
  }

  // ── Helpers for child components ────────────────────────────────────────

  effectiveShowLineNumbers(entry: Extract<IndexEntry, { kind: "file" }>): boolean {
    return entry.showLineNumbers ?? this.settings.showLineNumbers;
  }
}

/**
 * structuredClone polyfill that handles our entry shape.
 * structuredClone() exists in modern browsers but mishandles class instances
 * (FileSystemFileHandle is fine to share by reference). Use a simple deep
 * clone of plain fields, preserving handle references.
 */
function structuredCloneCompat<T>(value: T): T {
  // Our IndexEntry is a plain object with primitive fields plus
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
    const id = await rememberProject(state.rootHandle, state.fileCount);
    if (id) state.projectId = id;
  } catch {
    // IndexedDB unavailable or quota exceeded; non-fatal.
  }
}

async function tryFindProjectId(handle: FileSystemDirectoryHandle): Promise<string | null> {
  try {
    const { findProjectIdForHandle } = await import("./recent");
    return await findProjectIdForHandle(handle);
  } catch {
    return null;
  }
}

async function tryRestoreProjectState(handle: FileSystemDirectoryHandle): Promise<{
  id: string;
  state: { index: IndexEntry[]; settings?: ProjectSettings };
} | null> {
  try {
    const { findProjectIdForHandle, loadProjectState } = await import("./recent");
    const id = await findProjectIdForHandle(handle);
    if (!id) return null;
    const state = await loadProjectState(id);
    if (!state) return null;
    return { id, state };
  } catch {
    return null;
  }
}

async function learnRejection(path: string, projectId: string | null): Promise<void> {
  if (!projectId) return;
  try {
    const { rejectPath } = await import("./behavior");
    await rejectPath(projectId, path);
  } catch {
    // non-fatal
  }
}

async function unlearnRejection(path: string, projectId: string | null): Promise<void> {
  if (!projectId) return;
  try {
    const { unrejectPath } = await import("./behavior");
    await unrejectPath(projectId, path);
  } catch {
    // non-fatal
  }
}

async function notifyRestored(restored: number, dropped: number): Promise<void> {
  try {
    const { toast } = await import("svelte-sonner");
    if (restored === 0) return;
    const desc =
      dropped > 0
        ? `${restored} files restored, ${dropped} no longer exist in the folder.`
        : undefined;
    toast.success(`Restored your previous plan`, {
      description: desc,
    });
  } catch {
    // svelte-sonner not loadable; skip silently.
  }
}

/** Debounced autosave of the current project's index/groups to IDB. */
let saveTimer: ReturnType<typeof setTimeout> | null = null;
let pendingSave = false;
export function scheduleAutosave(): void {
  if (saveTimer) clearTimeout(saveTimer);
  editor.isAutosaving = true;
  pendingSave = true;
  saveTimer = setTimeout(() => void runAutosave(), 600);
}

async function runAutosave(): Promise<void> {
  // If projectId hasn't been set yet (rememberAndPersist still in flight),
  // wait briefly for it. Don't lose the user's data on the first save.
  for (let i = 0; i < 30 && !editor.projectId; i++) {
    await new Promise((r) => setTimeout(r, 100));
  }
  if (!editor.projectId) {
    editor.isAutosaving = false;
    pendingSave = false;
    return;
  }
  try {
    const { saveProjectState } = await import("./recent");
    // $state.snapshot() returns a deep, plain-object copy of the reactive
    // proxy, which IndexedDB can structured-clone. Passing the raw proxy
    // can fail silently.
    await saveProjectState(editor.projectId, {
      index: $state.snapshot(editor.index),
      settings: $state.snapshot(editor.projectSettings),
    });
  } catch (err) {
    // Surface so the user knows their work didn't save instead of failing
    // silently. Lazy-import sonner to avoid a cycle.
    try {
      const { toast } = await import("svelte-sonner");
      toast.error("Could not save project state.", {
        description: err instanceof Error ? err.message : undefined,
      });
    } catch {
      // ignore
    }
  }
  pendingSave = false;
  editor.isAutosaving = false;
}

/** Force a save right now (e.g. on tab close). Returns when done. */
export async function flushAutosave(): Promise<void> {
  if (!pendingSave) return;
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }
  await runAutosave();
}
