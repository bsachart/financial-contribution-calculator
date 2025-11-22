<script lang="ts">
	import type { CalculationResult } from '$lib/services/calculationService';
	import type { CalculatorState } from '$lib/domains/financialModels';
	import { formatCurrency } from '$lib/utils/formatters';
	import { slide } from 'svelte/transition';

	export let results: CalculationResult[];
	export let state: CalculatorState;

	$: owner = state.people.find((p) => p.id === state.propertyOwnerId);
	$: nonOwners = state.people.filter((p) => p.id !== state.propertyOwnerId);
	$: currency = state.currency;

	// This function finds the specific rent payment from the calculation breakdown
	function getRentPayment(personId: string): number {
		const result = results.find((r) => r.personId === personId);
		const rentItem = result?.breakdown.find((item) => item.category === 'property-rent');
		return rentItem ? Math.abs(rentItem.amount) : 0;
	}

	$: monthlyMarketRent = state.timeframe === 'yearly' ? state.marketRent / 12 : state.marketRent;
</script>

<div class="mt-4" transition:slide>
	<div
		class="relative rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700"
	>
		<h3 class="mb-6 text-center text-sm font-bold tracking-wider text-slate-900 uppercase">
			Property Money Flow
		</h3>

		<div class="flex flex-col items-center justify-center gap-8 md:flex-row">
			<!-- Non-Owners (Payers) -->
			<div class="flex flex-col gap-4">
				{#each nonOwners as nonOwner}
					{@const rentAmount = getRentPayment(nonOwner.id)}
					<div
						class="group relative flex flex-col items-center rounded-lg border-2 border-slate-200 bg-slate-50 p-4 transition-all hover:border-indigo-300 hover:bg-indigo-50 dark:border-slate-600 dark:bg-slate-900 dark:hover:border-indigo-500 dark:hover:bg-indigo-900/20"
					>
						<div
							class="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-xl shadow-sm group-hover:bg-indigo-200 dark:bg-slate-700 dark:group-hover:bg-indigo-800"
						>
							👤
						</div>
						<div class="font-bold text-slate-900 dark:text-white">{nonOwner.name}</div>
						<div class="text-xs text-slate-500 dark:text-slate-400">Non-Owner</div>

						<!-- Arrow to House -->
						<div class="absolute top-1/2 -right-8 hidden h-0.5 w-8 bg-slate-300 md:block"></div>
						<div
							class="absolute top-1/2 -right-8 hidden translate-x-6 -translate-y-1.5 text-slate-300 md:block"
						>
							▶
						</div>

						<div
							class="mt-2 rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700 dark:bg-red-900/30 dark:text-red-300"
						>
							Pays {formatCurrency(rentAmount, currency, state.timeframe)}/{state.timeframe ===
							'yearly'
								? 'yr'
								: 'mo'}
						</div>
					</div>
				{/each}
			</div>

			<!-- The Property (Center) -->
			<div class="z-10 flex flex-col items-center">
				<div
					class="relative flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 shadow-md ring-4 ring-white"
				>
					<span class="text-4xl">🏠</span>
					<div
						class="absolute -bottom-3 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm"
					>
						Market Rent
					</div>
				</div>
				<div class="mt-3 text-center">
					<div class="text-lg font-bold text-amber-900 dark:text-amber-400">
						{formatCurrency(monthlyMarketRent, currency, state.timeframe)}/{state.timeframe ===
						'yearly'
							? 'yr'
							: 'mo'}
					</div>
					<div class="text-xs text-amber-700 dark:text-amber-500">Total Value</div>
				</div>
			</div>

			<!-- Owner (Receiver) -->
			<div class="flex flex-col gap-4">
				{#if owner}
					<div
						class="group relative flex flex-col items-center rounded-lg border-2 border-amber-200 bg-amber-50 p-4 transition-all hover:border-amber-400 hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-900/20 dark:hover:border-amber-500 dark:hover:bg-amber-900/40"
					>
						<!-- Arrow from House -->
						<div class="absolute top-1/2 -left-8 hidden h-0.5 w-8 bg-amber-300 md:block"></div>
						<div
							class="absolute top-1/2 -left-8 hidden translate-x-0 -translate-y-1.5 text-amber-300 md:block"
						>
							▶
						</div>

						<div
							class="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-amber-200 text-xl shadow-sm group-hover:bg-amber-300 dark:bg-amber-800 dark:group-hover:bg-amber-700"
						>
							👑
						</div>
						<div class="font-bold text-slate-900 dark:text-white">{owner.name}</div>
						<div class="text-xs text-slate-500 dark:text-slate-400">Property Owner</div>

						<div
							class="mt-2 rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700 dark:bg-green-900/30 dark:text-green-300"
						>
							Receives {formatCurrency(
								monthlyMarketRent,
								currency,
								state.timeframe
							)}/{state.timeframe === 'yearly' ? 'yr' : 'mo'}
						</div>
						<div class="mt-1 text-[10px] text-slate-500">(Imputed Income)</div>
					</div>
				{/if}
			</div>
		</div>

		<div
			class="mt-8 rounded-lg bg-slate-50 p-3 text-center text-xs text-slate-600 dark:bg-slate-900/50 dark:text-slate-400"
		>
			<p>
				<strong>Why this matters:</strong> The owner provides housing value ({formatCurrency(
					monthlyMarketRent,
					currency,
					state.timeframe
				)}) instead of cash. Non-owners pay for their consumption. This ensures fairness by
				separating
				<strong>housing consumption</strong> from <strong>asset ownership</strong>.
			</p>
		</div>
	</div>
</div>
