<script lang="ts">
	import { onMount } from 'svelte';
	import { getCurrencySymbol } from '$lib/calculator';
	import { calculatorStore } from '$lib/stores/calculatorStore';
	import { calculate, formatCurrency, getTimeframeLabel } from '$lib/calculator';
	import FeatureToggles from '$lib/components/FeatureToggles.svelte';
	import PartnerColumn from '$lib/components/PartnerColumn.svelte';
	import ResultCard from '$lib/components/ResultCard.svelte';
	import CurrencySelector from '$lib/components/CurrencySelector.svelte';
	import { fade } from 'svelte/transition';

	let fileInput: HTMLInputElement;
	let showImportSuccess = false;
	let showImportError = false;
	let showPropertyExplanation = true;
	let showQuickStart = true;

	$: results = calculate($calculatorStore);
	$: timeframe = $calculatorStore.timeframe;

	$: conversionFactor = $calculatorStore.timeframe === 'yearly' ? 1 / 12 : 1;
	$: sharedExpensesMonthly = $calculatorStore.sharedExpenses * conversionFactor;
	$: totalCapacity = results.reduce((sum, r) => sum + r.monthlyCapacity, 0);
	$: remainingCapacity = totalCapacity - sharedExpensesMonthly;
	$: currencySymbol = getCurrencySymbol($calculatorStore.currency);

	function handleExport() {
		const data = calculatorStore.exportState();
		const blob = new Blob([data], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `financial-calculator-${new Date().toISOString().split('T')[0]}.json`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}

	function handleImport(event: Event) {
		const file = (event.target as HTMLInputElement).files?.[0];
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
		}
	}

	onMount(() => {
		calculatorStore.setActiveSection('inheritance');
	});
</script>

<div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
	<!-- Header -->
	<header
		class="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-sm"
	>
		<div class="mx-auto max-w-7xl px-4 py-3 sm:px-6">
			<div class="flex flex-wrap items-center justify-between gap-3">
				<div>
					<h1 class="text-xl font-bold text-slate-900 sm:text-2xl">
						Financial Contribution Calculator
					</h1>
					<p class="mt-0.5 text-xs text-slate-600 sm:text-sm">
						Fair, proportional contributions based on true financial capacity
					</p>
				</div>

				<div class="flex flex-wrap items-center gap-3">
					<!-- Export/Import/Reset Controls -->
					<div class="flex items-center gap-2">
						<button
							type="button"
							on:click={handleExport}
							class="btn-secondary px-3 py-1.5 text-xs"
							title="Export configuration"
						>
							📥 Export
						</button>
						<input
							bind:this={fileInput}
							type="file"
							accept=".json"
							on:change={handleImport}
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
							on:click={resetAll}
							class="btn-secondary px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
							title="Reset all data"
						>
							🗑️ Reset
						</button>
					</div>

					<!-- Total Expenses Display -->
					<div class="text-right">
						<div class="text-xs text-slate-500">Total shared expenses</div>
						<div class="text-lg font-bold text-indigo-600 sm:text-xl">
							{formatCurrency(sharedExpensesMonthly, $calculatorStore.currency, timeframe)}
							{getTimeframeLabel(timeframe)}
						</div>
					</div>
				</div>
			</div>
		</div>
	</header>

	<main class="mx-auto max-w-7xl px-4 py-4 sm:px-6">
		<!-- Import/Export Messages -->
		{#if showImportSuccess}
			<div
				in:fade
				out:fade
				class="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800"
			>
				✅ Data imported successfully!
			</div>
		{/if}

		{#if showImportError}
			<div
				in:fade
				out:fade
				class="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
			>
				❌ Failed to import data. Please check the file format.
			</div>
		{/if}

		<!-- Sticky Settings Bar -->
		<div class="card sticky top-[72px] z-40 mb-4 bg-white/95 p-4 backdrop-blur-sm">
			<div class="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<div>
					<label class="block">
						<span class="mb-1 block text-xs font-semibold tracking-wide text-slate-700 uppercase"
							>Currency</span
						>
						<CurrencySelector
							value={$calculatorStore.currency}
							on:change={(e) => calculatorStore.updateCurrency(e.detail)}
						/>
					</label>
				</div>

				<div>
					<label class="block">
						<span class="mb-1 block text-xs font-semibold tracking-wide text-slate-700 uppercase"
							>Shared Expenses</span
						>
						<div class="input-group">
							<span class="absolute top-1/2 left-3 -translate-y-1/2 font-medium text-slate-400"
								>{currencySymbol}</span
							>
							<input
								type="number"
								value={$calculatorStore.sharedExpenses}
								on:input={(e) =>
									calculatorStore.update((s) => ({
										...s,
										sharedExpenses: Math.max(0, Number((e.target as HTMLInputElement).value) || 0)
									}))}
								class="input-currency pl-8 text-sm"
								step="100"
								min="0"
							/>
						</div>
						{#if $calculatorStore.propertyArrangement === 'owned'}
							<p class="mt-1 text-xs font-medium text-amber-600">
								⚠️ Excludes rent/mortgage (utilities & insurance only)
							</p>
						{:else}
							<p class="mt-1 text-xs text-slate-500">All shared living costs</p>
						{/if}
					</label>
				</div>

				<div>
					<label class="block">
						<span class="mb-1 block text-xs font-semibold tracking-wide text-slate-700 uppercase"
							>Timeframe</span
						>
						<div class="relative flex w-full rounded-lg bg-slate-100 p-0.5">
							<button
								type="button"
								class="w-full rounded-md px-3 py-1.5 text-xs font-semibold transition-all {$calculatorStore.timeframe ===
								'monthly'
									? 'bg-white text-slate-900 shadow-sm'
									: 'text-slate-600 hover:text-slate-900'}"
								on:click={() => calculatorStore.setTimeframe('monthly')}
								aria-pressed={$calculatorStore.timeframe === 'monthly'}
							>
								Monthly
							</button>
							<button
								type="button"
								class="w-full rounded-md px-3 py-1.5 text-xs font-semibold transition-all {$calculatorStore.timeframe ===
								'yearly'
									? 'bg-white text-slate-900 shadow-sm'
									: 'text-slate-600 hover:text-slate-900'}"
								on:click={() => calculatorStore.setTimeframe('yearly')}
								aria-pressed={$calculatorStore.timeframe === 'yearly'}
							>
								Yearly
							</button>
						</div>
					</label>
				</div>

				<div>
					<label class="block">
						<span class="mb-1 block text-xs font-semibold tracking-wide text-slate-700 uppercase"
							>Property</span
						>
						<div class="relative flex w-full rounded-lg bg-slate-100 p-0.5">
							<button
								type="button"
								class="w-full rounded-md px-3 py-1.5 text-xs font-semibold transition-all {$calculatorStore.propertyArrangement ===
								'none'
									? 'bg-white text-slate-900 shadow-sm'
									: 'text-slate-600 hover:text-slate-900'}"
								on:click={() => calculatorStore.setPropertyArrangement('none')}
								aria-pressed={$calculatorStore.propertyArrangement === 'none'}
							>
								Renting
							</button>
							<button
								type="button"
								class="w-full rounded-md px-3 py-1.5 text-xs font-semibold transition-all {$calculatorStore.propertyArrangement ===
								'owned'
									? 'bg-white text-slate-900 shadow-sm'
									: 'text-slate-600 hover:text-slate-900'}"
								on:click={() => calculatorStore.setPropertyArrangement('owned')}
								aria-pressed={$calculatorStore.propertyArrangement === 'owned'}
							>
								One Owns
							</button>
						</div>
					</label>
				</div>
			</div>

			<!-- Property Ownership Details -->
			{#if $calculatorStore.propertyArrangement === 'owned'}
				<div class="mt-4 border-t border-slate-200 pt-4">
					<div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
						<!-- Who owns -->
						<div>
							<label class="block">
								<span class="mb-2 block text-xs font-semibold text-slate-700">Property Owner</span>
								<div class="flex flex-wrap gap-2">
									{#each $calculatorStore.people as person}
										<button
											type="button"
											class="min-w-[100px] flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-all {$calculatorStore.propertyOwnerId ===
											person.id
												? 'bg-indigo-600 text-white shadow-sm'
												: 'bg-slate-100 text-slate-600 hover:bg-slate-200'}"
											on:click={() => {
												// First ensure property arrangement is set to 'owned'
												if ($calculatorStore.propertyArrangement !== 'owned') {
													calculatorStore.setPropertyArrangement('owned');
												}
												calculatorStore.setPropertyOwner(person.id);
											}}
											aria-pressed={$calculatorStore.propertyOwnerId === person.id}
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
								<span class="mb-2 block text-xs font-semibold text-slate-700">
									Market Rent ({timeframe === 'yearly' ? 'Yearly' : 'Monthly'})
								</span>
								<div class="input-group">
									<span class="absolute top-1/2 left-3 -translate-y-1/2 font-medium text-slate-400"
										>{currencySymbol}</span
									>
									<input
										type="number"
										value={$calculatorStore.marketRent}
										on:input={(e) =>
											calculatorStore.update((s) => ({
												...s,
												marketRent: Math.max(0, Number((e.target as HTMLInputElement).value) || 0)
											}))}
										placeholder="Fair market rent"
										class="input-currency pl-8 text-sm"
										step="100"
										min="0"
									/>
								</div>
							</label>
						</div>
					</div>

					<!-- Property Logic Explanation -->
					{#if $calculatorStore.propertyOwnerId && $calculatorStore.marketRent > 0}
						{@const owner = $calculatorStore.people.find(
							(p) => p.id === $calculatorStore.propertyOwnerId
						)}
						{@const nonOwners = $calculatorStore.people.filter(
							(p) => p.id !== $calculatorStore.propertyOwnerId
						)}
						{@const rentPerNonOwner =
							($calculatorStore.marketRent * conversionFactor * 0.5) / nonOwners.length}

						<div class="mt-3 overflow-hidden rounded-lg border border-amber-200 bg-amber-50">
							<button
								type="button"
								on:click={() => (showPropertyExplanation = !showPropertyExplanation)}
								class="flex w-full items-center justify-between p-3 text-left transition-colors hover:bg-amber-100"
							>
								<span class="text-xs font-semibold text-amber-900"> How this works </span>
								<span
									class="text-amber-600 transition-transform {showPropertyExplanation
										? 'rotate-180'
										: ''}"
								>
									▼
								</span>
							</button>

							{#if showPropertyExplanation}
								<div class="px-3 pb-3" transition:slide>
									<ul class="ml-4 list-disc space-y-1 text-xs text-amber-800">
										<li>
											<strong>{owner?.name}</strong> receives
											<span class="font-semibold"
												>{formatCurrency(
													$calculatorStore.marketRent * conversionFactor,
													$calculatorStore.currency,
													timeframe
												)}</span
											> as imputed income (market rent value)
										</li>
										{#each nonOwners as nonOwner}
											<li>
												<strong>{nonOwner.name}</strong> pays
												<span class="font-semibold"
													>{formatCurrency(
														rentPerNonOwner,
														$calculatorStore.currency,
														timeframe
													)}</span
												>
												to the owner ({(50 / nonOwners.length).toFixed(0)}% of market rent)
											</li>
										{/each}
										<li>
											This ensures the owner doesn't subsidize non-owners' housing consumption
										</li>
									</ul>
								</div>
							{/if}
						</div>
					{/if}
				</div>
			{/if}
		</div>

		<!-- Instructions -->
		{#if showQuickStart}
			<div class="relative mb-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
				<button
					on:click={() => (showQuickStart = false)}
					class="absolute top-2 right-2 text-blue-600 hover:text-blue-800"
					aria-label="Close quick start guide"
				>
					×
				</button>
				<div class="flex items-start gap-3">
					<span class="text-lg text-blue-600">💡</span>
					<div>
						<h3 class="mb-1 text-sm font-semibold text-blue-900">Quick Start Guide</h3>
						<ol class="list-inside list-decimal space-y-0.5 text-xs text-blue-800">
							<li>Set timeframe (monthly/yearly) - this affects all inputs below</li>
							<li>Enter shared expenses (excludes rent if one partner owns property)</li>
							<li>If applicable, set property ownership and market rent</li>
							<li>Enable optional features in the sidebar</li>
							<li>Fill in income details for each partner</li>
							<li>Review fair contribution percentages in results</li>
						</ol>
					</div>
				</div>
			</div>
		{/if}

		<!-- Main Grid Layout -->
		<div class="grid grid-cols-1 gap-4 lg:grid-cols-[300px,1fr]">
			<!-- Feature Toggles Sidebar -->
			<aside class="space-y-4">
				<!-- FIXED: Not sticky anymore, just normal positioning -->
				<div class="space-y-4">
					<FeatureToggles />

					<!-- Fairness Test -->
					<div class="card border-amber-200 bg-amber-50 p-4">
						<div class="flex items-start gap-3">
							<span class="text-2xl text-amber-600">⚖️</span>
							<div>
								<h4 class="mb-2 text-sm font-semibold text-amber-900">The Fairness Test</h4>
								<p class="text-xs leading-relaxed text-amber-800">
									"Would this feel fair if we broke up tomorrow?"
								</p>
								<p class="mt-2 text-xs text-amber-700 italic">
									If not, adjust the parameters until both partners feel the arrangement is
									equitable.
								</p>
							</div>
						</div>
					</div>
				</div>
			</aside>

			<!-- Partners Section -->
			<div class="space-y-4">
				<div class="flex items-center justify-between">
					<h2 class="text-lg font-bold text-slate-900">Partner Details</h2>
					<button
						type="button"
						on:click={() => calculatorStore.addPartner()}
						class="btn-primary text-sm"
					>
						+ Add Partner
					</button>
				</div>

				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					{#each $calculatorStore.people as person (person.id)}
						<PartnerColumn {person} currency={$calculatorStore.currency} />
					{/each}
				</div>
			</div>
		</div>

		<!-- Results Panel -->
		{#if results.length > 0 && sharedExpensesMonthly > 0}
			<div class="card mt-6 p-6">
				<h2 class="mb-6 text-lg font-bold text-slate-900">📊 Calculation Results</h2>

				<!-- FIXED: Results now span full width -->
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					{#each results as result}
						{@const person = $calculatorStore.people.find((p) => p.id === result.personId)}
						{#if person}
							<ResultCard {result} personName={person.name} />
						{/if}
					{/each}
				</div>

				<div class="mt-6 border-t border-slate-200 pt-6">
					<div class="grid grid-cols-1 gap-4 text-center sm:grid-cols-3">
						<div class="group">
							<div
								class="text-xl font-bold text-slate-900 transition-colors group-hover:text-indigo-600"
							>
								{formatCurrency(totalCapacity, $calculatorStore.currency, timeframe)}
								{getTimeframeLabel(timeframe)}
							</div>
							<div class="text-xs tracking-wide text-slate-500 uppercase">Combined Capacity</div>
						</div>
						<div class="group">
							<div class="text-xl font-bold text-indigo-600">
								{formatCurrency(sharedExpensesMonthly, $calculatorStore.currency, timeframe)}
								{getTimeframeLabel(timeframe)}
							</div>
							<div class="text-xs tracking-wide text-slate-500 uppercase">Shared Expenses</div>
						</div>
						<div class="group">
							<div
								class="text-xl font-bold {remainingCapacity >= 0
									? 'text-emerald-600'
									: 'text-red-600'}"
							>
								{formatCurrency(remainingCapacity, $calculatorStore.currency, timeframe)}
								{getTimeframeLabel(timeframe)}
							</div>
							<div class="text-xs tracking-wide text-slate-500 uppercase">
								{remainingCapacity >= 0 ? 'Remaining' : 'Over Budget'}
							</div>
						</div>
					</div>

					{#if remainingCapacity < 0}
						<div class="mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
							<p class="text-xs text-red-800">
								<strong>⚠️ Warning:</strong> Shared expenses exceed combined capacity. Consider reducing
								expenses or increasing income.
							</p>
						</div>
					{/if}
				</div>
			</div>
		{/if}
	</main>
</div>
