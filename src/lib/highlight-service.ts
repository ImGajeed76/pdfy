// lib/components/file-preview/highlight-service.ts
import hljs from 'highlight.js/lib/core';

// Language imports
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
import xml from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/lib/languages/css';
import json from 'highlight.js/lib/languages/json';
import markdownLang from 'highlight.js/lib/languages/markdown';
import shell from 'highlight.js/lib/languages/shell';
import yaml from 'highlight.js/lib/languages/yaml';
import dockerfile from 'highlight.js/lib/languages/dockerfile';
import sql from 'highlight.js/lib/languages/sql';

// Theme import
import 'highlight.js/styles/atom-one-dark.css';

interface HighlightResult {
	highlightedContent: string;
	languageClass: string;
	warning?: string;
}

class HighlightService {
	private initialized = false;

	private initializeLanguages(): void {
		if (this.initialized) return;

		// Register all languages
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

		this.initialized = true;
	}

	private escapeHtml(unsafe: string): string {
		return unsafe
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#039;');
	}

	async highlightCode(content: string, language: string): Promise<HighlightResult> {
		this.initializeLanguages();

		try {
			if (hljs.getLanguage(language)) {
				const result = hljs.highlight(content, { language });
				return {
					highlightedContent: result.value,
					languageClass: `language-${language}`
				};
			} else {
				const autoResult = hljs.highlightAuto(content);
				const detectedLang = autoResult.language || 'plaintext';

				return {
					highlightedContent: autoResult.value,
					languageClass: `language-${detectedLang}`,
					warning: autoResult.language && autoResult.language !== language
						? `Used auto-detected language '${autoResult.language}' (specified: '${language}')`
						: undefined
				};
			}
		} catch (error) {
			console.warn(`Highlighting failed for language '${language}':`, error);
			return {
				highlightedContent: this.escapeHtml(content),
				languageClass: 'plaintext'
			};
		}
	}
}

export const highlightService = new HighlightService();
