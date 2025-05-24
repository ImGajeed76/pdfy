export type PDFYFileSystemEntry = {
	id: string,
	name: string,
	kind: 'directory',
	path: string, // Relative path from the root directory
	handle: FileSystemDirectoryHandle,
	children: PDFYFileSystemEntry[], // For directories
} | {
	id: string,
	name: string,
	kind: 'file',
	path: string, // Relative path from the root directory
	handle: FileSystemFileHandle,
	selected: boolean,
	content: string | null,
	language: string | null, // Detected language for syntax highlighting
	fileType: PDFYFileType | null; // To help with rendering
}

export type PDFYFileType = 'code' | 'rendered' | 'text' | 'graphic' | 'binary'

export enum RenderMode {
	Rendered = 'rendered',
	Raw = 'raw',
}

export interface IgnoreRuleSet {
	rules: string[]; // Raw rule strings from one .gitignore file
	basePath: string; // The path of the directory containing this .gitignore, relative to scan root
}

export const CODE_EXTENSIONS: ReadonlySet<string> = new Set([
	"js",
	"ts",
	"jsx",
	"tsx",
	"json",
	"html",
	"htm",
	"css",
	"scss",
	"less",
	"xml",
	"yaml",
	"yml",
	"toml",
	"py",
	"rb",
	"php",
	"java",
	"c",
	"cpp",
	"h",
	"hpp",
	"cs",
	"rs",
	"go",
	"swift",
	"kt",
	"sh",
	"bash",
	"ps1",
	"bat",
	"cmd",
	"sql",
	"graphql",
	"gql",
	"svelte",
	"vue",
]);
export const MARKDOWN_EXTENSIONS: ReadonlySet<string> = new Set(["md", "markdown"]);
export const TEXT_EXTENSIONS: ReadonlySet<string> = new Set(["txt", "log", "csv", "tsv"]);
export const IMAGE_EXTENSIONS: ReadonlySet<string> = new Set([
	"png",
	"jpg",
	"jpeg",
	"gif",
	"bmp",
	"webp",
	"svg",
	"ico",
]);
export const PDF_EXTENSIONS: ReadonlySet<string> = new Set(["pdf"]);
export const GENERIC_BINARY_EXTENSIONS: ReadonlySet<string> = new Set([
	"zip",
	"tar",
	"gz",
	"rar",
	"7z",
	"exe",
	"dll",
	"bin",
	"o",
	"a",
	"so",
	"dylib",
	"app",
	"msi",
	"doc",
	"docx",
	"xls",
	"xlsx",
	"ppt",
	"pptx",
	"odt",
	"ods",
	"odp",
	"mp3",
	"wav",
	"ogg",
	"aac",
	"flac",
	"mp4",
	"avi",
	"mov",
	"wmv",
	"mkv",
	"webm",
	"iso",
	"img",
	"dmg",
	"wasm",
	"eot",
	"ttf",
	"woff",
	"woff2",
	"class",
	"jar",
]);

export type IntrinsicFileType =
	| "markdown"
	| "image"
	| "pdf"
	| "code"
	| "text"
	| "generic_binary";