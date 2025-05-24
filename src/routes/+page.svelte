<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { ArrowRight, Brackets, FileText, Lock, Rocket } from 'lucide-svelte';

	const features = [
		{
			icon: Lock,
			title: 'Local & Secure',
			description:
				'Process files entirely in your browser. Your code never leaves your machine.'
		},
		{
			icon: FileText,
			title: 'Text-Based & Searchable',
			description:
				'Generate PDFs with selectable text, perfect for documentation and review.'
		},
		{
			icon: Brackets,
			title: 'Syntax Highlighting',
			description:
				'Beautifully highlighted code for numerous languages, powered by highlight.js.'
		},
		{
			icon: Rocket,
			title: 'Simple & Fast',
			description:
				'Intuitive interface. Select your folder, pick files, and print – it’s that easy.'
		}
	];
</script>

<svelte:head>
	<title>PDFy: Clean, Searchable Code PDFs - Fast & Local</title>
	<meta
		name="description"
		content="Tired of image-based code PDFs? PDFy creates text-based, searchable PDFs with syntax highlighting, right in your browser. Secure, local, and easy to use."
	/>
	<meta
		name="keywords"
		content="pdfy, code to pdf, text-based pdf, searchable pdf, syntax highlighting, developer tool, sveltekit, local processing, print code, project documentation"
	/>
	<link rel="canonical" href="https://pdfy.oseifert.ch/" />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-slate-100 flex flex-col">
	<!-- Header -->
	<header class="py-4 px-4 sm:px-6 lg:px-8">
		<nav class="flex items-center justify-between">
			<a href="/" class="flex items-center gap-2 font-semibold text-xl">
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
						 stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
					<polyline points="14 2 14 8 20 8"></polyline>
					<line x1="16" y1="13" x2="8" y2="13"></line>
					<line x1="16" y1="17" x2="8" y2="17"></line>
					<line x1="10" y1="9" x2="8" y2="9"></line>
				</svg>
				<span>PDFy</span>
			</a>
			<Button href="/tool" variant="outline" size="sm" class="text-slate-100 border-slate-400 hover:bg-slate-700 hover:text-white">
				Go to App
				<ArrowRight class="ml-2 h-4 w-4" />
			</Button>
		</nav>
	</header>

	<!-- Hero Section -->
	<main class="flex-grow">
		<section class="py-16 sm:py-24 text-center px-4">
			<div class="max-w-3xl mx-auto">
				<h1 class="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight">
					<span class="block xl:inline">Stop Fighting</span>
					<span class="block text-sky-400 xl:inline">Image-Based Code PDFs.</span>
				</h1>
				<p class="mt-6 max-w-xl mx-auto text-lg sm:text-xl text-slate-300">
					PDFy transforms your project files into <strong class="text-sky-300">clean, searchable, text-based PDFs</strong>
					with syntax highlighting — all securely in your browser.
				</p>
				<div class="mt-10 flex justify-center gap-4">
					<Button href="/tool" size="lg" class="bg-sky-500 hover:bg-sky-600 text-white font-semibold">
						Launch PDFy Now
						<Rocket class="ml-2 h-5 w-5" />
					</Button>
					<Button
						href="https://github.com/ImGajeed76/pdfy"
						target="_blank"
						rel="noopener noreferrer"
						variant="outline"
						size="lg"
						class="text-slate-100 border-slate-400 hover:bg-slate-700 hover:text-white"
					>
						View on GitHub
					</Button>
				</div>
				<p class="mt-6 text-sm text-slate-400">
					Free, open-source, and respects your privacy.
				</p>
			</div>
		</section>

		<!-- Features Section -->
		<section class="py-16 sm:py-20 bg-slate-800/50">
			<div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
				<h2 class="text-3xl font-bold text-center mb-12 text-sky-400">
					Why You'll Love PDFy
				</h2>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
					{#each features as feature, _index (feature.title)}
						<div class="flex items-start space-x-4 p-6 bg-slate-700/40 rounded-xl shadow-lg hover:shadow-sky-500/20 transition-shadow duration-300">
							<div class="flex-shrink-0">
								<svelte:component
									this={feature.icon}
									class="h-8 w-8 text-sky-400"
								/>
							</div>
							<div>
								<h3 class="text-xl font-semibold text-slate-100">
									{feature.title}
								</h3>
								<p class="mt-1 text-slate-300">{feature.description}</p>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</section>

		<!-- Call to Action Bottom -->
		<section class="py-16 sm:py-24 text-center px-4">
			<div class="max-w-2xl mx-auto">
				<h2 class="text-3xl sm:text-4xl font-bold tracking-tight">
					Ready to Create Perfect Code PDFs?
				</h2>
				<p class="mt-4 text-lg text-slate-300">
					Give PDFy a try – it's quick, easy, and runs entirely on your
					machine.
				</p>
				<div class="mt-8">
					<Button href="/tool" size="lg" class="bg-sky-500 hover:bg-sky-600 text-white font-semibold">
						Go to the PDFy App
						<ArrowRight class="ml-2 h-5 w-5" />
					</Button>
				</div>
			</div>
		</section>
	</main>

	<!-- Footer -->
	<footer class="py-8 text-center border-t border-slate-700">
		<p class="text-slate-400">
			PDFy &copy; {new Date().getFullYear()}. Made to solve a frustrating problem.
		</p>
		<p class="text-sm text-slate-500 mt-1">
			Licensed under GNU GPL v3.0.
			<a
				href="https://github.com/ImGajeed76/pdfy"
				target="_blank"
				rel="noopener noreferrer"
				class="text-sky-400 hover:text-sky-300 underline"
			>
				View Source Code
			</a>
		</p>
	</footer>
</div>
