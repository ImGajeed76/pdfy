<script lang="ts">
	import type { PDFYFileSystemEntry } from '$lib/types';
	import FileTreeItem from './FileTreeItem.svelte';
	import { ScrollArea } from '$lib/components/ui/scroll-area';

	// The 'tree' prop will be the signal itself from appStores.fileTree
	export let tree: PDFYFileSystemEntry[] | null;
</script>

<ScrollArea class="h-full w-full p-2 pl-0">
	<div class="space-y-1">
		{#if tree && tree.length > 0}
			{#each tree as entry (entry.id)}
				<FileTreeItem {entry} />
			{/each}
		{:else}
			<p class="text-sm text-muted-foreground p-4 text-center">No files or folders found.</p>
		{/if}
	</div>
</ScrollArea>
