<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let darkMode = false;
	export let fileInput: HTMLInputElement;

	const dispatch = createEventDispatcher();

	function toggleDarkMode() {
		darkMode = !darkMode;
		if (darkMode) {
			document.documentElement.classList.add('dark');
			localStorage.setItem('theme', 'dark');
		} else {
			document.documentElement.classList.remove('dark');
			localStorage.setItem('theme', 'light');
		}
	}
</script>

<header
	class="sticky top-0 z-50 border-b border-white/20 bg-white/80 shadow-sm backdrop-blur-md dark:bg-slate-900/80"
>
	<div class="mx-auto max-w-7xl px-4 py-4 sm:px-6">
		<div class="flex flex-wrap items-center justify-between gap-4">
			<div class="flex items-center gap-3">
				<div
					class="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white"
				>
					<span class="text-xl">⚖️</span>
				</div>
				<div>
					<h1 class="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-white">
						FairShare
					</h1>
					<p class="text-xs font-medium text-slate-500 dark:text-slate-400">
						Financial Equity Calculator
					</p>
				</div>
			</div>

			<div class="flex flex-wrap items-center gap-3">
				<!-- Dark Mode Toggle -->
				<button
					on:click={toggleDarkMode}
					class="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
					title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
				>
					{#if darkMode}
						🌙
					{:else}
						☀️
					{/if}
				</button>

				<div class="mx-1 h-6 w-px bg-slate-200 dark:bg-slate-700"></div>

				<!-- Export/Import/Reset Controls -->
				<div class="flex items-center gap-2">
					<button
						type="button"
						on:click={() => dispatch('export')}
						class="btn-secondary px-3 py-1.5 text-xs"
						title="Export configuration"
					>
						📥 Export
					</button>
					<input
						bind:this={fileInput}
						type="file"
						accept=".json"
						on:change={(e) => dispatch('import', (e.target as HTMLInputElement).files)}
						class="hidden"
						id="import-file"
					/>
					<label
						for="import-file"
						class="btn-secondary cursor-pointer px-3 py-1.5 text-xs"
						title="Import configuration"
					>
						📤 Import
					</label>
					<button
						type="button"
						on:click={() => dispatch('reset')}
						class="btn-danger px-3 py-1.5 text-xs"
						title="Reset all data"
					>
						🗑️ Reset
					</button>
				</div>
			</div>
		</div>
	</div>
</header>
