import {
	CODE_EXTENSIONS, GENERIC_BINARY_EXTENSIONS,
	type IgnoreRuleSet,
	IMAGE_EXTENSIONS, type IntrinsicFileType,
	MARKDOWN_EXTENSIONS,
	PDF_EXTENSIONS,
	type PDFYFileSystemEntry, type PDFYFileType, TEXT_EXTENSIONS
} from '$lib/types';
import NodeIgnore from 'ignore';

async function processDirectory(
	directoryHandle: FileSystemDirectoryHandle,
	currentPath: string = '', // Path of this directoryHandle, relative to the initial scan root
	// Chain of rule sets from .gitignore files in ancestor directories
	ancestorRuleSets: IgnoreRuleSet[] = [],
	// Names of ignore files to look for (e.g., ['.gitignore', '.myignore'])
	ignoreFileNames: string[] = ['.gitignore'],
	maxDepth: number = 5, // Maximum recursion depth
	// Hardcoded names of directories/files to always ignore by their direct name
	alwaysIgnoreNames: string[] = ['.git', 'node_modules', '.vscode', '.idea']
): Promise<PDFYFileSystemEntry[]> {
	if (maxDepth <= 0) {
		console.warn(`Max depth reached for directory: ${currentPath}`);
		return [];
	}

	// 1. Read rules from local ignore files in the current directory
	const localRulesRaw: string[] = [];
	for (const ignoreFileName of ignoreFileNames) {
		try {
			const ignoreFileHandle = await directoryHandle.getFileHandle(ignoreFileName);
			const file = await ignoreFileHandle.getFile();
			const content = await file.text();
			content.split('\n').forEach((line) => {
				const trimmedLine = line.trim();
				// Add if not empty and not a comment
				if (trimmedLine && !trimmedLine.startsWith('#')) {
					localRulesRaw.push(trimmedLine);
				}
			});
		} catch (_error) {
			// Ignore file not found, which is normal and expected
		}
	}

	// 2. Prepare the full list of rule sets for children directories
	// This includes rules from all ancestors plus the rules from the current directory
	const ruleSetsForChildren: IgnoreRuleSet[] = [...ancestorRuleSets];
	if (localRulesRaw.length > 0) {
		ruleSetsForChildren.push({
			rules: localRulesRaw,
			basePath: currentPath
		});
	}

	// 3. Create an `ignore` instance for checking entries at *this* current level.
	// This instance will be configured with rules from all relevant .gitignore files
	// (ancestors + current). All patterns are prefixed to be relative to the scan root
	// to work correctly with the `ignore` library's path matching.
	const igChecker = NodeIgnore();

	// Add rules from all ancestor .gitignore files, correctly prefixed
	for (const ruleSet of ancestorRuleSets) {
		const prefixedRules = ruleSet.rules.map((rule) => {
			let pattern = rule;
			let negate = '';
			if (pattern.startsWith('!')) {
				negate = '!';
				pattern = pattern.substring(1);
			}

			// If pattern starts with '/', it's anchored to its .gitignore's directory (basePath)
			if (pattern.startsWith('/')) {
				return negate + ruleSet.basePath + pattern; // e.g., basePath "src", pattern "/foo" -> "src/foo"
			} else {
				// Pattern is relative to its .gitignore's directory (basePath)
				// e.g., basePath "src", pattern "foo" -> "src/foo"
				// e.g., basePath "", pattern "foo" -> "foo"
				return negate + (ruleSet.basePath ? ruleSet.basePath + '/' : '') + pattern;
			}
		});
		igChecker.add(prefixedRules);
	}

	// Add rules from the current directory's .gitignore files, correctly prefixed
	const prefixedLocalRules = localRulesRaw.map((rule) => {
		let pattern = rule;
		let negate = '';
		if (pattern.startsWith('!')) {
			negate = '!';
			pattern = pattern.substring(1);
		}
		if (pattern.startsWith('/')) {
			return negate + currentPath + pattern;
		} else {
			return negate + (currentPath ? currentPath + '/' : '') + pattern;
		}
	});
	igChecker.add(prefixedLocalRules);

	const entries: PDFYFileSystemEntry[] = [];
	for await (const handle of directoryHandle.values()) {
		// First, check against the list of names to always ignore
		if (alwaysIgnoreNames.includes(handle.name)) {
			continue;
		}

		// Construct the full path of the entry relative to the scan root
		const entryPath = `${currentPath}${currentPath ? '/' : ''}${handle.name}`;
		const isDirectory = handle.kind === 'directory';

		// Prepare the path for checking with the `ignore` instance.
		// Directories should end with a slash for correct matching.
		let pathForChecking = entryPath;
		if (isDirectory) {
			// Ensure entryPath is not empty (root "" has no children named "")
			// and append slash if it's a directory and doesn't have one.
			if (pathForChecking && !pathForChecking.endsWith('/')) {
				pathForChecking += '/';
			} else if (!pathForChecking && handle.name) {
				// Case where currentPath is "" (root), entryPath is just handle.name
				pathForChecking = handle.name + '/';
			}
		}

		// Check if the entry is ignored by the aggregated rules
		if (igChecker.ignores(pathForChecking)) {
			continue; // Skip this ignored entry
		}

		// Entry is not ignored, process it
		if (handle.kind === 'file') {
			entries.push({
				id: entryPath,
				name: handle.name,
				kind: 'file',
				path: entryPath,
				handle,
				selected: false, // Assuming 'selected' is for UI state
				content: null, // Content will be loaded on demand
				language: null, // Language will be determined later
				fileType: null // File type will be determined later
			});
		} else if (handle.kind === 'directory') {
			entries.push({
				id: entryPath,
				name: handle.name,
				kind: 'directory',
				path: entryPath,
				handle,
				// Recursively process the subdirectory, passing the updated rule sets
				children: await processDirectory(
					handle,
					entryPath,
					ruleSetsForChildren, // These include current dir's rules for its children
					ignoreFileNames,
					maxDepth - 1,
					alwaysIgnoreNames
				)
			});
		}
	}

	// Sort entries: directories first, then files, all alphabetically
	return entries.sort((a, b) => {
		if (a.kind === 'directory' && b.kind === 'file') return -1;
		if (a.kind === 'file' && b.kind === 'directory') return 1;
		return a.name.localeCompare(b.name);
	});
}

export async function openDirectory(): Promise<{
	handle: FileSystemDirectoryHandle;
	tree: PDFYFileSystemEntry[];
} | null> {
	try {
		const handle = await window.showDirectoryPicker();
		if (handle) {
			const tree = await processDirectory(handle);
			return { handle, tree };
		}
	} catch (error) {
		if ((error as DOMException).name === 'AbortError') {
			console.log('User aborted directory selection.');
		} else {
			console.error('Error opening directory:', error);
		}
	}
	return null;
}

function getFileExtension(fileName: string): string {
	const lastDotIndex = fileName.lastIndexOf(".");
	// Ensure dot is not the first character (e.g., .gitignore)
	// and there is something after the dot.
	if (
		lastDotIndex === -1 ||
		lastDotIndex === 0 ||
		lastDotIndex === fileName.length - 1
	) {
		return "";
	}
	return fileName.substring(lastDotIndex + 1).toLowerCase();
}

function classifyFileType(
	fileName: string,
	mimeType?: string,
): IntrinsicFileType {
	const extension = getFileExtension(fileName);

	if (MARKDOWN_EXTENSIONS.has(extension)) return "markdown";
	if (IMAGE_EXTENSIONS.has(extension)) return "image";
	if (PDF_EXTENSIONS.has(extension)) return "pdf";
	if (CODE_EXTENSIONS.has(extension)) return "code";
	if (TEXT_EXTENSIONS.has(extension)) return "text";

	if (mimeType) {
		if (mimeType.startsWith("image/")) return "image";
		if (mimeType === "application/pdf") return "pdf";
		if (mimeType === "text/markdown") return "markdown";
		if (mimeType === "text/plain") return "text";
		if (
			mimeType.startsWith("text/") || // Catches text/html, text/css, text/javascript
			mimeType.includes("javascript") ||
			mimeType.includes("json") ||
			mimeType.includes("xml")
		) {
			return "code";
		}
		if (
			mimeType.startsWith("audio/") ||
			mimeType.startsWith("video/") ||
			mimeType === "application/octet-stream"
		) {
			return "generic_binary";
		}
	}

	if (GENERIC_BINARY_EXTENSIONS.has(extension)) return "generic_binary";

	// Default for unknown extensions not explicitly binary:
	// Consider it text, as it might be a less common code or data format.
	return "text";
}

export function determineFileDisplayProperties(
	fileName: string,
	fileMimeType?: string,
): { language: string; fileType: PDFYFileType } {
	const extension = getFileExtension(fileName);
	const intrinsicType = classifyFileType(fileName, fileMimeType);

	let language = extension || "unknown"; // Default language to extension

	switch (intrinsicType) {
		case "markdown":
			return { language: "markdown", fileType: "rendered" };
		case "image":
			return { language: extension, fileType: "graphic" };
		case "pdf":
			return { language: "pdf", fileType: "binary" };
		case "code":
			if (extension === "html" || extension === "htm") language = "html";
			else if (extension === "js" || extension === "jsx") language = "javascript";
			else if (extension === "ts" || extension === "tsx") language = "typescript";
			else if (extension === "css") language = "css";
			else if (extension === "json") language = "json";
			return { language, fileType: "code" };
		case "text":
			return { language: "plaintext", fileType: "text" };
		case "generic_binary":
			return { language: extension, fileType: "binary" };
		default:
			// Should be unreachable if classifyFileType is exhaustive
			return { language: "unknown", fileType: "binary" };
	}
}

export async function readFileContent(
	fileHandle: FileSystemFileHandle,
): Promise<string> {
	try {
		const file = await fileHandle.getFile();
		const intrinsicType = classifyFileType(file.name, file.type);

		if (
			intrinsicType === "code" ||
			intrinsicType === "text" ||
			intrinsicType === "markdown"
		) {
			return await file.text();
		} else if (
			intrinsicType === "image"
		) {
			return URL.createObjectURL(file);
		} else {
			return `(Preview not available for ${intrinsicType} file: ${file.name})`;
		}
	} catch (error) {
		console.error(`Error reading file ${fileHandle.name}:`, error);
		if (error instanceof DOMException) {
			return `(Error reading file: ${fileHandle.name} - ${error.message})`;
		}
		return `(Error reading file: ${fileHandle.name})`;
	}
}