/**
 * Shiki-based highlighter. Replaces highlight.js. Uses VS Code grammars and
 * themes for VS-Code-grade output. Async, lazy-loaded grammars.
 *
 * Output is per-line: each line gets a list of tokens with inline color
 * styles baked in. We render line numbers as a sibling element via CSS,
 * preserving the same UX hljs had but without theme CSS injection.
 */

import {
  createHighlighter,
  type Highlighter,
  type BundledLanguage,
  type BundledTheme,
} from "shiki";

let highlighterPromise: Promise<Highlighter> | null = null;

/**
 * The set of themes we'll preload. Two: light + dark.
 * The user picks one in settings; both are preloaded so the swap is instant.
 */
const PRELOAD_THEMES: BundledTheme[] = ["github-light", "github-dark"];

/**
 * Lazily-loaded language map. We start with NO grammars and load on demand.
 * Once a grammar is loaded into the highlighter it stays cached.
 */
const loadedLangs = new Set<string>();

/**
 * Maps file extensions to Shiki language ids.
 * Exhaustive enough for v1; extend freely.
 */
const EXT_TO_LANG: Record<string, BundledLanguage> = {
  // JS/TS family
  js: "javascript",
  cjs: "javascript",
  mjs: "javascript",
  jsx: "jsx",
  ts: "typescript",
  tsx: "tsx",
  // Python
  py: "python",
  pyw: "python",
  pyi: "python",
  // Web
  html: "html",
  htm: "html",
  css: "css",
  scss: "scss",
  sass: "sass",
  less: "less",
  // Config
  json: "json",
  jsonc: "jsonc",
  json5: "json5",
  yaml: "yaml",
  yml: "yaml",
  toml: "toml",
  ini: "ini",
  conf: "ini",
  properties: "properties",
  env: "shellscript",
  // Shells
  sh: "shellscript",
  bash: "bash",
  zsh: "shellscript",
  fish: "fish",
  ps1: "powershell",
  bat: "bat",
  cmd: "bat",
  // Backend langs
  rb: "ruby",
  rs: "rust",
  go: "go",
  java: "java",
  kt: "kotlin",
  scala: "scala",
  c: "c",
  cpp: "cpp",
  cc: "cpp",
  cxx: "cpp",
  h: "c",
  hpp: "cpp",
  cs: "csharp",
  swift: "swift",
  php: "php",
  lua: "lua",
  pl: "perl",
  r: "r",
  dart: "dart",
  ex: "elixir",
  exs: "elixir",
  clj: "clojure",
  cljs: "clojure",
  hs: "haskell",
  zig: "zig",
  v: "v",
  nim: "nim",
  // SQL & data
  sql: "sql",
  graphql: "graphql",
  gql: "graphql",
  // DSL
  dockerfile: "docker",
  makefile: "make",
  cmake: "cmake",
  proto: "proto",
  // Frontend frameworks
  svelte: "svelte",
  vue: "vue",
  // Markup
  md: "markdown",
  markdown: "markdown",
  mdx: "mdx",
  xml: "xml",
  svg: "xml",
  // Misc
  diff: "diff",
  patch: "diff",
  log: "log",
};

/**
 * Resolve an extension to a Shiki bundled language id, or "txt" for
 * unsupported extensions (rendered as plain text via the fallback path).
 */
export function shikiLangForExtension(ext: string | undefined): string {
  if (!ext) return "txt";
  const lower = ext.toLowerCase();
  return EXT_TO_LANG[lower] ?? "txt";
}

async function getHighlighter(): Promise<Highlighter> {
  if (highlighterPromise) return highlighterPromise;
  highlighterPromise = createHighlighter({
    themes: PRELOAD_THEMES,
    langs: [], // load on demand
  });
  return highlighterPromise;
}

async function ensureLanguageLoaded(highlighter: Highlighter, lang: string): Promise<void> {
  if (lang === "txt" || lang === "log") return; // shipped by default in shiki for plain text
  if (loadedLangs.has(lang)) return;
  if (highlighter.getLoadedLanguages().includes(lang)) {
    loadedLangs.add(lang);
    return;
  }
  try {
    await highlighter.loadLanguage(lang as BundledLanguage);
    loadedLangs.add(lang);
  } catch {
    // Unknown grammar — fall back to plaintext silently.
  }
}

export interface ShikiLine {
  number: number;
  /** Inline-styled HTML for this line. May contain spans with style="color: #xxx". */
  html: string;
}

/**
 * Highlight code and split into per-line objects with inline styles.
 * Returns plain-text fallback if highlighting fails.
 */
export async function highlightWithShiki(
  code: string,
  language: string,
  theme: BundledTheme,
): Promise<ShikiLine[]> {
  const highlighter = await getHighlighter();
  await ensureLanguageLoaded(highlighter, language);

  const usableLang = highlighter.getLoadedLanguages().includes(language) ? language : "txt";

  let html: string;
  try {
    html = highlighter.codeToHtml(code, {
      lang: usableLang as BundledLanguage,
      theme,
      // Drop the outer <pre><code> wrapper — we control that ourselves.
      transformers: [
        {
          pre(node) {
            this.addClassToHast(node, "shiki-pre");
            // Strip background — we apply our own.
            if (node.properties && typeof node.properties.style === "string") {
              node.properties.style = node.properties.style.replace(
                /background-color:[^;]+;?/i,
                "",
              );
            }
          },
        },
      ],
    });
  } catch {
    html = `<pre><code>${escapeHtml(code)}</code></pre>`;
  }

  // Parse the per-line spans from the HTML. Shiki emits <span class="line">
  // for each line. We extract the inner HTML of each.
  const lines: ShikiLine[] = [];
  // RegExp is more reliable than DOM here for SSR friendliness; the structure
  // is well-defined.
  const lineRe = /<span class="line">([\s\S]*?)<\/span>(?:\n|<\/code>)/g;
  let match: RegExpExecArray | null;
  let i = 1;
  while ((match = lineRe.exec(html)) !== null) {
    lines.push({ number: i++, html: match[1] });
  }
  if (lines.length === 0) {
    // Fallback: plain text per line.
    const plain = code.split("\n");
    for (let j = 0; j < plain.length; j++) {
      lines.push({ number: j + 1, html: escapeHtml(plain[j]) });
    }
  }
  return lines;
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
