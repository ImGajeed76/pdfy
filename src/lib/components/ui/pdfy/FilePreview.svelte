<script lang="ts">
	import { MARKDOWN_EXTENSIONS, type PDFYFileSystemEntry, RenderMode } from '$lib/types';
	import { htmlPreviewMode, markdownPreviewMode, xmlPreviewMode } from '$lib/stores';
	import * as Collapsible from '$lib/components/ui/collapsible/index.js';

	// Highlight.js core and languages
	import hljs from 'highlight.js/lib/core';
	import javascript from 'highlight.js/lib/languages/javascript';
	import typescript from 'highlight.js/lib/languages/typescript';
	import python from 'highlight.js/lib/languages/python';
	import java from 'highlight.js/lib/languages/java';
	import c from 'highlight.js/lib/languages/c';
	import cpp from 'highlight.js/lib/languages/cpp';
	import csharp from 'highlight.js/lib/languages/csharp';
	import rust from 'highlight.js/lib/languages/rust';
	import go from 'highlight.js/lib/languages/go';
	import php from 'highlight.js/lib/languages/php';
	import ruby from 'highlight.js/lib/languages/ruby';
	import swift from 'highlight.js/lib/languages/swift';
	import kotlin from 'highlight.js/lib/languages/kotlin';
	import scala from 'highlight.js/lib/languages/scala';
	import xml from 'highlight.js/lib/languages/xml'; // For HTML, XML
	import css from 'highlight.js/lib/languages/css';
	import json from 'highlight.js/lib/languages/json';
	import markdownLang from 'highlight.js/lib/languages/markdown';
	import shell from 'highlight.js/lib/languages/shell';
	import yaml from 'highlight.js/lib/languages/yaml';
	import dockerfile from 'highlight.js/lib/languages/dockerfile';
	import sql from 'highlight.js/lib/languages/sql';
	import 'highlight.js/styles/atom-one-dark.css';

	// Markdown renderer
	import MarkdownIt from 'markdown-it';
	import { determineFileDisplayProperties, readFileContent } from '$lib/fileSystem';
	import { onMount } from 'svelte';
	import { ChevronRight } from 'lucide-svelte';

	// Register Highlight.js languages
	hljs.registerLanguage('javascript', javascript);
	hljs.registerLanguage('typescript', typescript);
	hljs.registerLanguage('python', python);
	hljs.registerLanguage('java', java);
	hljs.registerLanguage('c', c);
	hljs.registerLanguage('cpp', cpp);
	hljs.registerLanguage('csharp', csharp);
	hljs.registerLanguage('rust', rust);
	hljs.registerLanguage('go', go);
	hljs.registerLanguage('php', php);
	hljs.registerLanguage('ruby', ruby);
	hljs.registerLanguage('swift', swift);
	hljs.registerLanguage('kotlin', kotlin);
	hljs.registerLanguage('scala', scala);
	hljs.registerLanguage('xml', xml);
	hljs.registerLanguage('css', css);
	hljs.registerLanguage('json', json);
	hljs.registerLanguage('markdown', markdownLang);
	hljs.registerLanguage('shell', shell);
	hljs.registerLanguage('yaml', yaml);
	hljs.registerLanguage('dockerfile', dockerfile);
	hljs.registerLanguage('sql', sql);

	const mdRenderer = new MarkdownIt();

	type PDFYFile = PDFYFileSystemEntry & { kind: 'file' };

	let { pdfyFile }: {
		pdfyFile: PDFYFile;
	} = $props<{
		pdfyFile: PDFYFile;
	}>();

	// Helper to escape HTML for displaying raw content safely
	function escapeHtml(unsafe: string): string {
		return unsafe
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#039;');
	}

	// Reactive derivations for file properties and render modes
	let extension: string | undefined = $derived(
		pdfyFile.name.split('.').pop()?.toLowerCase()
	);
	let isMd: boolean = $derived(
		extension !== undefined && MARKDOWN_EXTENSIONS.has(extension)
	);
	let isHtml: boolean = $derived(extension === 'html' || extension === 'htm');
	let isXml: boolean = $derived(extension === 'xml');
	let isSvg: boolean = $derived(extension === 'svg');

	let currentRenderModeStore = $derived(
		isMd
			? markdownPreviewMode
			: isHtml
				? htmlPreviewMode
				: isXml
					? xmlPreviewMode
					: null
	);
	let currentRenderMode: RenderMode = $derived(
		currentRenderModeStore ? ($currentRenderModeStore || RenderMode.Rendered) : RenderMode.Raw
	);

	// Processed content for display
	let finalHtmlOutput: string = $derived('');
	let needsPreCodeWrapper: boolean = $derived(false);
	let highlightLanguageClass: string = $derived('');

	onMount(async () => {
		if (!pdfyFile.content || !pdfyFile.language || !pdfyFile.fileType) {
			const loadingContent = await readFileContent(pdfyFile.handle);
			const loadingProperties = determineFileDisplayProperties(pdfyFile.name);

			pdfyFile.content = loadingContent;
			pdfyFile.language = loadingProperties.language;
			pdfyFile.fileType = loadingProperties.fileType;
		}

		let newNeedsPreCodeWrapper = false;
		let newHighlightLanguageClass = '';
		let newFinalHtmlOutput = '';

		const content = pdfyFile.content;
		const detectedLanguage = pdfyFile.language;

		if (pdfyFile.fileType === 'graphic') {
			newFinalHtmlOutput = `<img src="${content}" alt="${escapeHtml(
				pdfyFile.name
			)}" class="max-w-full h-auto mx-auto" />`;
		} else if (pdfyFile.fileType === 'binary') {
			newFinalHtmlOutput = `<p class="text-muted-foreground text-center p-4">Cannot preview binary file: ${escapeHtml(
				pdfyFile.name
			)}</p>`;
		} else if (pdfyFile.fileType === 'text') {
			newFinalHtmlOutput = prepareHtmlForLineNumbers(escapeHtml(content)); // MODIFIED
			newNeedsPreCodeWrapper = true;
			newHighlightLanguageClass = 'plaintext';
		} else if (pdfyFile.fileType === 'code' && currentRenderMode != RenderMode.Rendered) {
			let langToUse = detectedLanguage;
			let highlightedContent;
			try {
				if (hljs.getLanguage(langToUse)) {
					highlightedContent = hljs.highlight(content, {
						language: langToUse
					}).value;
				} else {
					const autoResult = hljs.highlightAuto(content);
					highlightedContent = autoResult.value;
					langToUse = autoResult.language || 'plaintext';
					if (autoResult.language && autoResult.language !== langToUse) {
						console.warn(
							`PDFy: Used auto-detected language '${autoResult.language}' for ${pdfyFile.name} (specified: '${langToUse}')`
						);
					}
				}
				newHighlightLanguageClass = `language-${langToUse}`;
			} catch (e) {
				console.warn(
					`PDFy: Highlighting failed for ${pdfyFile.name} (lang: ${langToUse}):`,
					e
				);
				highlightedContent = escapeHtml(content);
				newHighlightLanguageClass = 'plaintext';
			}
			newFinalHtmlOutput = prepareHtmlForLineNumbers(highlightedContent); // MODIFIED
			newNeedsPreCodeWrapper = true;
		} else if (pdfyFile.fileType === 'rendered' || currentRenderMode == RenderMode.Rendered) {
			if (isMd) {
				if (currentRenderMode === RenderMode.Rendered) {
					newFinalHtmlOutput = mdRenderer.render(content);
					// No line numbers for rendered markdown view
				} else {
					// Raw Markdown
					let rawMdContent;
					if (hljs.getLanguage('markdown')) {
						rawMdContent = hljs.highlight(content, {
							language: 'markdown'
						}).value;
						newHighlightLanguageClass = 'language-markdown';
					} else {
						rawMdContent = escapeHtml(content);
						newHighlightLanguageClass = 'plaintext';
					}
					newFinalHtmlOutput = prepareHtmlForLineNumbers(rawMdContent); // MODIFIED
					newNeedsPreCodeWrapper = true;
				}
			} else if (isHtml) {
				if (currentRenderMode === RenderMode.Rendered) {
					newFinalHtmlOutput = content; // Direct HTML
				} else {
					// Raw HTML
					let rawHtmlContent;
					if (hljs.getLanguage('xml')) {
						rawHtmlContent = hljs.highlight(content, { language: 'xml' })
							.value;
						newHighlightLanguageClass = 'language-xml';
					} else {
						rawHtmlContent = escapeHtml(content);
						newHighlightLanguageClass = 'plaintext';
					}
					newFinalHtmlOutput = prepareHtmlForLineNumbers(rawHtmlContent); // MODIFIED
					newNeedsPreCodeWrapper = true;
				}
			} else if (isXml) {
				if (currentRenderMode === RenderMode.Rendered) {
					// "Rendered" XML is syntax highlighted XML
					let highlightedXmlContent;
					if (hljs.getLanguage('xml')) {
						highlightedXmlContent = hljs.highlight(content, { language: 'xml' })
							.value;
						newHighlightLanguageClass = 'language-xml';
					} else {
						highlightedXmlContent = escapeHtml(content);
						newHighlightLanguageClass = 'plaintext';
					}
					newFinalHtmlOutput = prepareHtmlForLineNumbers(highlightedXmlContent); // MODIFIED
					newNeedsPreCodeWrapper = true;
				} else {
					// Raw XML (plain text)
					newFinalHtmlOutput = prepareHtmlForLineNumbers(escapeHtml(content)); // MODIFIED
					newNeedsPreCodeWrapper = true;
					newHighlightLanguageClass = 'plaintext';
				}
			} else if (isSvg && currentRenderMode === RenderMode.Rendered) {
				newFinalHtmlOutput = content; // Direct SVG
			} else {
				// Other 'rendered' types (e.g., raw SVG) or unhandled
				newFinalHtmlOutput = prepareHtmlForLineNumbers(escapeHtml(content)); // MODIFIED
				newNeedsPreCodeWrapper = true;
				newHighlightLanguageClass = 'plaintext';
			}
		} else {
			newFinalHtmlOutput = `<p class="text-muted-foreground text-center p-4">Unsupported file type for preview: ${escapeHtml(
				pdfyFile.name
			)}</p>`;
		}

		finalHtmlOutput = newFinalHtmlOutput;
		needsPreCodeWrapper = newNeedsPreCodeWrapper;
		highlightLanguageClass = newHighlightLanguageClass;
	});


	// Replace your existing prepareHtmlForLineNumbers with this one
	function prepareHtmlForLineNumbers(htmlContent: string): string {
		if (htmlContent === null || htmlContent === undefined) {
			return '';
		}

		const lines = htmlContent.split('\n');
		const output: string[] = [];
		// This stack will keep track of full opening tags like '<span class="hljs-comment">'
		const openHljsSpans: string[] = [];

		for (const lineSegment of lines) {
			let currentLineHtml = '<span class="code-line">';

			// 1. Reopen spans that were carried over from previous lines
			currentLineHtml += openHljsSpans.join('');

			let processedSegment = '';
			let remainingSegment = lineSegment;

			// 2. Process the current line segment for new or closing hljs spans
			//    Regex to find <span...> or </span> tags.
			//    This is still a simplification and assumes hljs spans are not pathologically complex.
			const tagRegex = /<\/?span[^>]*>/gi;
			let match;
			let lastIndex = 0;

			while ((match = tagRegex.exec(remainingSegment)) !== null) {
				// Append text before the current tag
				processedSegment += remainingSegment.substring(lastIndex, match.index);
				const tag = match[0];

				if (tag.toLowerCase().startsWith('</span')) {
					// It's a closing span tag
					if (openHljsSpans.length > 0) {
						openHljsSpans.pop(); // Assume it closes the last opened hljs span
					}
					processedSegment += tag;
				} else if (tag.toLowerCase().startsWith('<span')) {
					// It's an opening span tag. Assume it's an hljs span.
					openHljsSpans.push(tag); // Push the full opening tag
					processedSegment += tag;
				} else {
					// Should not happen with the regex, but as a fallback
					processedSegment += tag;
				}
				lastIndex = tagRegex.lastIndex;
			}
			// Append any remaining text after the last tag in the segment
			processedSegment += remainingSegment.substring(lastIndex);
			currentLineHtml += processedSegment;

			// 3. "Virtually" close any hljs spans that are still open at the end of this line.
			//    These will be reopened at the start of the next line.
			//    We add one closing </span> for each tag in openHljsSpans, in reverse order of opening.
			for (let i = 0; i < openHljsSpans.length; i++) {
				currentLineHtml += '</span>';
			}

			currentLineHtml += '</span>'; // Close the main code-line span
			output.push(currentLineHtml);
		}

		return output.join('\n'); // Using \n for easier debugging if you view raw source,
		// but display:block on .code-line handles rendering.
	}



	let isOpen = $state(true);
</script>

<div
	class="file-preview-item mb-0 p-0 py-1"
>
	<p class="hidden print:block mb-2 font-mono text-sm font-semibold">
		{pdfyFile.path}
	</p>

	<Collapsible.Root bind:open={isOpen} class="w-full">
		<div
			class="flex justify-between items-center mb-1 sticky top-0 bg-muted/20 backdrop-blur-sm py-2 px-3 z-10 print:hidden"
		>
			<Collapsible.Trigger class="flex items-center cursor-pointer">
				<h3
					class="font-mono text-xs font-semibold truncate flex-grow mr-2"
					title={pdfyFile.path}
				>
					{pdfyFile.path}
				</h3>
				<ChevronRight class="h-4 w-4 transition-transform duration-200 {isOpen
							? 'rotate-90'
							: ''}" />
			</Collapsible.Trigger>
		</div>

		<Collapsible.Content class="border print:border-0">
			<div class="preview-content-area text-sm">
				{#if needsPreCodeWrapper}
			<pre
				class="hljs p-3 m-0 rounded-none overflow-x-auto text-xs"
			><code class={highlightLanguageClass}>{@html finalHtmlOutput}</code></pre>
				{:else if pdfyFile.fileType === 'rendered' && isMd && currentRenderMode === RenderMode.Rendered}
					<div
						class="prose prose-sm dark:prose-invert max-w-none p-3 markdown-body"
					>
						{@html finalHtmlOutput}
					</div>
				{:else}
					<!-- For direct HTML/SVG output, graphic, or binary message -->
					<div class="p-1">{@html finalHtmlOutput}</div>
				{/if}
			</div>
		</Collapsible.Content>
	</Collapsible.Root>
</div>

<style>
    /* This style targets <pre class="hljs"> which is in your Svelte template.
       It might not strictly need :global() if .hljs is unique enough,
       but it's safer to be explicit if its children are globally styled. */
    :global(pre.hljs) {
        white-space: pre-wrap;   /* Allow lines to wrap */
        word-break: break-all;   /* Force break for long unbreakable strings */
				line-height: 0.9;
        /* background-color: transparent; is already in .hljs from highlight.js theme */
    }

    /* Target the <code> element *inside* the pre.hljs.
       This <code> element is part of the {@html ...} output from highlight.js
       and your prepareHtmlForLineNumbers function. */
    :global(pre.hljs code) {
        counter-reset: line; /* Initialize a CSS counter for line numbers */
        padding-left: 0;     /* Reset any existing padding, we'll manage it with .code-line */
        display: block;      /* Ensure <code> takes up block space for line children */
    }

    /* Style for each line of code that will get a number */
    :global(.code-line) {
        display: block;      /* Each line is a block */
        position: relative;  /* For positioning the ::before pseudo-element (line number) */
        padding-left: 3.5em; /* Create space for line numbers. Adjust as needed. */
        min-height: 1em;     /* Ensure empty lines also take up space for the line number */
    }

    /* The line number itself, created using a pseudo-element */
    :global(.code-line::before) {
        counter-increment: line; /* Increment the line counter */
        content: counter(line);  /* Display the current counter value */
        position: absolute;
        left: 0;
        top: 0; /* Adjust if needed for vertical alignment with text */
        width: 3em;             /* Width of the line number area */
        padding-right: 0.5em;   /* Space between number and code */
        text-align: right;
        /* Tailwind's text-gray-500 or similar could be used here too if preferred */
        color: #6b7280; /* A typical gray, adjust as desired. Was #888 */
        user-select: none;      /* Prevent selecting line numbers */
        font-family: monospace; /* Match code font */
        font-size: inherit;     /* Inherit font size from .code-line (which inherits from pre.text-xs) */
    }

    :global(pre.hljs code .code-line::after) {
        content: '';
        position: absolute;
        top: 0;
        bottom: 0;
        /*
							Calculates the left position:
							3.5em is the padding-left on .code-line for line numbers.
							100ch represents the width of 100 '0' characters in the current font.
					*/
        left: calc(3.5em + 103ch);
        width: 1px;
        background-color: rgba(
                128,
                128,
                128,
                0.35
        ); /* A subtle semi-transparent gray */
        pointer-events: none; /* Ensures the line doesn't interfere with mouse interactions like text selection */
        z-index: 0; /* Position it appropriately; adjust if needed based on other z-indexed elements */
    }

    /* Your existing .hljs style for background, if not handled by the theme import */
    .hljs {
        background-color: transparent; /* Or inherit from parent, theme CSS might override */
				font-size: 11px;
    }


    /* Markdown body styles are already correctly using :global() for elements within rendered markdown */
    .markdown-body :global(h1),
    .markdown-body :global(h2),
    .markdown-body :global(h3),
    .markdown-body :global(h4),
    .markdown-body :global(h5),
    .markdown-body :global(h6) {
        margin-top: 0.5em;
        margin-bottom: 0.25em;
    }

    .markdown-body :global(p) {
        margin-bottom: 0.5em;
    }

    .markdown-body :global(pre) {
        margin-bottom: 0.5em;
        font-size: 0.9em;
        white-space: pre-wrap;
        word-break: break-all;
    }

    .markdown-body :global(ul),
    .markdown-body :global(ol) {
        margin-bottom: 0.5em;
    }

    @media print {
        .file-preview-item {
            page-break-after: always;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
        }

        .file-preview-item .collapsible-content-wrapper[data-state='closed'] {
            display: block !important;
        }
        [data-radix-collapsible-content][data-state='closed'] {
            display: block !important;
        }

        .preview-content-area {
            border: none !important;
            padding: 0 !important;
        }

        /* Ensure line numbers are visible and padding is maintained for print, using :global */
        :global(pre.hljs code) {
            /* Counter reset should be fine */
        }
        :global(.code-line) {
            padding-left: 3.5em !important; /* Ensure padding for numbers */
        }
        :global(.code-line::before) {
            color: #000 !important; /* Ensure visibility for print */
        }
    }
</style>
