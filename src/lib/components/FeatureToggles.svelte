<script lang="ts">
  import { SECTIONS } from '$lib/config/formConfig';
  import { calculatorStore } from '$lib/stores/calculatorStore';
  import { slide } from 'svelte/transition';

  $: enabledSections = $calculatorStore.enabledSections;

  function isEnabled(key: string) {
    return enabledSections.includes(key);
  }

  function toggleSection(key: string) {
    calculatorStore.toggleSection(key);
  }

  // Track expanded state for "Why this matters"
  let expandedHelp: Record<string, boolean> = {
    // inheritance: true,
    // debt: true,
    // variable: true,
    // retirement: true
  };

  function toggleHelp(key: string) {
    expandedHelp[key] = !expandedHelp[key];
  }
</script>

<div class="card p-4">
  <div class="flex items-center gap-2 mb-4">
    <h3 class="text-sm font-bold text-slate-900">Optional Features</h3>
    <span class="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
      Enable as needed
    </span>
  </div>
  
  <div class="space-y-2">
    {#each SECTIONS.filter(s => s.key !== 'income' && s.key !== 'housing') as section}
      <div
        class="border-2 rounded-lg transition-all
        {isEnabled(section.key)
          ? 'border-blue-300 bg-blue-50'
          : 'border-slate-200 bg-white hover:border-slate-300'}"
      >
        <!-- Main Toggle -->
        <div class="p-3">
          <label class="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isEnabled(section.key)}
              on:change={() => toggleSection(section.key)}
              class="w-4 h-4 mt-0.5 text-indigo-600 border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 transition-colors cursor-pointer"
              aria-label="Enable {section.title}"
            />
            
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-lg">{section.icon}</span>
                <span class="text-sm font-semibold text-slate-900">{section.title}</span>
              </div>
              <p class="text-xs text-slate-600 mb-2">{section.shortDesc}</p>
              
              <!-- IMPROVED: Always visible, expandable help -->
              <button
                type="button"
                class="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                on:click={() => toggleHelp(section.key)}
              >
                <span class="transition-transform inline-block {expandedHelp[section.key] ? 'rotate-90' : ''}">
                  ▶
                </span>
                Why this matters
              </button>
              
              {#if expandedHelp[section.key]}
                <div class="mt-2 p-3 bg-blue-50 border-l-4 border-blue-400 rounded" transition:slide>
                  <p class="text-xs text-blue-900 leading-relaxed">
                    <strong class="font-semibold">Why this matters:</strong>
                    {section.whyMatter}
                  </p>
                </div>
              {/if}
            </div>
          </label>
        </div>
      </div>
    {/each}
  </div>

  <!-- Quick explanation -->
  <div class="mt-4 pt-4 border-t border-slate-200">
    <p class="text-xs text-slate-600 leading-relaxed">
      <strong class="font-semibold text-slate-700">Tip:</strong> Start with just net income, then enable features that apply to your situation. Property ownership is configured in the settings bar above.
    </p>
  </div>
</div>