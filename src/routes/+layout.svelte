<script lang="ts">
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import { Toaster } from '$lib/components/ui/sonner';

	let { children } = $props();
</script>

<div class="print:hidden">
	<ModeWatcher />
	<Toaster richColors/>
</div>
{@render children()}
