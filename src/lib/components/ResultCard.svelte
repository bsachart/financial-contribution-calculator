<script lang="ts">
	import { formatCurrency, getTimeframeLabel } from '$lib/utils/formatters';
	import type { CalculationResult } from '$lib/services/calculationService';
	import { calculatorStore } from '$lib/stores/calculatorStore';
	import { slide } from 'svelte/transition';

	export let result: CalculationResult;
	export let personName: string;

	$: isHighContributor = result.percentage > 50;
	$: timeframe = $calculatorStore.timeframe;
	$: currency = $calculatorStore.currency;
	$: isOwner = $calculatorStore.propertyOwnerId === result.personId;

	// Auto-expand breakdown if there are property items
	$: hasPropertyItems = result.breakdown.some(
		(item) => item.category === 'property' || item.category === 'property-rent'
	);

	// Start with breakdown shown if property items exist
	let manualToggle = false;
	$: showBreakdown = manualToggle || hasPropertyItems;

	function toggleBreakdown() {
		manualToggle = !manualToggle;
	}

	// Color coding for breakdown items
	function getItemStyle(type: string, category: string): string {
		const baseStyle =
			'flex justify-between items-center py-2.5 px-3 rounded-lg text-xs transition-colors';

		// Property items get special highlighting
		if (category === 'property') {
			return `${baseStyle} text-amber-950 dark:text-amber-100 border-l-4 border-amber-500 bg-amber-100/80 dark:bg-amber-900/40 font-bold`;
		}
		if (category === 'property-rent') {
			return `${baseStyle} text-red-950 dark:text-red-100 border-l-4 border-red-500 bg-red-100/80 dark:bg-red-900/40 font-bold`;
		}

		// Income items
		if (type === 'income') {
			return `${baseStyle} text-emerald-800 dark:text-emerald-200 border-l-2 border-emerald-500 bg-emerald-100/50 dark:bg-emerald-900/30`;
		}

		// Deduction items
		if (type === 'deduction') {
			return `${baseStyle} text-rose-800 dark:text-rose-200 border-l-2 border-rose-400 bg-rose-100/50 dark:bg-rose-900/30`;
		}

		// Imputed income items
		if (type === 'imputed') {
			const categoryStyles: Record<
				string,
				{ text: string; darkText: string; border: string; bg: string; darkBg: string }
			> = {
				inheritance: {
					text: 'text-blue-700',
					darkText: 'dark:text-blue-300',
					border: 'border-blue-400',
					bg: 'bg-blue-50/50',
					darkBg: 'dark:bg-blue-900/20'
				},
				advantages: {
					text: 'text-violet-700',
					darkText: 'dark:text-violet-300',
					border: 'border-violet-400',
					bg: 'bg-violet-50/50',
					darkBg: 'dark:bg-violet-900/20'
				},
				'future-inheritance': {
					text: 'text-indigo-700',
					darkText: 'dark:text-indigo-300',
					border: 'border-indigo-400',
					bg: 'bg-indigo-50/50',
					darkBg: 'dark:bg-indigo-900/20'
				},
				matching: {
					text: 'text-teal-700',
					darkText: 'dark:text-teal-300',
					border: 'border-teal-400',
					bg: 'bg-teal-50/50',
					darkBg: 'dark:bg-teal-900/20'
				},
				variable: {
					text: 'text-orange-700',
					darkText: 'dark:text-orange-300',
					border: 'border-orange-400',
					bg: 'bg-orange-50/50',
					darkBg: 'dark:bg-orange-900/20'
				}
			};

			const style = categoryStyles[category] || {
				text: 'text-sky-700',
				darkText: 'dark:text-sky-300',
				border: 'border-sky-400',
				bg: 'bg-sky-50/50',
				darkBg: 'dark:bg-sky-900/20'
			};
			return `${baseStyle} ${style.text} ${style.darkText} border-l-2 ${style.border} ${style.bg} ${style.darkBg}`;
		}

		// Default fallback
		return `${baseStyle} text-slate-800 dark:text-slate-200 border-l-2 border-slate-400 dark:border-slate-500 bg-slate-100 dark:bg-slate-800/60`;
	}
</script>

<div class="glass-card relative overflow-hidden p-6">
	<!-- Background decoration -->
	<div
		class="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10 blur-xl"
	></div>

	<h3 class="mb-6 flex items-center gap-3 text-xl font-bold text-slate-900 dark:text-white">
		<span
			class="relative flex h-3 w-3"
			title={isHighContributor ? 'High contributor (>50%)' : 'Contributor'}
		>
			<span
				class="absolute inline-flex h-full w-full animate-ping rounded-full {isHighContributor
					? 'bg-indigo-400'
					: 'bg-slate-400'} opacity-75"
			></span>
			<span
				class="relative inline-flex h-3 w-3 rounded-full {isHighContributor
					? 'bg-indigo-500'
					: 'bg-slate-500'}"
			></span>
		</span>
		{personName}
		{#if isOwner}
			<span
				class="ml-auto rounded-full bg-amber-100 px-3 py-1 text-xs font-bold tracking-wide text-amber-700 uppercase dark:bg-amber-900/40 dark:text-amber-400"
				>Owner</span
			>
		{/if}
	</h3>

	<dl class="relative z-10 space-y-4 text-sm">
		<!-- Total Capacity -->
		<div
			class="flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50/50 p-4 dark:border-blue-800/30 dark:bg-blue-900/10"
		>
			<dt class="font-medium text-slate-700 dark:text-slate-300">Total capacity</dt>
			<dd class="flex items-baseline gap-1 text-lg font-bold text-blue-900 dark:text-blue-300">
				<span>{formatCurrency(result.monthlyCapacity, currency, timeframe)}</span>
				<span class="text-xs font-normal text-slate-600 dark:text-slate-400"
					>{getTimeframeLabel(timeframe)}</span
				>
			</dd>
		</div>

		<!-- Contribution -->
		<div
			class="flex items-center justify-between rounded-xl border border-indigo-200 bg-indigo-50/80 p-4 shadow-sm dark:border-indigo-800/50 dark:bg-indigo-900/20"
		>
			<dt class="font-medium text-slate-700 dark:text-slate-300">Contribution</dt>
			<dd class="flex items-baseline gap-2 text-lg font-bold text-indigo-900 dark:text-indigo-300">
				<span>{formatCurrency(result.monthlyContribution, currency, timeframe)}</span>
				<span class="rounded-md bg-white/50 px-2 py-0.5 text-xs font-bold dark:bg-black/20">
					{result.percentage.toFixed(1)}%
				</span>
			</dd>
		</div>

		<!-- Disposable Income -->
		<div
			class="flex items-center justify-between rounded-xl border border-green-100 bg-green-50/50 p-4 dark:border-green-800/30 dark:bg-green-900/10"
		>
			<dt class="font-medium text-slate-700 dark:text-slate-300">Disposable income</dt>
			<dd class="flex items-baseline gap-1 text-lg font-bold text-green-900 dark:text-green-300">
				<span>{formatCurrency(result.monthlyDisposable, currency, timeframe)}</span>
				<span class="text-xs font-normal text-slate-600 dark:text-slate-400"
					>{getTimeframeLabel(timeframe)}</span
				>
			</dd>
		</div>
	</dl>

	<button
		type="button"
		on:click={toggleBreakdown}
		class="mt-6 flex w-full items-center justify-between border-t border-slate-200 pt-4 text-xs font-bold tracking-wider text-slate-600 uppercase transition-colors hover:text-indigo-700 dark:border-slate-700 dark:text-slate-400 dark:hover:text-indigo-300"
	>
		<span class="flex items-center gap-2"
			>{showBreakdown ? 'Hide' : 'Show'} details
			{#if hasPropertyItems}
				<span
					class="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
					>Property</span
				>
			{/if}
		</span>
		<span class="transition-transform {showBreakdown ? 'rotate-180' : ''}">▼</span>
	</button>

	{#if showBreakdown}
		<div transition:slide class="mt-4 space-y-2">
			<div class="space-y-2">
				{#each result.breakdown as item}
					<div class={getItemStyle(item.type, item.category)}>
						<span class="font-medium">{item.label}</span>
						<span class="font-bold tabular-nums">
							{item.type === 'deduction' ? '-' : '+'}
							{formatCurrency(Math.abs(item.amount), currency, timeframe)}
						</span>
					</div>
				{/each}
			</div>

			<!-- Legend -->
			<div
				class="mt-4 grid grid-cols-2 gap-3 border-t border-slate-200 pt-3 text-[10px] font-medium text-slate-500 dark:border-slate-700 dark:text-slate-400"
			>
				<div class="flex items-center gap-1.5">
					<span class="h-2 w-2 rounded-full bg-emerald-400"></span>
					<span>Regular income</span>
				</div>
				<div class="flex items-center gap-1.5">
					<span class="h-2 w-2 rounded-full bg-blue-400"></span>
					<span>Imputed income</span>
				</div>
				<div class="flex items-center gap-1.5">
					<span class="h-2 w-2 rounded-full bg-rose-400"></span>
					<span>Deductions</span>
				</div>
				<div class="flex items-center gap-1.5">
					<span class="h-2 w-2 rounded-full bg-amber-400"></span>
					<span>Property</span>
				</div>
			</div>
		</div>
	{/if}
</div>
