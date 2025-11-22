<script lang="ts">
	import { onMount } from 'svelte';
	import { calculatorStore } from '$lib/stores/calculatorStore';
	import { uiStore } from '$lib/stores/uiStore';
	import { CalculationService } from '$lib/services/calculationService';
	import FeatureToggles from '$lib/components/FeatureToggles.svelte';
	import PartnerColumn from '$lib/components/PartnerColumn.svelte';
	import ResultCard from '$lib/components/ResultCard.svelte';
	import CurrencySelector from '$lib/components/CurrencySelector.svelte';
	import PropertyArrangement from '$lib/components/PropertyArrangement.svelte';
	import { fade, fly } from 'svelte/transition';

	import { formatCurrency, getTimeframeLabel, getCurrencySymbol } from '$lib/utils/formatters';

	let fileInput: HTMLInputElement;
	let showImportSuccess = false;
	let showImportError = false;
	let showQuickStart = true;
	let darkMode = false;

	$: results = CalculationService.calculate($calculatorStore);
	$: timeframe = $calculatorStore.timeframe;

	$: conversionFactor = $calculatorStore.timeframe === 'yearly' ? 1 / 12 : 1;
	$: sharedExpensesMonthly = $calculatorStore.sharedExpenses * conversionFactor;
	$: totalCapacity = results.reduce((sum, r) => sum + r.monthlyCapacity, 0);
	$: remainingCapacity = totalCapacity - sharedExpensesMonthly;
	$: currencySymbol = getCurrencySymbol($calculatorStore.currency);

	function toggleDarkMode() {
		darkMode = !darkMode;
		if (darkMode) {
			document.documentElement.classList.add('dark');
			localStorage.setItem('theme', 'dark');
		} else {
			document.documentElement.classList.remove('dark');
			localStorage.setItem('theme', 'light');
		}
	}

	function handleExport() {
		const data = calculatorStore.exportState();
		const blob = new Blob([data], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		// Use a simpler date format to avoid potential browser/OS issues with colons or other characters
		const date = new Date().toISOString().split('T')[0];
		a.download = `financial-calculator-${date}.json`;
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
			uiStore.resetUI();
		}
	}

	onMount(() => {
		calculatorStore.setActiveSection('inheritance');

		// Check for saved theme preference or system preference
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
	<!-- Header -->
	<header
		class="sticky top-0 z-50 border-b border-white/20 bg-white/95 shadow-sm backdrop-blur-md dark:bg-slate-900/95"
	>
		<div class="mx-auto max-w-7xl px-4 py-4 sm:px-6">
			<div class="flex flex-wrap items-center justify-between gap-4">
				<div class="flex items-center gap-3">
					<div
						class="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white"
					>
						<span class="text-xl">⚖️</span>
					</div>
					<div>
						<h1 class="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-white">
							FairShare
						</h1>
						<p class="text-xs font-medium text-slate-500 dark:text-slate-400">
							Financial Equity Calculator
						</p>
					</div>
				</div>

				<div class="flex flex-wrap items-center gap-3">
					<!-- Dark Mode Toggle -->
					<button
						on:click={toggleDarkMode}
						class="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
						title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
					>
						{#if darkMode}
							🌙
						{:else}
							☀️
						{/if}
					</button>

					<div class="mx-1 h-6 w-px bg-slate-200 dark:bg-slate-700"></div>

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
							class="btn-danger px-3 py-1.5 text-xs"
							title="Reset all data"
						>
							🗑️ Reset
						</button>
					</div>
				</div>
			</div>
		</div>
	</header>

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

		<!-- Global Settings Bar -->
		<div class="glass-card sticky top-[88px] z-40 mb-8 p-1">
			<div class="grid grid-cols-1 items-center gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4">
				<!-- Currency -->
				<div>
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
					<label class="block">
						<span class="label-text">Shared Expenses</span>
						<div class="input-group relative">
							<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
								<span class="font-medium text-slate-500 dark:text-slate-400">{currencySymbol}</span>
							</div>
							<input
								type="number"
								value={$calculatorStore.sharedExpenses}
								on:input={(e) =>
									calculatorStore.update((s) => ({
										...s,
										sharedExpenses: Math.max(0, Number((e.target as HTMLInputElement).value) || 0)
									}))}
								class="input-currency pl-12"
								step="100"
								min="0"
							/>
						</div>
					</label>
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

				<!-- Property Arrangement -->
				<PropertyArrangement />
			</div>
		</div>

		<!-- Instructions -->
		{#if showQuickStart}
			<div
				class="relative mb-8 rounded-2xl border border-blue-200/50 bg-blue-50/50 p-6 backdrop-blur-sm dark:border-blue-800/30 dark:bg-blue-900/10"
				in:fade
			>
				<button
					on:click={() => (showQuickStart = false)}
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
						<h3 class="mb-2 text-base font-bold text-blue-900 dark:text-blue-300">
							Quick Start Guide
						</h3>
						<ol
							class="list-inside list-decimal space-y-1 text-sm text-blue-800 dark:text-blue-200/80"
						>
							<li>
								Set <strong>timeframe</strong> (monthly/yearly) - this affects all inputs below
							</li>
							<li>
								Enter <strong>shared expenses</strong> (excludes rent if one partner owns property)
							</li>
							<li>If applicable, set <strong>property ownership</strong> and market rent</li>
							<li>
								Enable <strong>optional features</strong> in the sidebar to account for inheritance,
								loans, etc.
							</li>
							<li>Fill in <strong>income details</strong> for each partner</li>
						</ol>
					</div>
				</div>
			</div>
		{/if}

		<!-- Main Grid Layout -->
		<div class="grid grid-cols-1 gap-8 lg:grid-cols-[320px,1fr]">
			<!-- Feature Toggles Sidebar -->
			<aside class="space-y-6">
				<div class="space-y-6">
					<FeatureToggles />

					<!-- Fairness Test -->
					<div class="glass-card border-l-4 border-l-amber-400 p-6 dark:border-l-amber-500">
						<h4
							class="mb-3 text-sm font-bold tracking-wider text-slate-900 uppercase dark:text-white"
						>
							The Fairness Test
						</h4>
						<blockquote
							class="mb-3 text-sm leading-relaxed text-slate-600 italic dark:text-slate-300"
						>
							"Would this arrangement feel fair if we separated tomorrow?"
						</blockquote>
						<p class="text-xs text-slate-500 dark:text-slate-400">
							If the answer is no, adjust the parameters until both partners feel the arrangement is
							equitable.
						</p>
					</div>
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
						<PartnerColumn {person} currency={$calculatorStore.currency} />
					{/each}
				</div>
			</div>
		</div>

		<!-- Results Panel -->
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
								class="group rounded-xl p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
							>
								<div
									class="mb-1 text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400"
								>
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
								class="group rounded-xl p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
							>
								<div
									class="mb-1 text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400"
								>
									Shared Expenses
								</div>
								<div class="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
									{formatCurrency(sharedExpensesMonthly, $calculatorStore.currency, timeframe)}
								</div>
								<div class="mt-1 text-xs text-slate-400 dark:text-slate-500">
									{getTimeframeLabel(timeframe)}
								</div>
							</div>

							<div
								class="group rounded-xl p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
							>
								<div
									class="mb-1 text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400"
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
								<div class="mt-1 text-xs text-slate-400 dark:text-slate-500">
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
									<strong>Warning:</strong> Shared expenses exceed your combined financial capacity.
									You are currently over budget by {formatCurrency(
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
	</main>
</div>
