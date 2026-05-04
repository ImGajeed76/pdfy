/**
 * Thin wrapper around Plausible's tagged-events API. The script is loaded from
 * app.html and exposes `window.plausible`. This helper narrows the types and
 * silently no-ops when the script isn't available (e.g. an ad-blocker dropped
 * it, or we're running during SSR / prerender).
 */

type PlausibleProps = Record<string, string | number | boolean>;

declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: PlausibleProps }) => void;
  }
}

export function track(event: string, props?: PlausibleProps): void {
  if (typeof window === "undefined") return;
  window.plausible?.(event, props ? { props } : undefined);
}

/** Bucket a file count into a coarse band so the analytics dashboard stays
    readable and individual sessions can't be reidentified by a precise file
    total. Used for the Print event's `files` prop. */
export function bucketFileCount(n: number): string {
  if (n <= 5) return "1-5";
  if (n <= 25) return "6-25";
  if (n <= 100) return "26-100";
  return "100+";
}
