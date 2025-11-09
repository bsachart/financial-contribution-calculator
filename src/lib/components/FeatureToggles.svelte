<script lang="ts">
  import { SECTIONS } from '$lib/config/formConfig';
  import { calculatorStore } from '$lib/stores/calculatorStore';
  import { slide } from 'svelte/transition';

  $: activeSection = $calculatorStore.activeSection;
  
  function isEnabled(key: string) {
    return $calculatorStore.enabledSections.includes(key);
  }

  function isActive(key: string) {
    return activeSection === key;
  }

  function toggleSection(key: string) {
    calculatorStore.update((state) => ({
      ...state,
      enabledSections: state.enabledSections.includes(key)
        ? state.enabledSections.filter((k) => k !== key)
        : [...state.enabledSections, key],
      activeSection: state.activeSection === key ? null : state.activeSection,
    }));
  }

  function setActiveSection(key: string) {
    calculatorStore.setActiveSection(isActive(key) ? null : key);
  }

  function handleKeyDown(e: KeyboardEvent, key: string) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setActiveSection(key);
    }
  }
</script>

<div class="card p-4 lg:sticky lg:top-24">
  <h3 class="text-sm font-bold text-slate-900 mb-4">Feature Toggles</h3>
  
  <div class="space-y-2">
    {#each SECTIONS.filter(s => s.key !== 'income' && s.key !== 'housing') as section}
      <button
        type="button"
        class="w-full text-left flex items-center gap-3 p-3 rounded-lg transition-all {isActive(section.key) 
          ? 'bg-indigo-50 border-2 border-indigo-200' 
          : 'border-2 border-transparent hover:bg-slate-50'}"
        on:click={() => setActiveSection(section.key)}
        on:keydown={(e) => handleKeyDown(e, section.key)}
        aria-pressed={isActive(section.key)}
      >
        <input
          type="checkbox"
          id="feature-{section.key}"
          checked={isEnabled(section.key)}
          on:change|stopPropagation={() => toggleSection(section.key)}
          class="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 transition-colors cursor-pointer"
          aria-label="Enable {section.title}"
        />
        
        <div class="flex items-center gap-2 flex-1">
          <span class="text-lg">{section.icon}</span>
          <div class="flex-1 min-w-0">
            <div class="text-sm font-semibold text-slate-900 truncate">{section.title}</div>
            <div class="text-xs text-slate-500 truncate">{section.shortDesc}</div>
          </div>
        </div>
      </button>
    {/each}
  </div>

  {#if activeSection}
    {@const section = SECTIONS.find(s => s.key === activeSection)}
    {#if section}
      <div class="mt-4 p-3 bg-blue-50 border-l-4 border-blue-400 rounded-lg" transition:slide>
        <p class="text-sm text-blue-800">
          <strong>Why this matters:</strong> {section.whyMatter}
        </p>
      </div>
    {/if}
  {/if}
</div>