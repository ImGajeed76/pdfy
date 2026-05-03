/**
 * Behavior-learning Tier 4 smart defaults.
 *
 * The editor smart-adds files on folder open. If the user removes specific
 * files immediately after, we record them as "user-rejected" for that
 * project. On next open of the same project, we skip those files.
 *
 * Storage lives in the same IDB store as recents (see recent.ts) under a
 * `rejections:{projectId}` key.
 */

export {
  loadRejections,
  saveRejections,
  rejectPath,
  unrejectPath,
  type ProjectRejections,
} from "./recent";
