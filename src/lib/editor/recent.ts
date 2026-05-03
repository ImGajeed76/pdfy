import { openDB, type IDBPDatabase, type DBSchema } from "idb";
import { editor } from "./state.svelte";
import type { IndexEntry, ProjectSettings } from "./types";

/**
 * Persistent IDB-backed storage for:
 *   - recent projects list
 *   - directory handles (FileSystemDirectoryHandle)
 *   - per-project saved state (index + settings)
 *   - per-project behavior-learning rejections
 *
 * Uses `idb` with a proper schema + version. Earlier versions of this file
 * used `idb-keyval`'s createStore, which silently fails when adding new
 * object stores to an existing DB. `openDB` with an upgrade callback
 * handles all stores cleanly and is properly typed.
 *
 * Schema lives in this single file and is version-bumped when stores
 * change. v1: initial schema with all four stores.
 */

const DB_NAME = "pdfy";
const DB_VERSION = 1;

interface RecentMeta {
  id: string;
  name: string;
  lastOpenedAt: number;
  entryCount: number;
}

export interface ProjectState {
  index: IndexEntry[];
  /** Per-project settings (header/footer templates, etc). Optional for
      back-compat with projects saved before this field existed. */
  settings?: ProjectSettings;
}

export interface ProjectRejections {
  paths: string[];
  updatedAt: number;
}

interface PdfyDB extends DBSchema {
  meta: {
    key: "list";
    value: RecentMeta[];
  };
  handles: {
    key: string; // project id
    value: FileSystemDirectoryHandle;
  };
  states: {
    key: string; // project id
    value: ProjectState;
  };
  rejections: {
    key: string; // project id
    value: ProjectRejections;
  };
}

const MAX_RECENTS = 10;

let dbPromise: Promise<IDBPDatabase<PdfyDB>> | null = null;

function getDB(): Promise<IDBPDatabase<PdfyDB>> {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("IndexedDB not available"));
  }
  if (dbPromise) return dbPromise;

  // Best-effort: if a broken older "pdfy" DB exists from an earlier
  // implementation, this open call will either pick it up (and the
  // upgrade callback will add any missing stores) or create fresh.
  dbPromise = openDB<PdfyDB>(DB_NAME, DB_VERSION, {
    upgrade(db, _oldVersion, _newVersion, _tx) {
      // Create any missing stores. This handles both fresh installs and
      // upgrades from a broken older schema.
      if (!db.objectStoreNames.contains("meta")) db.createObjectStore("meta");
      if (!db.objectStoreNames.contains("handles")) db.createObjectStore("handles");
      if (!db.objectStoreNames.contains("states")) db.createObjectStore("states");
      if (!db.objectStoreNames.contains("rejections")) db.createObjectStore("rejections");
    },
  }).catch(async (err) => {
    // If the existing DB is at a higher version or has incompatible stores,
    // delete and recreate. This handles users coming from a broken v0.
    try {
      await new Promise<void>((resolve, reject) => {
        const req = indexedDB.deleteDatabase(DB_NAME);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
        req.onblocked = () => resolve();
      });
      return openDB<PdfyDB>(DB_NAME, DB_VERSION, {
        upgrade(db) {
          db.createObjectStore("meta");
          db.createObjectStore("handles");
          db.createObjectStore("states");
          db.createObjectStore("rejections");
        },
      });
    } catch {
      throw err;
    }
  });
  return dbPromise;
}

/** Self-heal: if the existing DB is missing a needed store (because it was
 *  created at an older version of this app with fewer stores), wipe and
 *  reopen. Called proactively on first read. */
async function ensureSchema(): Promise<void> {
  if (typeof indexedDB === "undefined") return;
  const db = await getDB().catch(() => null);
  if (!db) return;
  const required: Array<"meta" | "handles" | "states" | "rejections"> = [
    "meta",
    "handles",
    "states",
    "rejections",
  ];
  const missing = required.filter((s) => !db.objectStoreNames.contains(s));
  if (missing.length === 0) return;
  // Bump the version to force an upgrade that adds the missing stores.
  db.close();
  dbPromise = openDB<PdfyDB>(DB_NAME, db.version + 1, {
    upgrade(d) {
      for (const s of required) {
        if (!d.objectStoreNames.contains(s)) {
          d.createObjectStore(s);
        }
      }
    },
  });
  await dbPromise;
}

function generateId(): string {
  return `p_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
}

async function loadList(): Promise<RecentMeta[]> {
  if (typeof indexedDB === "undefined") return [];
  await ensureSchema();
  const db = await getDB();
  const v = (await db.get("meta", "list")) as RecentMeta[] | undefined;
  return Array.isArray(v) ? v : [];
}

async function saveList(list: RecentMeta[]): Promise<void> {
  const db = await getDB();
  await db.put("meta", list, "list");
}

export async function recentProjects(): Promise<RecentMeta[]> {
  const list = await loadList();
  return [...list].sort((a, b) => b.lastOpenedAt - a.lastOpenedAt);
}

export async function rememberProject(
  handle: FileSystemDirectoryHandle,
  entryCount: number,
): Promise<string> {
  if (typeof indexedDB === "undefined") return "";
  await ensureSchema();
  const db = await getDB();
  const list = await loadList();

  // Match an existing entry by isSameEntry — same folder = same id.
  let id: string | null = null;
  for (const meta of list) {
    const existing = await db.get("handles", meta.id);
    if (existing && (await existing.isSameEntry(handle))) {
      id = meta.id;
      break;
    }
  }

  if (!id) id = generateId();

  await db.put("handles", handle, id);

  const meta: RecentMeta = {
    id,
    name: handle.name,
    lastOpenedAt: Date.now(),
    entryCount,
  };

  const next = [meta, ...list.filter((m) => m.id !== id)].slice(0, MAX_RECENTS);
  await saveList(next);

  // Evict orphan handles + states + rejections.
  const keepIds = new Set(next.map((m) => m.id));
  for (const storeName of ["handles", "states", "rejections"] as const) {
    const allKeys = (await db.getAllKeys(storeName)) as string[];
    for (const k of allKeys) {
      if (!keepIds.has(k)) await db.delete(storeName, k);
    }
  }

  return id;
}

export async function removeRecentProject(id: string): Promise<void> {
  if (typeof indexedDB === "undefined") return;
  const db = await getDB();
  const list = await loadList();
  await saveList(list.filter((m) => m.id !== id));
  await db.delete("handles", id);
  await db.delete("states", id);
  await db.delete("rejections", id);
}

export async function saveProjectState(id: string, state: ProjectState): Promise<void> {
  if (typeof indexedDB === "undefined" || !id) return;
  const db = await getDB();
  await db.put("states", state, id);
}

export async function loadProjectState(id: string): Promise<ProjectState | null> {
  if (typeof indexedDB === "undefined" || !id) return null;
  const db = await getDB();
  const v = (await db.get("states", id)) as ProjectState | undefined;
  return v ?? null;
}

export async function findProjectIdForHandle(
  handle: FileSystemDirectoryHandle,
): Promise<string | null> {
  if (typeof indexedDB === "undefined") return null;
  const db = await getDB();
  const list = await loadList();
  for (const meta of list) {
    const stored = await db.get("handles", meta.id);
    if (stored && (await stored.isSameEntry(handle))) return meta.id;
  }
  return null;
}

export async function openRecentProject(id: string): Promise<{ ok: boolean; reason?: string }> {
  if (typeof indexedDB === "undefined") return { ok: false, reason: "no-idb" };
  const db = await getDB();
  const handle = await db.get("handles", id);
  if (!handle) return { ok: false, reason: "not-found" };

  const perm = await handle.queryPermission({ mode: "read" });
  if (perm !== "granted") {
    const reqPerm = await handle.requestPermission({ mode: "read" });
    if (reqPerm !== "granted") return { ok: false, reason: "permission-denied" };
  }

  await editor.loadFromHandle(handle);
  return { ok: true };
}

export async function loadRejections(projectId: string): Promise<ProjectRejections> {
  if (typeof indexedDB === "undefined" || !projectId) return { paths: [], updatedAt: 0 };
  const db = await getDB();
  const v = (await db.get("rejections", projectId)) as ProjectRejections | undefined;
  return v ?? { paths: [], updatedAt: 0 };
}

export async function saveRejections(projectId: string, next: ProjectRejections): Promise<void> {
  if (typeof indexedDB === "undefined" || !projectId) return;
  const db = await getDB();
  await db.put("rejections", next, projectId);
}

export async function rejectPath(projectId: string, path: string): Promise<void> {
  if (!projectId || !path) return;
  const cur = await loadRejections(projectId);
  if (cur.paths.includes(path)) return;
  await saveRejections(projectId, { paths: [...cur.paths, path], updatedAt: Date.now() });
}

export async function unrejectPath(projectId: string, path: string): Promise<void> {
  if (!projectId || !path) return;
  const cur = await loadRejections(projectId);
  if (!cur.paths.includes(path)) return;
  await saveRejections(projectId, {
    paths: cur.paths.filter((p) => p !== path),
    updatedAt: Date.now(),
  });
}
