<script lang="ts">
	import type { Person } from '$lib/domains/financialModels';
	import { calculatorStore } from '$lib/stores/calculatorStore';
	import { uiStore } from '$lib/stores/uiStore';
	import { getCurrencySymbol } from '$lib/utils/formatters';
	import { slide } from 'svelte/transition';
	import IncomeSection from './partner/IncomeSection.svelte';
	import InheritanceSection from './partner/InheritanceSection.svelte';
	import DebtSection from './partner/DebtSection.svelte';
	import VariableIncomeSection from './partner/VariableIncomeSection.svelte';
	import RetirementSection from './partner/RetirementSection.svelte';

	export let person: Person;
	export let currency: string;

	$: timeframe = $calculatorStore.timeframe;
	$: enabledSections = $uiStore.enabledSections;

	$: isOwner = $calculatorStore.propertyOwnerId === person.id;
	$: currencySymbol = getCurrencySymbol(currency);

	function updateField<K extends keyof Person>(key: K, value: Person[K]) {
		calculatorStore.updatePerson(person.id, key, value);
	}
</script>

<div class="glass-card group relative p-6">
	<!-- Header with name editing -->
	<div
		class="mb-6 flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-700"
	>
		<label for="name-{person.id}" class="sr-only">Partner name</label>
		<input
			id="name-{person.id}"
			type="text"
			value={person.name}
			on:input={(e) => updateField('name', (e.target as HTMLInputElement).value)}
			class="w-full rounded-xl border-0 bg-transparent px-2 py-1 text-xl font-bold text-slate-900 transition-all placeholder:text-slate-400 focus:bg-white/50 focus:ring-2 focus:ring-indigo-500 dark:text-white dark:focus:bg-slate-800/50"
			placeholder="Enter name"
		/>
		{#if $calculatorStore.people.length > 2}
			<button
				on:click={() => calculatorStore.removePartner(person.id)}
				class="ml-2 rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
				aria-label="Remove {person.name}"
				type="button"
			>
				✕
			</button>
		{/if}
	</div>

	<!-- Income Section (always visible) -->
	<IncomeSection {person} />

	<!-- Inheritance Section -->
	{#if enabledSections.includes('inheritance')}
		<InheritanceSection {person} />
	{/if}

	<!-- Debt Section -->
	{#if enabledSections.includes('debt')}
		<DebtSection {person} />
	{/if}

	<!-- Variable Income Section -->
	{#if enabledSections.includes('variable')}
		<VariableIncomeSection {person} />
	{/if}

	<!-- Retirement Section -->
	{#if enabledSections.includes('retirement')}
		<RetirementSection {person} />
	{/if}

	<!-- Property Owner Badge (if applicable) - Moved to bottom -->
	{#if isOwner && $calculatorStore.propertyArrangement === 'owned' && $calculatorStore.marketRent > 0}
		<div
			class="mt-6 rounded-xl border border-amber-200/50 bg-amber-50/50 p-4 dark:border-amber-700/30 dark:bg-amber-900/20"
			transition:slide
		>
			<div class="flex items-center gap-3">
				<div
					class="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-xl dark:bg-amber-900/40"
				>
					🏠
				</div>
				<div>
					<strong class="block text-sm font-bold text-amber-900 dark:text-amber-400"
						>Property Owner</strong
					>
					<p class="text-xs font-medium text-amber-700 dark:text-amber-500/80">
						Receives {currencySymbol}{$calculatorStore.marketRent.toLocaleString()}/{timeframe ===
						'yearly'
							? 'yr'
							: 'mo'} imputed income
					</p>
				</div>
			</div>
		</div>
	{/if}
</div>
