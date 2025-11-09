<script lang="ts">
  import { formatCurrency, getTimeframeLabel } from '$lib/calculator';
  import type { CalculationResult } from '$lib/calculator';
  import { calculatorStore } from '$lib/stores/calculatorStore';
  import { slide } from 'svelte/transition';

  export let result: CalculationResult;
  export let personName: string;

  let showBreakdown = false;

  $: isHighContributor = result.percentage > 50;

  // Color coding for breakdown items
  function getItemStyle(type: string, category: string): string {
    const baseStyle = 'flex justify-between items-center py-1.5 px-2 rounded hover:bg-slate-50';
    
    switch (type) {
      case 'income':
        return `${baseStyle} text-green-700 border-l-2 border-green-300`;
      case 'deduction':
        return `${baseStyle} text-red-700 border-l-2 border-red-300`;
      case 'imputed':
        // Different colors for different imputed categories
        const colorMap: Record<string, string> = {
          'inheritance': 'text-blue-700 border-l-2 border-blue-300',
          'advantages': 'text-purple-700 border-l-2 border-purple-300',
          'future-inheritance': 'text-indigo-700 border-l-2 border-indigo-300',
          'property': 'text-amber-700 border-l-2 border-amber-300',
          'default': 'text-orange-700 border-l-2 border-orange-300',
        };
        return `${baseStyle} ${colorMap[category] || colorMap['default']}`;
      default:
        return baseStyle;
    }
  }
</script>

<div class="card p-5 hover:shadow-lg transition-all">
  <h3 class="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
    <span class="w-2 h-2 rounded-full {isHighContributor ? 'bg-indigo-600' : 'bg-slate-400'}"></span>
    {personName}
  </h3>
  
  <dl class="space-y-3 text-sm">
    <!-- Total Capacity First -->
    <div class="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
      <dt class="text-slate-600 font-medium">Total Capacity</dt>
      <dd class="font-bold text-blue-900 flex items-baseline gap-1">
        <span>{formatCurrency(result.monthlyCapacity, $calculatorStore.currency, 'monthly')}</span>
        <span class="text-xs text-slate-500">{getTimeframeLabel('monthly')}</span>
      </dd>
    </div>
    
    <!-- Contribution -->
    <div class="flex justify-between items-center p-3 {isHighContributor ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-200'} rounded-lg border">
      <dt class="text-slate-600 font-medium">Contribution</dt>
      <dd class="font-bold {isHighContributor ? 'text-indigo-900' : 'text-slate-700'} flex items-baseline gap-1">
        <span>{formatCurrency(result.monthlyContribution, $calculatorStore.currency, 'monthly')}</span>
        <span class="text-xs text-slate-500">{getTimeframeLabel('monthly')}</span>
        <span class="text-xs font-semibold ml-1">({result.percentage.toFixed(1)}%)</span>
      </dd>
    </div>
    
    <!-- Disposable Income -->
    <div class="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
      <dt class="text-slate-600 font-medium">Disposable Income</dt>
      <dd class="font-bold text-green-900 flex items-baseline gap-1">
        <span>{formatCurrency(result.monthlyDisposable, $calculatorStore.currency, 'monthly')}</span>
        <span class="text-xs text-slate-500">{getTimeframeLabel('monthly')}</span>
      </dd>
    </div>
  </dl>

  <button
    type="button"
    on:click={() => showBreakdown = !showBreakdown}
    class="mt-4 w-full text-xs text-slate-500 hover:text-slate-700 font-medium flex items-center justify-between py-2 border-t border-slate-200"
  >
    <span>{showBreakdown ? 'Hide' : 'Show'} calculation breakdown</span>
    <span class="transition-transform {showBreakdown ? 'rotate-180' : ''}">▼</span>
  </button>

  {#if showBreakdown}
    <div transition:slide class="mt-3 pt-3 border-t border-slate-200">
      <div class="space-y-1 text-xs">
        {#each result.breakdown as item}
          <div class={getItemStyle(item.type, item.category)}>
            <span class="font-medium">{item.label}</span>
            <span class="font-semibold">
              {item.type === 'deduction' ? '-' : '+'}
              {formatCurrency(Math.abs(item.amount), $calculatorStore.currency, 'monthly')}
            </span>
          </div>
        {/each}
      </div>
      
      <!-- Legend -->
      <div class="mt-3 pt-2 border-t border-slate-200 grid grid-cols-3 gap-2 text-[10px] text-slate-600">
        <div class="flex items-center gap-1">
          <span class="w-2 h-2 bg-green-300 rounded"></span>
          <span>Income</span>
        </div>
        <div class="flex items-center gap-1">
          <span class="w-2 h-2 bg-red-300 rounded"></span>
          <span>Deduction</span>
        </div>
        <div class="flex items-center gap-1">
          <span class="w-2 h-2 bg-blue-300 rounded"></span>
          <span>Imputed Income</span>
        </div>
      </div>
    </div>
  {/if}
</div>