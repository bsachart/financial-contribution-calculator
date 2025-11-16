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
          setTimeout(() => showImportSuccess = false, 3000);
        } else {
          showImportError = true;
          setTimeout(() => showImportError = false, 3000);
        }
      } catch (error) {
        console.error('Import failed:', error);
        showImportError = true;
        setTimeout(() => showImportError = false, 3000);
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
  <header class="bg-white/95 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50 shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-3">
      <div class="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 class="text-xl sm:text-2xl font-bold text-slate-900">
            Financial Contribution Calculator
          </h1>
          <p class="text-xs sm:text-sm text-slate-600 mt-0.5">
            Fair, proportional contributions based on true financial capacity
          </p>
        </div>
        
        <div class="flex items-center gap-3 flex-wrap">
          <!-- Export/Import/Reset Controls -->
          <div class="flex items-center gap-2">
            <button
              type="button"
              on:click={handleExport}
              class="btn-secondary text-xs px-3 py-1.5"
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
              class="btn-secondary text-xs px-3 py-1.5 cursor-pointer"
              title="Import configuration"
            >
              📤 Import
            </label>
            <button
              type="button"
              on:click={resetAll}
              class="btn-secondary text-xs px-3 py-1.5 text-red-600 hover:bg-red-50"
              title="Reset all data"
            >
              🗑️ Reset
            </button>
          </div>
          
          <!-- Total Expenses Display -->
          <div class="text-right">
            <div class="text-xs text-slate-500">Total shared expenses</div>
            <div class="text-lg sm:text-xl font-bold text-indigo-600">
              {formatCurrency(sharedExpensesMonthly, $calculatorStore.currency, timeframe)} {getTimeframeLabel(timeframe)}
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>

  <main class="max-w-7xl mx-auto px-4 sm:px-6 py-4">
    <!-- Import/Export Messages -->
    {#if showImportSuccess}
      <div in:fade out:fade class="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
        ✅ Data imported successfully!
      </div>
    {/if}
    
    {#if showImportError}
      <div in:fade out:fade class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
        ❌ Failed to import data. Please check the file format.
      </div>
    {/if}

    <!-- Sticky Settings Bar -->
    <div class="card p-4 mb-4 sticky top-[72px] z-40 bg-white/95 backdrop-blur-sm">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
        <div>
          <label class="block">
            <span class="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1 block">Currency</span>
            <CurrencySelector
              value={$calculatorStore.currency}
              on:change={(e) => {
                calculatorStore.update(s => ({ ...s, currency: e.detail }));
              }}
            />
          </label>
        </div>
        
        <div>
          <label class="block">
            <span class="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1 block">Shared Expenses</span>
            <div class="input-group">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">{currencySymbol}</span>
              <input
                type="number"
                value={$calculatorStore.sharedExpenses}
                on:input={(e) => calculatorStore.update(s => ({ 
                  ...s, 
                  sharedExpenses: Math.max(0, Number((e.target as HTMLInputElement).value) || 0) 
                }))}
                class="input-currency text-sm pl-8"
                step="100"
                min="0"
              />
            </div>
            {#if $calculatorStore.propertyArrangement === 'owned'}
              <p class="text-xs text-amber-600 mt-1 font-medium">
                ⚠️ Excludes rent/mortgage (utilities & insurance only)
              </p>
            {:else}
              <p class="text-xs text-slate-500 mt-1">
                All shared living costs
              </p>
            {/if}
          </label>
        </div>
        
        <div>
          <label class="block">
            <span class="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1 block">Timeframe</span>
            <div class="relative flex w-full p-0.5 bg-slate-100 rounded-lg">
              <button
                type="button"
                class="w-full px-3 py-1.5 text-xs font-semibold rounded-md transition-all {$calculatorStore.timeframe === 'monthly' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'}"
                on:click={() => calculatorStore.setTimeframe('monthly')}
                aria-pressed={$calculatorStore.timeframe === 'monthly'}
              >
                Monthly
              </button>
              <button
                type="button"
                class="w-full px-3 py-1.5 text-xs font-semibold rounded-md transition-all {$calculatorStore.timeframe === 'yearly' 
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
            <span class="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1 block">Property</span>
            <div class="relative flex w-full p-0.5 bg-slate-100 rounded-lg">
              <button
                type="button"
                class="w-full px-3 py-1.5 text-xs font-semibold rounded-md transition-all {$calculatorStore.propertyArrangement === 'none' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'}"
                on:click={() => calculatorStore.update(s => ({ ...s, propertyArrangement: 'none', propertyOwnerId: null }))}
                aria-pressed={$calculatorStore.propertyArrangement === 'none'}
              >
                Renting
              </button>
              <button
                type="button"
                class="w-full px-3 py-1.5 text-xs font-semibold rounded-md transition-all {$calculatorStore.propertyArrangement === 'owned' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'}"
                on:click={() => calculatorStore.update(s => ({ ...s, propertyArrangement: 'owned' }))}
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
        <div class="mt-4 pt-4 border-t border-slate-200">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <!-- Who owns -->
            <div>
              <label class="block">
                <span class="text-xs font-semibold text-slate-700 mb-2 block">Property Owner</span>
                <div class="flex gap-2 flex-wrap">
                  {#each $calculatorStore.people as person}
                    <button
                      type="button"
                      class="flex-1 min-w-[100px] px-3 py-2 rounded-lg text-sm font-semibold transition-all {$calculatorStore.propertyOwnerId === person.id 
                        ? 'bg-indigo-600 text-white shadow-sm' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}"
                      on:click={() => calculatorStore.update(s => ({ ...s, propertyOwnerId: person.id }))}
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
                <span class="text-xs font-semibold text-slate-700 mb-2 block">
                  Market Rent ({timeframe === 'yearly' ? 'Yearly' : 'Monthly'})
                </span>
                <div class="input-group">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                  <input
                    type="number"
                    value={$calculatorStore.marketRent}
                    on:input={(e) => calculatorStore.update(s => ({ ...s, marketRent: Math.max(0, Number((e.target as HTMLInputElement).value) || 0) }))}
                    placeholder="Fair market rent"
                    class="input-currency text-sm pl-8"
                    step="100"
                    min="0"
                  />
                </div>
              </label>
            </div>
          </div>

          <!-- Property Logic Explanation -->
          {#if $calculatorStore.propertyOwnerId && $calculatorStore.marketRent > 0}
            {@const owner = $calculatorStore.people.find(p => p.id === $calculatorStore.propertyOwnerId)}
            {@const nonOwners = $calculatorStore.people.filter(p => p.id !== $calculatorStore.propertyOwnerId)}
            {@const rentPerNonOwner = ($calculatorStore.marketRent * conversionFactor * 0.5) / nonOwners.length}
            
            <div class="mt-3 bg-amber-50 border border-amber-200 rounded-lg overflow-hidden">
              <button
                type="button"
                on:click={() => showPropertyExplanation = !showPropertyExplanation}
                class="w-full p-3 flex items-center justify-between text-left hover:bg-amber-100 transition-colors"
              >
                <span class="text-xs font-semibold text-amber-900">
                  How this works
                </span>
                <span class="text-amber-600 transition-transform {showPropertyExplanation ? 'rotate-180' : ''}">
                  ▼
                </span>
              </button>
              
              {#if showPropertyExplanation}
                <div class="px-3 pb-3" transition:slide>
                  <ul class="text-xs text-amber-800 space-y-1 ml-4 list-disc">
                    <li><strong>{owner?.name}</strong> receives <span class="font-semibold">{formatCurrency($calculatorStore.marketRent * conversionFactor, $calculatorStore.currency, timeframe)}</span> as imputed income (market rent value)</li>
                    {#each nonOwners as nonOwner}
                      <li><strong>{nonOwner.name}</strong> pays <span class="font-semibold">{formatCurrency(rentPerNonOwner, $calculatorStore.currency, timeframe)}</span> to the owner ({(50 / nonOwners.length).toFixed(0)}% of market rent)</li>
                    {/each}
                    <li>This ensures the owner doesn't subsidize non-owners' housing consumption</li>
                  </ul>
                </div>
              {/if}
            </div>
          {/if}
        </div>
      {/if}
    </div>

    <!-- Instructions -->
    <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
      <div class="flex items-start gap-3">
        <span class="text-blue-600 text-lg">💡</span>
        <div>
          <h3 class="font-semibold text-blue-900 text-sm mb-1">Quick Start Guide</h3>
          <ol class="text-xs text-blue-800 space-y-0.5 list-decimal list-inside">
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

    <!-- Main Grid Layout -->
    <div class="grid grid-cols-1 lg:grid-cols-[300px,1fr] gap-4">
      <!-- Feature Toggles Sidebar -->
      <aside class="space-y-4">
        <!-- FIXED: Not sticky anymore, just normal positioning -->
        <div class="space-y-4">
          <FeatureToggles />
          
          <!-- Fairness Test -->
          <div class="card p-4 bg-amber-50 border-amber-200">
            <div class="flex items-start gap-3">
              <span class="text-amber-600 text-2xl">⚖️</span>
              <div>
                <h4 class="font-semibold text-amber-900 text-sm mb-2">The Fairness Test</h4>
                <p class="text-xs text-amber-800 leading-relaxed">
                  "Would this feel fair if we broke up tomorrow?"
                </p>
                <p class="text-xs text-amber-700 mt-2 italic">
                  If not, adjust the parameters until both partners feel the arrangement is equitable.
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

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          {#each $calculatorStore.people as person (person.id)}
            <PartnerColumn {person} />
          {/each}
        </div>
      </div>
    </div>

    <!-- Results Panel -->
    {#if results.length > 0 && sharedExpensesMonthly > 0}
      <div class="mt-6 card p-6">
        <h2 class="text-lg font-bold text-slate-900 mb-6">📊 Calculation Results</h2>

        <!-- FIXED: Results now span full width -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          {#each results as result}
            {@const person = $calculatorStore.people.find(p => p.id === result.personId)}
            {#if person}
              <ResultCard {result} personName={person.name} />
            {/if}
          {/each}
        </div>

        <div class="mt-6 pt-6 border-t border-slate-200">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div class="group">
              <div class="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                {formatCurrency(totalCapacity, $calculatorStore.currency, timeframe)} {getTimeframeLabel(timeframe)}
              </div>
              <div class="text-xs text-slate-500 uppercase tracking-wide">Combined Capacity</div>
            </div>
            <div class="group">
              <div class="text-xl font-bold text-indigo-600">
                {formatCurrency(sharedExpensesMonthly, $calculatorStore.currency, timeframe)} {getTimeframeLabel(timeframe)}
              </div>
              <div class="text-xs text-slate-500 uppercase tracking-wide">Shared Expenses</div>
            </div>
            <div class="group">
              <div class="text-xl font-bold {remainingCapacity >= 0 ? 'text-emerald-600' : 'text-red-600'}">
                {formatCurrency(remainingCapacity, $calculatorStore.currency, timeframe)} {getTimeframeLabel(timeframe)}
              </div>
              <div class="text-xs text-slate-500 uppercase tracking-wide">
                {remainingCapacity >= 0 ? 'Remaining' : 'Over Budget'}
              </div>
            </div>
          </div>

          {#if remainingCapacity < 0}
            <div class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p class="text-xs text-red-800">
                <strong>⚠️ Warning:</strong> Shared expenses exceed combined capacity. Consider reducing expenses or increasing income.
              </p>
            </div>
          {/if}
        </div>
      </div>
    {/if}
  </main>
</div>