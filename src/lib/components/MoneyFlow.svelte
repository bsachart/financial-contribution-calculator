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
		const rentItem = result?.breakdown?.find((item) => item.category === 'property-rent');
		return rentItem ? Math.abs(rentItem.amount) : 0;
	}

	$: monthlyMarketRent = state.timeframe === 'yearly' ? state.marketRent / 12 : state.marketRent;
	$: totalRentReceived = nonOwners.reduce((sum, p) => sum + getRentPayment(p.id), 0);
</script>

<div transition:slide>
	<div
		class="relative rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700"
	>
		<h3 class="mb-6 text-center text-sm font-bold text-slate-900 dark:text-white">
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

			<!-- Flow Arrow -->
			<div
				class="flex flex-col items-center justify-center px-4 text-slate-400 dark:text-slate-500"
			>
				<div class="flex flex-col items-center gap-2">
					<span class="text-xs font-bold tracking-wider uppercase">Rent</span>
					<svg
						class="h-8 w-12 text-slate-300 dark:text-slate-600"
						viewBox="0 0 48 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="M4 12h36m-6-6l6 6-6 6" />
					</svg>
				</div>
			</div>

			<!-- Owner (Receiver) -->
			<div class="flex flex-col gap-4">
				{#if owner}
					<div
						class="group relative flex flex-col items-center rounded-lg border-2 border-amber-200 bg-amber-50 p-4 transition-all hover:border-amber-400 hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-900/20 dark:hover:border-amber-500 dark:hover:bg-amber-900/40"
					>
						<div
							class="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-amber-200 text-xl shadow-sm group-hover:bg-amber-300 dark:bg-amber-800 dark:group-hover:bg-amber-700"
						>
							🔑
						</div>
						<div class="font-bold text-slate-900 dark:text-white">{owner.name}</div>
						<div class="text-xs text-slate-500 dark:text-slate-400">Property Owner</div>

						<div
							class="mt-2 rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700 dark:bg-green-900/30 dark:text-green-300"
						>
							Receives {formatCurrency(
								totalRentReceived,
								currency,
								state.timeframe
							)}/{state.timeframe === 'yearly' ? 'yr' : 'mo'}
						</div>

						<div class="mt-3 border-t border-amber-200 pt-2 text-center dark:border-amber-800/50">
							<div
								class="text-[10px] tracking-wide text-amber-800/70 uppercase dark:text-amber-500"
							>
								Fair market rent
							</div>
							<div class="text-xs font-bold text-amber-900 dark:text-amber-400">
								{formatCurrency(monthlyMarketRent, currency, state.timeframe)}/{state.timeframe ===
								'yearly'
									? 'yr'
									: 'mo'}
							</div>
						</div>
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
