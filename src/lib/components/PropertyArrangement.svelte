<script lang="ts">
	import { calculatorStore } from '$lib/stores/calculatorStore';
	import MoneyFlow from '$lib/components/MoneyFlow.svelte';
	import { getCurrencySymbol } from '$lib/utils/formatters';
	import { fade } from 'svelte/transition';
	import { CalculationService } from '$lib/services/calculationService';

	export let showPropertyExplanation = true;
	export let mode: 'toggle-only' | 'details-only' | 'both' = 'both'; // Control what to show

	$: timeframe = $calculatorStore.timeframe;
	$: currencySymbol = getCurrencySymbol($calculatorStore.currency);
	$: results = CalculationService.calculate($calculatorStore);
</script>

<!-- Housing Toggle (for grid) -->
{#if mode === 'toggle-only' || mode === 'both'}
	<div>
		<label class="block">
			<span class="label-text">Housing</span>
			<div class="relative flex w-full rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
				<button
					type="button"
					class="w-full rounded-lg px-3 py-2 text-xs font-semibold transition-all {$calculatorStore.propertyArrangement ===
					'none'
						? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
						: 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}"
					on:click={() => calculatorStore.setPropertyArrangement('none')}
				>
					Renting
				</button>
				<button
					type="button"
					class="w-full rounded-lg px-3 py-2 text-xs font-semibold transition-all {$calculatorStore.propertyArrangement ===
					'owned'
						? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
						: 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}"
					on:click={() => calculatorStore.setPropertyArrangement('owned')}
				>
					One Owns
				</button>
			</div>
		</label>
	</div>
{/if}

<!-- Property Ownership Details (Full Width - to be placed separately) -->
{#if (mode === 'details-only' || mode === 'both') && $calculatorStore.propertyArrangement === 'owned'}
	<div
		class="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-800/30"
		in:fade
	>
		<div class="space-y-6">
			<!-- Who owns -->
			<div>
				<label class="block">
					<span class="label-text">Who owns the property?</span>
					<div class="flex flex-wrap gap-2">
						{#each $calculatorStore.people as person}
							<button
								type="button"
								class="min-w-[100px] flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all {$calculatorStore.propertyOwnerId ===
								person.id
									? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
									: 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'}"
								on:click={() => {
									if ($calculatorStore.propertyArrangement !== 'owned') {
										calculatorStore.setPropertyArrangement('owned');
									}
									calculatorStore.setPropertyOwner(person.id);
								}}
							>
								{person.name}
							</button>
						{/each}
					</div>
				</label>
			</div>

			<!-- Market rent -->
			<div>
				<label class="block">
					<span class="label-text">
						Fair market rent ({timeframe === 'yearly' ? 'yearly' : 'monthly'})
					</span>
					<div class="input-group">
						<span
							class="absolute top-1/2 left-3 -translate-y-1/2 font-medium text-slate-500 dark:text-slate-200"
							>{currencySymbol}</span
						>
						<input
							type="number"
							value={$calculatorStore.marketRent}
							on:input={(e) =>
								calculatorStore.updateMarketRent(
									Math.max(0, Number((e.target as HTMLInputElement).value) || 0)
								)}
							placeholder="Estimated rent if rented out"
							class="input-currency"
							step="100"
							min="0"
						/>
					</div>
				</label>
			</div>
		</div>

		<!-- Property Ownership Logic & Money Flow (Full Width) -->
		{#if $calculatorStore.propertyOwnerId && $calculatorStore.marketRent > 0}
			<div
				class="mt-6 overflow-hidden rounded-xl border border-amber-200/50 bg-amber-50/50 dark:border-amber-800/30 dark:bg-amber-900/10"
			>
				<button
					type="button"
					on:click={() => (showPropertyExplanation = !showPropertyExplanation)}
					class="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-amber-100/50 dark:hover:bg-amber-900/20"
				>
					<span
						class="flex items-center gap-2 text-sm font-bold text-amber-900 dark:text-amber-400"
					>
						<span>🏠</span> Property ownership logic
					</span>
					<span
						class="text-amber-600 transition-transform dark:text-amber-500 {showPropertyExplanation
							? 'rotate-180'
							: ''}"
					>
						▼
					</span>
				</button>

				{#if showPropertyExplanation}
					<div class="p-0">
						<MoneyFlow {results} state={$calculatorStore} />
					</div>
				{/if}
			</div>
		{/if}
	</div>
{/if}
