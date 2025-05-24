<script lang="ts">
	import { type PDFYFileSystemEntry, type PDFYFileType } from '$lib/types';
	import { Button } from '$lib/components/ui/button';
	import { ChevronRight, FileCode, FileText, FileType, Folder } from 'lucide-svelte';
	import { isLoadingFile, selectedFilesForPrint } from '$lib/stores';
	import * as Collapsible from '$lib/components/ui/collapsible/index.js';
	import FileTreeItem from './FileTreeItem.svelte';

	let { entry }: {
		entry: PDFYFileSystemEntry;
	} = $props();

	let isOpen = $state(false); // For collapsible directories

	async function toggleFileUseInOutput(fileEntry: PDFYFileSystemEntry) {
		if (fileEntry.kind !== 'file') return; // Only toggle files, not directories

		selectedFilesForPrint.update((files) => {
			const existingIndex = files.findIndex(f => f.id === fileEntry.id);
			if (existingIndex > -1) {
				// If already selected, remove it
				files.splice(existingIndex, 1);
			} else {
				// Otherwise, add it
				files.push(fileEntry);
			}
			return files;
		});
	}

	async function recursiveToggleUseInOutput(entry: PDFYFileSystemEntry) {
		if (entry.kind === 'file') {
			await toggleFileUseInOutput(entry);
		} else if (entry.kind === 'directory' && entry.children) {
			for (const child of entry.children) {
				await recursiveToggleUseInOutput(child);
			}
		}
	}

	// getIcon function remains the same
	function getIcon(kind: 'file' | 'directory', fileType?: PDFYFileType) {
		if (kind === 'directory') return Folder;
		if (fileType === 'rendered') return FileType; // Using a generic 'FileType' for Rendered files
		if (fileType === 'code') return FileCode;
		return FileText;
	}

	// Derived state for styling the selected item
	let isSelected = $derived($selectedFilesForPrint.some(file => file.id === entry.id));
</script>

<div style="padding-left: 0.75rem;">
	{#if entry.kind === 'directory'}
		{@const Icon = getIcon(entry.kind)}
		<Collapsible.Root bind:open={isOpen} class="w-full">
			<div class="flex items-center w-full hover:bg-muted/50 {isSelected ? 'bg-muted font-semibold' : ''} rounded-md pl-2 mb-1">
				<Collapsible.Trigger class="m-0 p-0 w-fit">
					<ChevronRight class="h-4 w-4 transition-transform duration-200 {isOpen
							? 'rotate-90'
							: ''}" />

				</Collapsible.Trigger>
				<Button
					variant="ghost"
					class="m-0 p-0 w-fit"
					onclick={() => recursiveToggleUseInOutput(entry)}
					disabled={$isLoadingFile}
				>
					<Icon class="h-4 w-4 text-sky-500 {isSelected ? 'fill-sky-500' : ''}" />
				</Button>
				{entry.name}
			</div>

			<Collapsible.Content>
				<div class="space-y-1">
					{#if isOpen && entry.children && entry.children.length > 0}
						{#each entry.children as child (child.id)}
							<FileTreeItem entry={child} />
						{/each}
					{:else if isOpen && (!entry.children || entry.children.length === 0)}
						<p class="text-xs text-muted-foreground pl-8 py-1">(empty)</p>
					{/if}
				</div>
			</Collapsible.Content>
		</Collapsible.Root>
	{:else if entry.kind === 'file'}
		{@const Icon = getIcon(entry.kind, entry.selected ? entry.fileType : undefined)}
		<Button
			variant="ghost"
			class="w-full justify-start py-1.5 h-auto text-sm hover:bg-muted/50 {isSelected ? 'bg-muted font-semibold' : ''}"
			onclick={() => toggleFileUseInOutput(entry)}
			disabled={$isLoadingFile}
		>
			<span class="inline-block h-4 w-4"></span> <!-- Indentation spacer -->
			<Icon class="h-4 w-4 mr-2 {isSelected ? 'text-primary' : 'text-gray-500'}" />
			{entry.name}
		</Button>
	{/if}
</div>
