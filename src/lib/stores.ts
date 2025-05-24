import { writable, type Writable } from 'svelte/store';
import { type PDFYFileSystemEntry, RenderMode } from '$lib/types';

export const rootDirectoryHandle: Writable<FileSystemDirectoryHandle | null> = writable(null);
export const fileTree: Writable<PDFYFileSystemEntry[] | null> = writable(null);
export const selectedFilesForPrint: Writable<PDFYFileSystemEntry[]> = writable([]);
export const isLoadingDirectory: Writable<boolean> = writable(false);
export const isLoadingFile: Writable<boolean> = writable(false);

// Content that could be rendered or viewed raw
export const markdownPreviewMode: Writable<RenderMode> = writable(RenderMode.Raw);
export const htmlPreviewMode: Writable<RenderMode> = writable(RenderMode.Raw);
export const xmlPreviewMode: Writable<RenderMode> = writable(RenderMode.Raw);
