<script lang="ts">
  import { calculatorStore } from '$lib/stores/calculatorStore';
  import { FIELDS } from '$lib/config/formConfig';
  import type { Person } from '$lib/stores/calculatorStore';
  import { slide } from 'svelte/transition';

  export let person: Person;

  $: timeframe = $calculatorStore.timeframe;
  $: enabledSections = $calculatorStore.enabledSections;
  $: netIncomeField = FIELDS.netIncome(timeframe);

  function updateField<K extends keyof Person>(key: K, value: Person[K]) {
    calculatorStore.updatePerson(person.id, key, value);
  }

  // Group sections by type for better organization
  $: inheritanceFields = {
    passiveAdvantages: FIELDS.passiveAdvantages,
    passiveAdvantagesDiscount: FIELDS.passiveAdvantagesDiscount,
    passiveAdvantagesReturnRate: FIELDS.passiveAdvantagesReturnRate,
    expectedFutureInheritance: FIELDS.expectedFutureInheritance,
    expectedFutureInheritanceDiscount: FIELDS.expectedFutureInheritanceDiscount,
  };

  $: debtFields = {
    studentLoans: FIELDS.studentLoans(timeframe),
    familySupport: FIELDS.familySupport(timeframe),
  };

  $: variableFields = {
    variableIncome: FIELDS.variableIncome,
    variableIncomeDiscount: FIELDS.variableIncomeDiscount,
  };

  $: retirementFields = {
    retirementMatching: FIELDS.retirementMatching(timeframe),
  };
</script>

<div class="card p-5 min-w-[320px]">
  <!-- Header with name editing -->
  <div class="flex items-center justify-between mb-5 pb-4 border-b border-slate-200">
    <label for="name-{person.id}" class="sr-only">Partner name</label>
    <input
      id="name-{person.id}"
      type="text"
      value={person.name}
      on:input={(e) => updateField('name', (e.target as HTMLInputElement).value)}
      class="text-lg font-bold bg-slate-50 rounded-lg px-3 py-2 border-0 focus:ring-2 focus:ring-indigo-500 w-full"
      placeholder="Enter name"
    />
    {#if $calculatorStore.people.length > 2}
      <button
        type="button"
        on:click={() => calculatorStore.removePartner(person.id)}
        class="ml-3 text-red-500 hover:text-red-600 font-bold text-xl transition-colors"
        aria-label="Remove {person.name}"
      >
        ×
      </button>
    {/if}
  </div>

  <!-- Income Section (always visible) -->
  <div class="mb-6">
    <label for="netIncome-{person.id}" class="block">
      <span class="text-sm font-semibold text-slate-700">{netIncomeField.label}</span>
      <div class="input-group mt-1">
        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
        <input
          id="netIncome-{person.id}"
          type="number"
          value={person.netIncome}
          on:input={(e) => updateField('netIncome', Number((e.target as HTMLInputElement).value) || 0)}
          placeholder="0"
          step={netIncomeField.step}
          class="input-currency text-sm pl-8"
          min="0"
        />
      </div>
      {#if netIncomeField.help}
        <p class="text-xs text-slate-500 mt-1">{netIncomeField.help}</p>
      {/if}
    </label>
  </div>

  <!-- Inheritance Section -->
  {#if enabledSections.includes('inheritance')}
    <div class="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-4">
      <h4 class="font-semibold text-indigo-900 mb-3 flex items-center gap-2">
        <span class="text-lg">🏛️</span>
        Inheritance & Advantages
      </h4>
      
      <div class="space-y-4">
        <!-- Multiple Direct Inheritances -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-slate-700">Direct Inheritances</span>
            <button
              type="button"
              on:click={() => calculatorStore.addInheritance(person.id)}
              class="text-xs text-indigo-600 hover:text-indigo-700 font-semibold"
            >
              + Add
            </button>
          </div>
          
          {#if person.inheritances && person.inheritances.length > 0}
            <div class="space-y-3">
              {#each person.inheritances as inheritance (inheritance.id)}
                <div class="bg-white rounded-lg p-3 border border-slate-200" transition:slide>
                  <div class="flex items-center justify-between mb-2">
                    <label for="inheritance-name-{inheritance.id}" class="sr-only">Inheritance name</label>
                    <input
                      id="inheritance-name-{inheritance.id}"
                      type="text"
                      value={inheritance.name}
                      on:input={(e) => 
                        calculatorStore.updateInheritance(person.id, inheritance.id, { 
                          name: (e.target as HTMLInputElement).value 
                        })
                      }
                      class="text-xs font-semibold text-slate-700 bg-transparent border-b border-dashed border-slate-300 focus:border-indigo-500 focus:outline-none"
                      placeholder="Inheritance name"
                    />
                    <button
                      type="button"
                      on:click={() => calculatorStore.removeInheritance(person.id, inheritance.id)}
                      class="text-red-500 hover:text-red-600 text-sm"
                      aria-label="Remove inheritance"
                    >
                      ×
                    </button>
                  </div>
                  
                  <div class="space-y-2">
                    <div>
                      <label for="inheritance-amount-{inheritance.id}" class="text-xs text-slate-600">Amount</label>
                      <div class="input-group mt-1">
                        <span class="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                        <input
                          id="inheritance-amount-{inheritance.id}"
                          type="number"
                          value={inheritance.amount}
                          on:input={(e) => 
                            calculatorStore.updateInheritance(person.id, inheritance.id, { 
                              amount: Number((e.target as HTMLInputElement).value) || 0 
                            })
                          }
                          class="w-full pl-6 pr-2 py-1.5 text-sm rounded border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                          step="1000"
                          min="0"
                        />
                      </div>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-2">
                      <div>
                        <label for="inheritance-discount-{inheritance.id}" class="text-xs text-slate-600">Discount %</label>
                        <div class="flex items-center gap-2 mt-1">
                          <input
                            id="inheritance-discount-{inheritance.id}"
                            type="number"
                            value={inheritance.discount}
                            on:input={(e) => 
                              calculatorStore.updateInheritance(person.id, inheritance.id, { 
                                discount: Math.max(0, Math.min(100, Number((e.target as HTMLInputElement).value) || 0)) 
                              })
                            }
                            class="w-16 px-2 py-1.5 text-sm rounded border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                            min="0"
                            max="100"
                            step="5"
                          />
                          <span class="text-xs text-slate-500">({100 - inheritance.discount}%)</span>
                        </div>
                      </div>
                      
                      <div>
                        <label for="inheritance-rate-{inheritance.id}" class="text-xs text-slate-600">Return %</label>
                        <input
                          id="inheritance-rate-{inheritance.id}"
                          type="number"
                          value={inheritance.returnRate}
                          on:input={(e) => 
                            calculatorStore.updateInheritance(person.id, inheritance.id, { 
                              returnRate: Math.max(0, Math.min(100, Number((e.target as HTMLInputElement).value) || 5.5)) 
                            })
                          }
                          class="w-16 px-2 py-1.5 text-sm rounded border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                          min="0"
                          max="100"
                          step="0.5"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          {:else}
            <p class="text-xs text-slate-500 italic">No inheritances added</p>
          {/if}
        </div>

        <!-- Passive Advantages -->
        <div>
          <label for="passiveAdvantages-{person.id}" class="block">
            <span class="text-sm font-medium text-slate-700">{inheritanceFields.passiveAdvantages.label}</span>
            <div class="input-group mt-1">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
              <input
                id="passiveAdvantages-{person.id}"
                type="number"
                value={person.passiveAdvantages}
                on:input={(e) => updateField('passiveAdvantages', Number((e.target as HTMLInputElement).value) || 0)}
                placeholder="0"
                step="1000"
                class="input-currency text-sm pl-8"
                min="0"
              />
            </div>
            <div class="grid grid-cols-2 gap-2 mt-2">
              <div>
                <label for="passiveAdvantagesDiscount-{person.id}" class="text-xs text-slate-600">Discount %</label>
                <div class="flex items-center gap-2 mt-1">
                  <input
                    id="passiveAdvantagesDiscount-{person.id}"
                    type="number"
                    value={person.passiveAdvantagesDiscount}
                    on:input={(e) => updateField('passiveAdvantagesDiscount', Math.max(0, Math.min(100, Number((e.target as HTMLInputElement).value) || 70)))}
                    class="w-16 px-2 py-1 text-sm rounded border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    min="0"
                    max="100"
                    step="5"
                  />
                  <span class="text-xs text-slate-500">({100 - person.passiveAdvantagesDiscount}%)</span>
                </div>
              </div>
              <div>
                <label for="passiveAdvantagesReturnRate-{person.id}" class="text-xs text-slate-600">Return %</label>
                <input
                  id="passiveAdvantagesReturnRate-{person.id}"
                  type="number"
                  value={person.passiveAdvantagesReturnRate}
                  on:input={(e) => updateField('passiveAdvantagesReturnRate', Math.max(0, Math.min(100, Number((e.target as HTMLInputElement).value) || 5.5)))}
                  class="w-16 px-2 py-1 text-sm rounded border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  min="0"
                  max="100"
                  step="0.5"
                />
              </div>
            </div>
            {#if inheritanceFields.passiveAdvantages.help}
              <p class="text-xs text-slate-500 mt-1">{inheritanceFields.passiveAdvantages.help}</p>
            {/if}
          </label>
        </div>

        <!-- Expected Future Inheritance -->
        <div>
          <label for="futureInheritance-{person.id}" class="block">
            <span class="text-sm font-medium text-slate-700">{inheritanceFields.expectedFutureInheritance.label}</span>
            <div class="input-group mt-1">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
              <input
                id="futureInheritance-{person.id}"
                type="number"
                value={person.expectedFutureInheritance}
                on:input={(e) => updateField('expectedFutureInheritance', Number((e.target as HTMLInputElement).value) || 0)}
                placeholder="0"
                step="1000"
                class="input-currency text-sm pl-8"
                min="0"
              />
            </div>
            <div class="flex items-center gap-2 mt-2">
              <label for="futureInheritanceDiscount-{person.id}" class="text-xs text-slate-600">Discount %:</label>
              <input
                id="futureInheritanceDiscount-{person.id}"
                type="number"
                value={person.expectedFutureInheritanceDiscount}
                on:input={(e) => updateField('expectedFutureInheritanceDiscount', Math.max(0, Math.min(100, Number((e.target as HTMLInputElement).value) || 50)))}
                class="w-20 px-2 py-1 text-sm rounded border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                min="0"
                max="100"
                step="5"
              />
              <span class="text-xs text-slate-500">({100 - person.expectedFutureInheritanceDiscount}%)</span>
            </div>
            {#if inheritanceFields.expectedFutureInheritance.help}
              <p class="text-xs text-slate-500 mt-1">{inheritanceFields.expectedFutureInheritance.help}</p>
            {/if}
          </label>
        </div>
      </div>
    </div>
  {/if}

  <!-- Debt Section -->
  {#if enabledSections.includes('debt')}
    <div class="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
      <h4 class="font-semibold text-red-900 mb-3 flex items-center gap-2">
        <span class="text-lg">💳</span>
        Obligations & Debt
      </h4>
      
      <div class="space-y-4">
        <label for="studentLoans-{person.id}" class="block">
          <span class="text-sm font-medium text-slate-700">{debtFields.studentLoans.label}</span>
          <div class="input-group mt-1">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
            <input
              id="studentLoans-{person.id}"
              type="number"
              value={person.studentLoans}
              on:input={(e) => updateField('studentLoans', Number((e.target as HTMLInputElement).value) || 0)}
              placeholder="0"
              step={debtFields.studentLoans.step}
              class="input-currency text-sm pl-8"
              min="0"
            />
          </div>
          {#if debtFields.studentLoans.help}
            <p class="text-xs text-slate-500 mt-1">{debtFields.studentLoans.help}</p>
          {/if}
        </label>

        <label for="familySupport-{person.id}" class="block">
          <span class="text-sm font-medium text-slate-700">{debtFields.familySupport.label}</span>
          <div class="input-group mt-1">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
            <input
              id="familySupport-{person.id}"
              type="number"
              value={person.familySupport}
              on:input={(e) => updateField('familySupport', Number((e.target as HTMLInputElement).value) || 0)}
              placeholder="0"
              step={debtFields.familySupport.step}
              class="input-currency text-sm pl-8"
              min="0"
            />
          </div>
          {#if debtFields.familySupport.help}
            <p class="text-xs text-slate-500 mt-1">{debtFields.familySupport.help}</p>
          {/if}
        </label>
      </div>
    </div>
  {/if}

  <!-- Variable Income Section -->
  {#if enabledSections.includes('variable')}
    <div class="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-4">
      <h4 class="font-semibold text-purple-900 mb-3 flex items-center gap-2">
        <span class="text-lg">📈</span>
        Variable Income
      </h4>
      
      <div class="space-y-4">
        <label for="variableIncome-{person.id}" class="block">
          <span class="text-sm font-medium text-slate-700">{variableFields.variableIncome.label}</span>
          <div class="input-group mt-1">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
            <input
              id="variableIncome-{person.id}"
              type="number"
              value={person.variableIncome}
              on:input={(e) => updateField('variableIncome', Number((e.target as HTMLInputElement).value) || 0)}
              placeholder="0"
              step="1000"
              class="input-currency text-sm pl-8"
              min="0"
            />
          </div>
          {#if variableFields.variableIncome.help}
            <p class="text-xs text-slate-500 mt-1">{variableFields.variableIncome.help}</p>
          {/if}
        </label>

        <label for="variableIncomeDiscount-{person.id}" class="block">
          <span class="text-sm font-medium text-slate-700">{variableFields.variableIncomeDiscount.label}</span>
          <div class="flex items-center gap-2 mt-1">
            <input
              id="variableIncomeDiscount-{person.id}"
              type="number"
              value={person.variableIncomeDiscount}
              on:input={(e) => updateField('variableIncomeDiscount', Math.max(0, Math.min(80, Number((e.target as HTMLInputElement).value) || 0)))}
              class="w-20 px-3 py-2 text-sm rounded border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              min={variableFields.variableIncomeDiscount.min}
              max={variableFields.variableIncomeDiscount.max}
              step="5"
            />
            <span class="text-xs text-slate-500">({100 - person.variableIncomeDiscount}%)</span>
          </div>
          {#if variableFields.variableIncomeDiscount.help}
            <p class="text-xs text-slate-500 mt-1">{variableFields.variableIncomeDiscount.help}</p>
          {/if}
        </label>
      </div>
    </div>
  {/if}

  <!-- Retirement Section -->
  {#if enabledSections.includes('retirement')}
    <div class="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
      <h4 class="font-semibold text-green-900 mb-3 flex items-center gap-2">
        <span class="text-lg">💼</span>
        Retirement Matching
      </h4>
      
      <label for="retirementMatching-{person.id}" class="block">
        <span class="text-sm font-medium text-slate-700">{retirementFields.retirementMatching.label}</span>
        <div class="input-group mt-1">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
          <input
            id="retirementMatching-{person.id}"
            type="number"
            value={person.retirementMatching}
            on:input={(e) => updateField('retirementMatching', Number((e.target as HTMLInputElement).value) || 0)}
            placeholder="0"
            step={retirementFields.retirementMatching.step}
            class="input-currency text-sm pl-8"
            min="0"
          />
        </div>
        {#if retirementFields.retirementMatching.help}
          <p class="text-xs text-slate-500 mt-1">{retirementFields.retirementMatching.help}</p>
        {/if}
      </label>
    </div>
  {/if}

  <!-- Property Ownership Section -->
  {#if $calculatorStore.propertyArrangement === 'owned' && $calculatorStore.propertyOwnerId === person.id}
    {@const rentField = FIELDS.marketRent(timeframe)}
    <div class="bg-amber-50 border border-amber-200 rounded-xl p-4">
      <h4 class="font-semibold text-amber-900 mb-3 flex items-center gap-2">
        <span class="text-lg">🏠</span>
        Property Ownership
      </h4>
      
      <label for="marketRent-{person.id}" class="block">
        <span class="text-sm font-medium text-slate-700">{rentField.label}</span>
        <div class="input-group mt-1">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
          <input
            id="marketRent-{person.id}"
            type="number"
            value={$calculatorStore.marketRent}
            on:input={(e) => calculatorStore.update(s => ({ 
              ...s, 
              marketRent: Number((e.target as HTMLInputElement).value) || 0 
            }))}
            placeholder="0"
            step={rentField.step}
            class="input-currency text-sm pl-8"
            min="0"
          />
        </div>
        {#if rentField.help}
          <p class="text-xs text-slate-500 mt-1">{rentField.help}</p>
        {/if}
        <div class="mt-2 p-2 bg-amber-100 rounded text-xs text-amber-800">
          As the owner, you pay 50% of market rent + your share of other expenses.
        </div>
      </label>
    </div>
  {/if}
</div>