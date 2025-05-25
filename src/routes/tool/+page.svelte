<script lang="ts">

	import { toast } from 'svelte-sonner';
	import { openDirectory } from '$lib/fileSystem';
	import * as Resizable from '$lib/components/ui/resizable/index.js';
	import { Button } from '$lib/components/ui/button';
	import { fileTree, isLoadingDirectory, rootDirectoryHandle, selectedFilesForPrint } from '$lib/stores';
	import FileExplorer from '$lib/components/ui/pdfy/FileExplorer.svelte';
	import FilePreview from '$lib/components/ui/pdfy/FilePreview.svelte';
	import { ScrollArea } from '$lib/components/ui/scroll-area';

	let fsApiSupported = $state(true); // Assuming the API is supported

	$effect(() => {
		if (!window.showDirectoryPicker) {
			fsApiSupported = false;
			toast.error(
				'Your browser does not support the File System Access API. Please use a compatible browser like Chrome or Edge.'
			);
		}
	});

	async function handleLoadFolder() {
		isLoadingDirectory.set(true);
		selectedFilesForPrint.set([]); // Clear selected files for print
		fileTree.set(null);

		const result = await openDirectory();
		if (result) {
			rootDirectoryHandle.set(result.handle);
			fileTree.set(result.tree);
			toast.success('Directory loaded successfully!');
		} else {
			toast.error(
				'Failed to load directory. Please ensure you have selected a valid folder.'
			);
		}

		isLoadingDirectory.set(false);
	}

	function handlePrint() {
		if ($selectedFilesForPrint.length === 0) {
			toast.info('Please select some files to print.');
			return;
		}
		window.print();
	}

	let title = $derived($rootDirectoryHandle ? `${$rootDirectoryHandle.name}.pdf` : 'PDFy Project');
</script>

<svelte:head>
	<title>{title}</title>
	<style global>
      @media print {
          @page {
              size: A4;

              @bottom-right {
                  content: counter(page) ' / ' counter(pages);
                  font-size: 9pt;
                  font-family: Arial, sans-serif;
                  color: #555555;
              }
          }

          body,
          html {
              background-color: white !important;
              color: black !important;
              font-family: 'Times New Roman', Times, serif; /* Common print serif font */
              height: auto !important; /* Allow content to flow naturally */
              width: auto !important;
              overflow: visible !important; /* Ensure all content is available for print */
          }

          /* Hide elements specifically marked as print:hidden */
          .print\:hidden {
              display: none !important;
          }
          /* Ensure elements marked print:block are indeed block */
          .print\:block {
              display: block !important;
          }

          /* Global reset for links in print if desired */
          a {
              text-decoration: none !important; /* Avoid underlines unless specifically styled */
              color: inherit !important; /* Links should not stand out unless intended */
          }
          /* Optional: Show hrefs for external links
						 a[href^="http"]::after, a[href^="https"]::after {
								 content: " (" attr(href) ")";
								 font-size: 0.8em;
								 color: #337ab7;
						 }
					*/

          /* Ensure Resizable Panes don't interfere with print layout */
          [data-resizable-pane-group], [data-resizable-pane] {
              display: block !important; /* Override flex/grid from resizable */
              width: auto !important;
              height: auto !important;
              overflow: visible !important;
          }
          [data-resizable-handle] {
              display: none !important; /* Hide resize handles */
          }
          .border-2, .border, .border-r-transparent { /* Reset borders that might be on panes */
              border: none !important;
          }
          .rounded-tl-xl, .rounded-bl-xl {
              border-radius: 0 !important;
          }
          .bg-muted\/20 { /* Reset backgrounds */
              background-color: transparent !important;
          }
          .py-5, .p-2, .p-3 { /* Reset paddings if they conflict with page margins */
              padding: 0 !important;
          }
          .h-full {
              height: auto !important;
          }
          .w-full {
              width: auto !important; /* Let print media decide width */
          }

          /* Ensure ScrollArea content is fully visible */
          [data-radix-scroll-area-viewport] {
              height: auto !important;
              overflow: visible !important;
          }
          [data-radix-scroll-area-scrollbar] {
              display: none !important;
          }
      }
	</style>
</svelte:head>

<div class="flex h-screen flex-col print:hidden">
	<header
		class="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6 print:hidden"
	>
		<a href="/" class="flex items-center gap-2 font-semibold">
			<!-- SVG Icon -->
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
					 stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6">
				<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
				<polyline points="14 2 14 8 20 8"></polyline>
				<line x1="16" y1="13" x2="8" y2="13"></line>
				<line x1="16" y1="17" x2="8" y2="17"></line>
				<line x1="10" y1="9" x2="8" y2="9"></line>
			</svg>
			<span>PDFy</span>
		</a>
		<Button onclick={handleLoadFolder} disabled={!fsApiSupported || $isLoadingDirectory} class="ml-auto">
			{#if $isLoadingDirectory}
				Loading...
			{:else}
				Load Project Folder
			{/if}
		</Button>
		<Button variant="outline" onclick={handlePrint}>Print to PDF</Button>
	</header>

	{#if !fsApiSupported}
		<div class="flex flex-1 items-center justify-center p-4 print:hidden">
			<p class="text-destructive text-center">
				PDFy requires the File System Access API, which is not supported by your
				browser. <br /> Please try a modern browser like Chrome, Edge, or Opera.
			</p>
		</div>
	{:else}
		<Resizable.PaneGroup direction="horizontal" class="flex-1 print:hidden">
			<Resizable.Pane defaultSize={25} minSize={15}>
				<div class="flex h-full items-start justify-center p-1 print:hidden">
					{#if $isLoadingDirectory}
						<p class="p-4 text-muted-foreground">Loading directory structure...</p>
					{:else if $fileTree}
						<FileExplorer tree={$fileTree} />
					{:else}
						<p class="p-4 text-center text-muted-foreground">
							Click "Load Project Folder" to begin.
						</p>
					{/if}
				</div>
			</Resizable.Pane>
			<div class="h-full flex items-center print:hidden">
				<Resizable.Handle withHandle class="h-[80%] bg-transparent" />
			</div>
			<Resizable.Pane defaultSize={75} class="py-5">
				<div
					class="w-full h-full border-2 border-r-transparent p-2 rounded-tl-xl rounded-bl-xl bg-muted/20 print:hidden">
					<ScrollArea class="h-full p-3">
						{#if $selectedFilesForPrint.length === 0}
							<p class="p-6 text-center text-muted-foreground">
								Select files from the explorer to preview them here.
							</p>
						{:else}
							{#each $selectedFilesForPrint as selectedFile, _index (selectedFile.id)}
								{#if selectedFile.kind === "file"}
									<FilePreview pdfyFile={selectedFile} />
								{:else}
									<p class="p-4 text-muted-foreground">
										{selectedFile.name} is not a file or is not selected.
									</p>
								{/if}
							{/each}
						{/if}
					</ScrollArea>
				</div>
			</Resizable.Pane>
		</Resizable.PaneGroup>
	{/if}
</div>

<div class="hidden print:block" aria-hidden="true">
	{#if $selectedFilesForPrint.length === 0}
		<p class="p-6 text-center text-muted-foreground">
			Select files from the explorer to preview them here.
		</p>
	{:else}
		{#each $selectedFilesForPrint as selectedFile, _index (selectedFile.id)}
			{#if selectedFile.kind === "file"}
				<FilePreview pdfyFile={selectedFile} />
			{:else}
				<p class="p-4 text-muted-foreground">
					{selectedFile.name} is not a file or is not selected.
				</p>
			{/if}
		{/each}
	{/if}
</div>