/**
 * Behavior-learning Tier 4 smart defaults.
 *
 * The editor smart-adds files on folder open. If the user removes specific
 * files immediately after, we record them as "user-rejected" for that
 * project. On next open of the same project, we skip those files.
 *
 * Storage: per-project, in IndexedDB via the same idb-keyval store as
 * project state. Keyed off the project id.
 *
 * What we record:
 *   - The set of file paths (relative to root) that were rejected.
 *
 * What we DON'T do (yet):
 *   - Glob/extension generalization. We just remember exact paths. If the
 *     user adds the file back later, we should clear the rejection. (Done.)
 */

import { get, set, createStore } from "idb-keyval";

const REJECTIONS_STORE = createStore("pdfy", "rejections");

export interface ProjectRejections {
  /** Paths the user removed from the auto-selected plan. */
  paths: string[];
  /** Timestamp of last update. */
  updatedAt: number;
}

const EMPTY: ProjectRejections = { paths: [], updatedAt: 0 };

export async function loadRejections(projectId: string): Promise<ProjectRejections> {
  if (typeof indexedDB === "undefined" || !projectId) return EMPTY;
  const v = (await get(projectId, REJECTIONS_STORE)) as ProjectRejections | undefined;
  return v ?? EMPTY;
}

export async function saveRejections(projectId: string, next: ProjectRejections): Promise<void> {
  if (typeof indexedDB === "undefined" || !projectId) return;
  await set(projectId, next, REJECTIONS_STORE);
}

export async function rejectPath(projectId: string, path: string): Promise<void> {
  if (!projectId || !path) return;
  const cur = await loadRejections(projectId);
  if (cur.paths.includes(path)) return;
  await saveRejections(projectId, {
    paths: [...cur.paths, path],
    updatedAt: Date.now(),
  });
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
