<script lang="ts">
  import { onMount } from 'svelte';
  import { calculatorStore } from '$lib/stores/calculatorStore';
  import { calculate, formatCurrency, getTimeframeLabel } from '$lib/calculator'; // Added getTimeframeLabel import
  import FeatureToggles from '$lib/components/FeatureToggles.svelte';
  import PartnerColumn from '$lib/components/PartnerColumn.svelte';
  import ResultCard from '$lib/components/ResultCard.svelte';
  import CurrencySelector from '$lib/components/CurrencySelector.svelte';
  import { slide, fade } from 'svelte/transition';

  let fileInput: HTMLInputElement;
  let showImportSuccess = false;
  let showImportError = false;

  $: results = calculate($calculatorStore);
  
  // Calculate totals based on current timeframe
  $: conversionFactor = $calculatorStore.timeframe === 'yearly' ? 1 : 1;
  $: totalSharedExpenses = $calculatorStore.sharedExpenses * conversionFactor;
  $: totalCapacity = results.reduce((sum, r) => sum + r.monthlyCapacity, 0);
  $: remainingCapacity = totalCapacity - totalSharedExpenses;

  // Import/export functions
  function handleExport() {
    const data = calculatorStore.exportState();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial-calculator-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
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
    
    // Reset file input
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
  <header class="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
    <div class="max-w-7xl mx-auto px-6 py-4">
      <div class="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 class="text-2xl font-bold text-slate-900">
            Financial Contribution Calculator
          </h1>
          <p class="text-sm text-slate-600 mt-0.5">
            Fair, proportional contributions based on true financial capacity
          </p>
        </div>
        
        <div class="flex items-center gap-4 flex-wrap">
          <!-- Export/Import Controls -->
          <div class="flex items-center gap-2">
            <button
              type="button"
              on:click={handleExport}
              class="btn-secondary text-xs px-3 py-1.5"
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
            >
              📤 Import
            </label>
            <button
              type="button"
              on:click={resetAll}
              class="btn-secondary text-xs px-3 py-1.5 text-red-600 hover:bg-red-50"
            >
              🗑️ Reset
            </button>
          </div>
          
          <!-- Total Expenses Display -->
          <div class="text-right">
            <div class="text-xs text-slate-500">Total shared expenses</div>
            <div class="text-xl font-bold text-indigo-600">
              {formatCurrency(totalSharedExpenses, $calculatorStore.currency, $calculatorStore.timeframe)} {getTimeframeLabel($calculatorStore.timeframe)}
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>

  <main class="max-w-7xl mx-auto px-6 py-6">
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

    <!-- Settings Bar -->
    <div class="card p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        <div>
          <label class="block">
            <span class="text-xs font-semibold text-slate-700 uppercase tracking-wide">Currency</span>
            <CurrencySelector
              value={$calculatorStore.currency}
              on:change={(e) => calculatorStore.update(s => ({ ...s, currency: e.detail }))}
            />
          </label>
        </div>
        
        <div>
          <label class="block">
            <span class="text-xs font-semibold text-slate-700 uppercase tracking-wide">Shared Expenses</span>
            <div class="input-group mt-1">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
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
          </label>
        </div>
        
        <div>
          <label class="block">
            <span class="text-xs font-semibold text-slate-700 uppercase tracking-wide">Timeframe</span>
            <div class="relative flex w-full mt-1 p-0.5 bg-slate-100 rounded-lg">
              <button
                type="button"
                class="w-full px-3 py-1.5 text-xs font-semibold rounded-md transition-all { $calculatorStore.timeframe === 'monthly' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900' }"
                on:click={() => calculatorStore.setTimeframe('monthly')}
                aria-pressed={$calculatorStore.timeframe === 'monthly'}
              >
                Monthly
              </button>
              <button
                type="button"
                class="w-full px-3 py-1.5 text-xs font-semibold rounded-md transition-all { $calculatorStore.timeframe === 'yearly' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900' }"
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
            <span class="text-xs font-semibold text-slate-700 uppercase tracking-wide">Property Ownership</span>
            <div class="relative flex w-full mt-1 p-0.5 bg-slate-100 rounded-lg">
              <button
                type="button"
                class="w-full px-3 py-1.5 text-xs font-semibold rounded-md transition-all { $calculatorStore.propertyArrangement === 'none' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900' }"
                on:click={() => calculatorStore.update(s => ({ ...s, propertyArrangement: 'none', propertyOwnerId: null }))}
                aria-pressed={$calculatorStore.propertyArrangement === 'none'}
              >
                No Owner
              </button>
              <button
                type="button"
                class="w-full px-3 py-1.5 text-xs font-semibold rounded-md transition-all { $calculatorStore.propertyArrangement === 'owned' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900' }"
                on:click={() => calculatorStore.update(s => ({ ...s, propertyArrangement: 'owned' }))}
                aria-pressed={$calculatorStore.propertyArrangement === 'owned'}
              >
                One Owns
              </button>
            </div>
          </label>
        </div>

        {#if $calculatorStore.propertyArrangement === 'owned'}
          <div class="lg:col-span-full pt-3 border-t border-slate-200">
            <label class="block">
              <span class="text-xs font-semibold text-slate-700 mb-2 block">Who owns the property?</span>
              <div class="flex gap-3">
                {#each $calculatorStore.people as person}
                  <button
                    type="button"
                    class="flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all {$calculatorStore.propertyOwnerId === person.id 
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
        {/if}
      </div>
    </div>

    <!-- Instructions -->
    <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
      <div class="flex items-start gap-3">
        <span class="text-blue-600 text-lg">💡</span>
        <div>
          <h3 class="font-semibold text-blue-900 text-sm mb-1">How to use:</h3>
          <ol class="text-xs text-blue-800 space-y-0.5 list-decimal list-inside">
            <li>Configure settings above</li>
            <li>Enable features in the left panel</li>
            <li>Fill in values for each partner</li>
            <li>Review results and adjust until fair</li>
          </ol>
        </div>
      </div>
    </div>

    <!-- Main Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-[280px,1fr] gap-6">
      <!-- Feature Toggles Sidebar -->
      <div class="space-y-4 lg:space-y-0">
        <FeatureToggles />
        
        <!-- Fairness Test (moved here to avoid floating) -->
        <div class="bg-amber-50 border border-amber-200 rounded-xl p-3 lg:sticky lg:top-[calc(24rem)]">
          <div class="flex items-start gap-2">
            <span class="text-amber-600">⚖️</span>
            <div>
              <h4 class="font-semibold text-amber-900 text-xs mb-1">Fairness Test</h4>
              <p class="text-xs text-amber-800">
                "Would this feel fair if we broke up tomorrow?"
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Partners Section -->
      <div class="space-y-6">
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

        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {#each $calculatorStore.people as person (person.id)}
            <PartnerColumn {person} />
          {/each}
        </div>
      </div>
    </div>

    <!-- Results Panel -->
    {#if results.length > 0 && $calculatorStore.sharedExpenses > 0}
      <div class="mt-6 card p-6">
        <h2 class="text-lg font-bold text-slate-900 mb-6">📊 Calculation Results</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {#each results as result}
            {@const person = $calculatorStore.people.find(p => p.id === result.personId)}
            {#if person}
              <ResultCard {result} personName={person.name} />
            {/if}
          {/each}
        </div>

        <div class="mt-6 pt-6 border-t border-slate-200">
          <div class="grid grid-cols-3 gap-4 text-center">
            <div class="group">
              <div class="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                {formatCurrency(totalCapacity, $calculatorStore.currency, $calculatorStore.timeframe)} {getTimeframeLabel($calculatorStore.timeframe)}
              </div>
              <div class="text-xs text-slate-500 uppercase tracking-wide">Combined Capacity</div>
            </div>
            <div class="group">
              <div class="text-xl font-bold text-indigo-600">
                {formatCurrency(totalSharedExpenses, $calculatorStore.currency, $calculatorStore.timeframe)} {getTimeframeLabel($calculatorStore.timeframe)}
              </div>
              <div class="text-xs text-slate-500 uppercase tracking-wide">Shared Expenses</div>
            </div>
            <div class="group">
              <div class="text-xl font-bold {remainingCapacity >= 0 ? 'text-emerald-600' : 'text-red-600'}">
                {formatCurrency(remainingCapacity, $calculatorStore.currency, $calculatorStore.timeframe)} {getTimeframeLabel($calculatorStore.timeframe)}
              </div>
              <div class="text-xs text-slate-500 uppercase tracking-wide">Remaining</div>
            </div>
          </div>
        </div>
      </div>
    {/if}
  </main>
</div>