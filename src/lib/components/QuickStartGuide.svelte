<script lang="ts">
	import { fade } from 'svelte/transition';
	export let show = true;
</script>

{#if show}
	<div
		class="relative mb-8 rounded-2xl border border-blue-200/50 bg-blue-50/50 p-6 backdrop-blur-sm dark:border-blue-800/30 dark:bg-blue-900/10"
		in:fade
	>
		<button
			on:click={() => (show = false)}
			class="absolute top-4 right-4 text-blue-400 transition-colors hover:text-blue-600 dark:hover:text-blue-300"
			aria-label="Close quick start guide"
		>
			✕
		</button>
		<div class="flex items-start gap-4">
			<div
				class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
			>
				💡
			</div>
			<div>
				<h3 class="mb-2 text-base font-bold text-blue-900 dark:text-blue-300">Quick Start Guide</h3>
				<ol class="list-inside list-decimal space-y-1 text-sm text-blue-800 dark:text-blue-200/80">
					<li>
						Set <strong>timeframe</strong> (monthly/yearly) - this affects all inputs below
					</li>
					<li>
						Enter <strong>shared expenses</strong> (excludes rent if one partner owns property)
					</li>
					<li>If applicable, set <strong>property ownership</strong> and market rent</li>
					<li>
						Enable <strong>optional features</strong> in the sidebar to account for inheritance, loans,
						etc.
					</li>
					<li>Fill in <strong>income details</strong> for each partner</li>
				</ol>
			</div>
		</div>
	</div>
{/if}
