<script lang="ts">
	import { calculatorStore } from '$lib/stores/calculatorStore';
	import CurrencySelector from '$lib/components/CurrencySelector.svelte';
	import MoneyInput from '$lib/components/MoneyInput.svelte';
	import PropertyArrangement from '$lib/components/PropertyArrangement.svelte';

	export let showPropertyExplanation = true;
</script>

<div class="glass-card relative z-[100] mb-8 p-1">
	<div class="grid grid-cols-1 items-start gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4">
		<!-- Currency -->
		<div class="relative z-20">
			<label class="block">
				<span class="label-text">Currency</span>
				<CurrencySelector
					value={$calculatorStore.currency}
					on:change={(e) => calculatorStore.updateCurrency(e.detail)}
				/>
			</label>
		</div>

		<!-- Shared Expenses -->
		<div>
			<MoneyInput
				id="shared-expenses"
				label="Shared Expenses"
				value={$calculatorStore.sharedExpenses}
				onChange={(val) =>
					calculatorStore.update((s) => ({
						...s,
						sharedExpenses: Math.max(0, val)
					}))}
				min={0}
			/>
		</div>

		<!-- Timeframe -->
		<div>
			<label class="block">
				<span class="label-text">Timeframe</span>
				<div class="relative flex w-full rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
					<button
						type="button"
						class="w-full rounded-lg px-3 py-2 text-xs font-semibold transition-all {$calculatorStore.timeframe ===
						'monthly'
							? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
							: 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}"
						on:click={() => calculatorStore.setTimeframe('monthly')}
					>
						Monthly
					</button>
					<button
						type="button"
						class="w-full rounded-lg px-3 py-2 text-xs font-semibold transition-all {$calculatorStore.timeframe ===
						'yearly'
							? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
							: 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}"
						on:click={() => calculatorStore.setTimeframe('yearly')}
					>
						Yearly
					</button>
				</div>
			</label>
		</div>

		<!-- Housing Toggle (only) -->
		<PropertyArrangement mode="toggle-only" bind:showPropertyExplanation />
	</div>
</div>
