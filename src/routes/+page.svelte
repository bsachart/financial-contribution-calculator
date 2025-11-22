<script lang="ts">
	import { onMount } from 'svelte';
	import { calculatorStore } from '$lib/stores/calculatorStore';
	import { uiStore } from '$lib/stores/uiStore';
	import { CalculationService } from '$lib/services/calculationService';
	import FeatureToggles from '$lib/components/FeatureToggles.svelte';
	import PartnerCard from '$lib/components/PartnerCard.svelte';
	import Header from '$lib/components/Header.svelte';
	import GlobalSettings from '$lib/components/GlobalSettings.svelte';
	import QuickStartGuide from '$lib/components/QuickStartGuide.svelte';
	import ResultsPanel from '$lib/components/ResultsPanel.svelte';
	import FairnessTest from '$lib/components/FairnessTest.svelte';
	import PropertyArrangement from '$lib/components/PropertyArrangement.svelte';
	import { fade, fly } from 'svelte/transition';

	let fileInput: HTMLInputElement;
	let showImportSuccess = false;
	let showImportError = false;
	let showQuickStart = true;
	let showPropertyExplanation = true;
	let darkMode = false;

	$: results = CalculationService.calculate($calculatorStore);
	$: timeframe = $calculatorStore.timeframe;

	$: conversionFactor = $calculatorStore.timeframe === 'yearly' ? 1 / 12 : 1;
	$: sharedExpensesMonthly = $calculatorStore.sharedExpenses * conversionFactor;
	$: totalCapacity = results.reduce((sum, r) => sum + r.monthlyCapacity, 0);
	$: remainingCapacity = totalCapacity - sharedExpensesMonthly;

	function handleExport() {
		const data = calculatorStore.exportState();
		const blob = new Blob([data], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		const date = new Date().toISOString().split('T')[0];
		a.download = `financial-calculator-${date}.json`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}

	function handleImport(event: CustomEvent<FileList>) {
		const file = event.detail?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (e) => {
			try {
				const content = e.target?.result as string;
				const success = calculatorStore.importState(content);

				if (success) {
					showImportSuccess = true;
					setTimeout(() => (showImportSuccess = false), 3000);
				} else {
					showImportError = true;
					setTimeout(() => (showImportError = false), 3000);
				}
			} catch (error) {
				console.error('Import failed:', error);
				showImportError = true;
				setTimeout(() => (showImportError = false), 3000);
			}
		};
		reader.readAsText(file);

		if (fileInput) fileInput.value = '';
	}

	function resetAll() {
		if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
			calculatorStore.resetState();
			uiStore.resetUI();
		}
	}

	onMount(() => {
		calculatorStore.setActiveSection('inheritance');

		const savedTheme = localStorage.getItem('theme');
		const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

		if (savedTheme === 'dark' || (!savedTheme && systemDark)) {
			darkMode = true;
			document.documentElement.classList.add('dark');
		} else {
			darkMode = false;
			document.documentElement.classList.remove('dark');
		}
	});
</script>

<div class="min-h-screen transition-colors duration-300">
	<Header
		bind:darkMode
		bind:fileInput
		on:export={handleExport}
		on:import={handleImport}
		on:reset={resetAll}
	/>

	<main class="mx-auto max-w-7xl px-4 py-8 sm:px-6">
		<!-- Import/Export Messages -->
		{#if showImportSuccess}
			<div
				in:fly={{ y: -20, duration: 300 }}
				out:fade
				class="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800 shadow-sm dark:border-green-800 dark:bg-green-900/20 dark:text-green-300"
			>
				✅ Data imported successfully!
			</div>
		{/if}

		{#if showImportError}
			<div
				in:fly={{ y: -20, duration: 300 }}
				out:fade
				class="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 shadow-sm dark:border-red-800 dark:bg-red-900/20 dark:text-red-300"
			>
				❌ Failed to import data. Please check the file format.
			</div>
		{/if}

		<GlobalSettings bind:showPropertyExplanation />

		<!-- Property Ownership Details (when enabled) -->
		{#if $calculatorStore.propertyArrangement === 'owned'}
			<div class="glass-card mb-8 p-6" in:fade>
				<PropertyArrangement mode="details-only" bind:showPropertyExplanation />
			</div>
		{/if}

		<QuickStartGuide bind:show={showQuickStart} />

		<!-- Main Grid Layout -->
		<div class="grid grid-cols-1 gap-8 lg:grid-cols-[320px,1fr]">
			<!-- Feature Toggles Sidebar -->
			<aside class="space-y-6">
				<div class="space-y-6">
					<FeatureToggles />
					<FairnessTest />
				</div>
			</aside>

			<!-- Partners Section -->
			<div class="space-y-6">
				<div class="flex items-center justify-between">
					<h2 class="text-2xl font-bold text-slate-900 dark:text-white">Partner Details</h2>
					<button
						type="button"
						on:click={() => calculatorStore.addPartner()}
						class="btn-secondary border-transparent bg-slate-900 text-white shadow-lg hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
					>
						+ Add Partner
					</button>
				</div>

				<div class="grid grid-cols-1 gap-6 xl:grid-cols-2">
					{#each $calculatorStore.people as person (person.id)}
						<PartnerCard {person} currency={$calculatorStore.currency} />
					{/each}
				</div>
			</div>
		</div>

		<ResultsPanel
			{results}
			{sharedExpensesMonthly}
			{totalCapacity}
			{remainingCapacity}
			{timeframe}
		/>
	</main>
</div>
