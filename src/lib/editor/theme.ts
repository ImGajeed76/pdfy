/**
 * Dynamically load the highlight.js theme CSS based on the user's setting.
 * Vite's `?inline` import gives us the CSS as a string, which we inject as
 * a single <style id="hljs-theme"> element. Swap on demand.
 */
import lightCss from "highlight.js/styles/github.css?inline";
import darkCss from "highlight.js/styles/github-dark.css?inline";

import type { CodeTheme } from "./types";

const STYLE_ID = "pdfy-hljs-theme";

let lastApplied: CodeTheme | null = null;

export function applyCodeTheme(theme: CodeTheme): void {
  if (typeof document === "undefined") return;
  if (lastApplied === theme) return;
  let el = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (!el) {
    el = document.createElement("style");
    el.id = STYLE_ID;
    document.head.appendChild(el);
  }
  el.textContent = theme === "github-dark" ? darkCss : lightCss;
  lastApplied = theme;
}
