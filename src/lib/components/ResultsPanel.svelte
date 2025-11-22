<script lang="ts">
	import { fade } from 'svelte/transition';
	import { calculatorStore } from '$lib/stores/calculatorStore';
	import ResultCard from '$lib/components/ResultCard.svelte';
	import { formatCurrency, getTimeframeLabel } from '$lib/utils/formatters';

	export let results: any[] = [];
	export let sharedExpensesMonthly: number;
	export let totalCapacity: number;
	export let remainingCapacity: number;
	export let timeframe: 'monthly' | 'yearly';
</script>

{#if results.length > 0 && sharedExpensesMonthly > 0}
	<div class="mt-12" in:fade>
		<div class="mb-6 flex items-center gap-4">
			<h2 class="text-2xl font-bold text-slate-900 dark:text-white">📊 Calculation Results</h2>
			<div class="h-px flex-1 bg-slate-200 dark:bg-slate-700"></div>
		</div>

		<div class="glass-card p-8">
			<div class="grid grid-cols-1 gap-8 md:grid-cols-2">
				{#each results as result}
					{@const person = $calculatorStore.people.find((p) => p.id === result.personId)}
					{#if person}
						<ResultCard {result} personName={person.name} />
					{/if}
				{/each}
			</div>

			<div class="mt-8 border-t border-slate-200 pt-8 dark:border-slate-700">
				<div class="grid grid-cols-1 gap-8 text-center sm:grid-cols-3">
					<div
						class="group rounded-xl border border-slate-200 bg-slate-50/50 p-4 transition-all hover:border-indigo-200 hover:bg-indigo-50/30 hover:shadow-md dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-indigo-800 dark:hover:bg-indigo-900/20"
					>
						<div class="mb-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
							Combined Capacity
						</div>
						<div
							class="text-2xl font-bold text-slate-900 transition-colors group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400"
						>
							{formatCurrency(totalCapacity, $calculatorStore.currency, timeframe)}
						</div>
						<div class="mt-1 text-xs text-slate-400 dark:text-slate-500">
							{getTimeframeLabel(timeframe)}
						</div>
					</div>

					<div
						class="group rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 transition-all hover:border-indigo-200 hover:bg-indigo-50 hover:shadow-md dark:border-indigo-900/30 dark:bg-indigo-900/10 dark:hover:border-indigo-800 dark:hover:bg-indigo-900/20"
					>
						<div class="mb-1 text-xs font-semibold text-indigo-600/80 dark:text-indigo-400/80">
							Shared Expenses
						</div>
						<div class="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
							{formatCurrency(sharedExpensesMonthly, $calculatorStore.currency, timeframe)}
						</div>
						<div class="mt-1 text-xs text-indigo-400 dark:text-indigo-500">
							{getTimeframeLabel(timeframe)}
						</div>
					</div>

					<div
						class="group rounded-xl border p-4 transition-all hover:shadow-md {remainingCapacity >=
						0
							? 'border-emerald-100 bg-emerald-50/50 hover:border-emerald-200 hover:bg-emerald-50 dark:border-emerald-900/30 dark:bg-emerald-900/10 dark:hover:border-emerald-800 dark:hover:bg-emerald-900/20'
							: 'border-red-100 bg-red-50/50 hover:border-red-200 hover:bg-red-50 dark:border-red-900/30 dark:bg-red-900/10 dark:hover:border-red-800 dark:hover:bg-red-900/20'}"
					>
						<div
							class="mb-1 text-xs font-semibold {remainingCapacity >= 0
								? 'text-emerald-600/80 dark:text-emerald-400/80'
								: 'text-red-600/80 dark:text-red-400/80'}"
						>
							{remainingCapacity >= 0 ? 'Remaining Buffer' : 'Deficit'}
						</div>
						<div
							class="text-2xl font-bold {remainingCapacity >= 0
								? 'text-emerald-600 dark:text-emerald-400'
								: 'text-red-600 dark:text-red-400'}"
						>
							{formatCurrency(remainingCapacity, $calculatorStore.currency, timeframe)}
						</div>
						<div
							class="mt-1 text-xs {remainingCapacity >= 0
								? 'text-emerald-400 dark:text-emerald-500'
								: 'text-red-400 dark:text-red-500'}"
						>
							{getTimeframeLabel(timeframe)}
						</div>
					</div>
				</div>

				{#if remainingCapacity < 0}
					<div
						class="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20"
					>
						<span class="text-xl">⚠️</span>
						<p class="text-sm text-red-800 dark:text-red-300">
							<strong>Warning:</strong> Shared expenses exceed your combined financial capacity. You
							are currently over budget by {formatCurrency(
								Math.abs(remainingCapacity),
								$calculatorStore.currency,
								timeframe
							)}.
						</p>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}
