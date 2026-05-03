import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import python from "highlight.js/lib/languages/python";
import java from "highlight.js/lib/languages/java";
import c from "highlight.js/lib/languages/c";
import cpp from "highlight.js/lib/languages/cpp";
import csharp from "highlight.js/lib/languages/csharp";
import rust from "highlight.js/lib/languages/rust";
import go from "highlight.js/lib/languages/go";
import php from "highlight.js/lib/languages/php";
import ruby from "highlight.js/lib/languages/ruby";
import swift from "highlight.js/lib/languages/swift";
import kotlin from "highlight.js/lib/languages/kotlin";
import scala from "highlight.js/lib/languages/scala";
import xml from "highlight.js/lib/languages/xml";
import css from "highlight.js/lib/languages/css";
import scss from "highlight.js/lib/languages/scss";
import less from "highlight.js/lib/languages/less";
import json from "highlight.js/lib/languages/json";
import markdownLang from "highlight.js/lib/languages/markdown";
import shell from "highlight.js/lib/languages/shell";
import bash from "highlight.js/lib/languages/bash";
import yaml from "highlight.js/lib/languages/yaml";
import dockerfile from "highlight.js/lib/languages/dockerfile";
import sql from "highlight.js/lib/languages/sql";
import graphql from "highlight.js/lib/languages/graphql";
import lua from "highlight.js/lib/languages/lua";
import perl from "highlight.js/lib/languages/perl";
import r from "highlight.js/lib/languages/r";
import dart from "highlight.js/lib/languages/dart";
import diff from "highlight.js/lib/languages/diff";
import ini from "highlight.js/lib/languages/ini";
import makefile from "highlight.js/lib/languages/makefile";
import nginx from "highlight.js/lib/languages/nginx";
import plaintext from "highlight.js/lib/languages/plaintext";

const registered = new Set<string>();

function registerOnce(name: string, lang: unknown): void {
  if (registered.has(name)) return;
  // hljs's registerLanguage takes a function returning a Language object.
  // Our imports already match that shape.
  hljs.registerLanguage(name, lang as Parameters<typeof hljs.registerLanguage>[1]);
  registered.add(name);
}

registerOnce("javascript", javascript);
registerOnce("typescript", typescript);
registerOnce("python", python);
registerOnce("java", java);
registerOnce("c", c);
registerOnce("cpp", cpp);
registerOnce("csharp", csharp);
registerOnce("rust", rust);
registerOnce("go", go);
registerOnce("php", php);
registerOnce("ruby", ruby);
registerOnce("swift", swift);
registerOnce("kotlin", kotlin);
registerOnce("scala", scala);
registerOnce("xml", xml);
registerOnce("css", css);
registerOnce("scss", scss);
registerOnce("less", less);
registerOnce("json", json);
registerOnce("markdown", markdownLang);
registerOnce("shell", shell);
registerOnce("bash", bash);
registerOnce("yaml", yaml);
registerOnce("dockerfile", dockerfile);
registerOnce("sql", sql);
registerOnce("graphql", graphql);
registerOnce("lua", lua);
registerOnce("perl", perl);
registerOnce("r", r);
registerOnce("dart", dart);
registerOnce("diff", diff);
registerOnce("ini", ini);
registerOnce("makefile", makefile);
registerOnce("nginx", nginx);
registerOnce("plaintext", plaintext);

const ALIAS_MAP: Record<string, string> = {
  js: "javascript",
  mjs: "javascript",
  cjs: "javascript",
  jsx: "javascript",
  ts: "typescript",
  tsx: "typescript",
  py: "python",
  rb: "ruby",
  rs: "rust",
  kt: "kotlin",
  cs: "csharp",
  sh: "bash",
  zsh: "bash",
  yml: "yaml",
  htm: "xml",
  html: "xml",
  svg: "xml",
  conf: "ini",
  toml: "ini",
  properties: "ini",
  env: "bash",
  gitignore: "bash",
  dockerignore: "bash",
};

export function languageForExtension(ext: string | undefined): string {
  if (!ext) return "plaintext";
  const lower = ext.toLowerCase();
  const aliased = ALIAS_MAP[lower] ?? lower;
  return hljs.getLanguage(aliased) ? aliased : "plaintext";
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export interface HighlightedLine {
  /** 1-based line number for display */
  number: number;
  /** Inner HTML for the line. Already escaped/highlighted. May be empty. */
  html: string;
}

/**
 * Highlight code and split into per-line objects, preserving hljs spans
 * across line breaks (re-opening on the next line).
 */
export function highlightToLines(content: string, language: string): HighlightedLine[] {
  let highlightedHtml: string;
  try {
    if (hljs.getLanguage(language)) {
      highlightedHtml = hljs.highlight(content, { language }).value;
    } else {
      highlightedHtml = escapeHtml(content);
    }
  } catch {
    highlightedHtml = escapeHtml(content);
  }
  return splitHljsByLines(highlightedHtml);
}

function splitHljsByLines(html: string): HighlightedLine[] {
  const lines = html.split("\n");
  const out: HighlightedLine[] = [];
  const openSpans: string[] = [];
  let n = 1;

  const tagRegex = /<\/?span[^>]*>/gi;

  for (const segment of lines) {
    let lineHtml = openSpans.join("");
    let cursor = 0;
    let match: RegExpExecArray | null;
    tagRegex.lastIndex = 0;
    while ((match = tagRegex.exec(segment)) !== null) {
      lineHtml += segment.slice(cursor, match.index);
      const tag = match[0];
      if (tag.toLowerCase().startsWith("</span")) {
        if (openSpans.length > 0) openSpans.pop();
        lineHtml += tag;
      } else {
        openSpans.push(tag);
        lineHtml += tag;
      }
      cursor = tagRegex.lastIndex;
    }
    lineHtml += segment.slice(cursor);
    // Virtually close still-open spans at end of line.
    for (let i = 0; i < openSpans.length; i++) lineHtml += "</span>";
    out.push({ number: n++, html: lineHtml });
  }
  return out;
}
