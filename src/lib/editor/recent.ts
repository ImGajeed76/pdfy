import { get, set, del, keys, createStore } from "idb-keyval";
import { editor } from "./state.svelte";

/**
 * Recent projects: store FileSystemDirectoryHandle plus minimal metadata
 * so the user can quickly resume.
 *
 * Handles are *only* serializable into IndexedDB (not localStorage). They
 * survive sessions but require permission re-grant on re-open.
 */

const RECENTS_KEY = "pdfy:recents:list";
const HANDLES_STORE = createStore("pdfy", "handles");
const META_STORE = createStore("pdfy", "meta");

const MAX_RECENTS = 10;

function generateId(): string {
  return `p_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
}

interface RecentMeta {
  id: string;
  name: string;
  lastOpenedAt: number;
  entryCount: number;
}

async function loadList(): Promise<RecentMeta[]> {
  const raw = (await get(RECENTS_KEY, META_STORE)) as RecentMeta[] | undefined;
  return Array.isArray(raw) ? raw : [];
}

async function saveList(list: RecentMeta[]): Promise<void> {
  await set(RECENTS_KEY, list, META_STORE);
}

export async function recentProjects(): Promise<RecentMeta[]> {
  if (typeof indexedDB === "undefined") return [];
  const list = await loadList();
  return [...list].sort((a, b) => b.lastOpenedAt - a.lastOpenedAt);
}

export async function rememberProject(
  handle: FileSystemDirectoryHandle,
  entryCount: number,
): Promise<string> {
  if (typeof indexedDB === "undefined") return "";
  const list = await loadList();

  // Try to match an existing entry by isSameEntry (same handle = same folder).
  let id: string | null = null;
  for (const meta of list) {
    const existing = (await get(meta.id, HANDLES_STORE)) as FileSystemDirectoryHandle | undefined;
    if (existing && (await existing.isSameEntry(handle))) {
      id = meta.id;
      break;
    }
  }

  if (!id) id = generateId();

  await set(id, handle, HANDLES_STORE);

  const meta: RecentMeta = {
    id,
    name: handle.name,
    lastOpenedAt: Date.now(),
    entryCount,
  };

  const next = [meta, ...list.filter((m) => m.id !== id)].slice(0, MAX_RECENTS);
  await saveList(next);

  // Drop handles for evicted projects.
  const keepIds = new Set(next.map((m) => m.id));
  const allHandleKeys = (await keys(HANDLES_STORE)) as string[];
  for (const k of allHandleKeys) {
    if (!keepIds.has(k)) await del(k, HANDLES_STORE);
  }

  return id;
}

export async function removeRecentProject(id: string): Promise<void> {
  if (typeof indexedDB === "undefined") return;
  const list = await loadList();
  await saveList(list.filter((m) => m.id !== id));
  await del(id, HANDLES_STORE);
}

export async function openRecentProject(id: string): Promise<{ ok: boolean; reason?: string }> {
  if (typeof indexedDB === "undefined") return { ok: false, reason: "no-idb" };
  const handle = (await get(id, HANDLES_STORE)) as FileSystemDirectoryHandle | undefined;
  if (!handle) return { ok: false, reason: "not-found" };

  // Re-request permission. queryPermission may return "granted" without a prompt.
  const perm = await handle.queryPermission({ mode: "read" });
  if (perm !== "granted") {
    const reqPerm = await handle.requestPermission({ mode: "read" });
    if (reqPerm !== "granted") return { ok: false, reason: "permission-denied" };
  }

  // Walk the tree using the existing fileSystem helpers — but we need a tree,
  // not a fresh openDirectory call (which prompts). So inline the load.
  await editor.loadFromHandle(handle);

  return { ok: true };
}
