<script lang="ts">
  import { SECTIONS } from '$lib/config/formConfig';
  import { calculatorStore } from '$lib/stores/calculatorStore';
  import { slide } from 'svelte/transition';

  // Reactive shorthand for reading store data
  $: activeSection = $calculatorStore.activeSection;
  $: enabledSections = $calculatorStore.enabledSections;

  function isEnabled(key: string) {
    return enabledSections.includes(key);
  }

  function isActive(key: string) {
    return activeSection === key;
  }

  function toggleSection(key: string) {
    calculatorStore.toggleSection(key);

    // If disabling an active section, close it
    if (isActive(key) && !isEnabled(key)) {
      calculatorStore.setActiveSection(null);
    }
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

<div class="card p-4">
  <div class="flex items-center gap-2 mb-4">
    <h3 class="text-sm font-bold text-slate-900">Feature Toggles</h3>
    <span class="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
      WHY IT MATTERS
    </span>
  </div>
  
  <div class="space-y-2">
    {#each SECTIONS.filter(s => s.key !== 'income' && s.key !== 'housing') as section}
      <div
        class="border-2 rounded-lg transition-all
        {isActive(section.key)
          ? 'border-indigo-200 bg-indigo-50'
          : 'border-slate-200 bg-white hover:border-slate-300'}"
      >
        <!-- Toggle Button -->
        <button
          type="button"
          class="w-full text-left flex items-center gap-3 p-3 cursor-pointer"
          on:click|stopPropagation={() => setActiveSection(section.key)}
          on:keydown={(e) => handleKeyDown(e, section.key)}
          aria-pressed={isActive(section.key)}
        >
          <input
            type="checkbox"
            id="feature-{section.key}"
            checked={isEnabled(section.key)}
            on:click|stopPropagation={() => toggleSection(section.key)}
            class="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 transition-colors cursor-pointer"
            aria-label="Enable {section.title}"
            tabindex="-1"
          />
          
          <div class="flex items-center gap-2 flex-1 pointer-events-none">
            <span class="text-lg">{section.icon}</span>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-semibold text-slate-900 truncate">{section.title}</div>
              <div class="text-xs text-slate-500 truncate">{section.shortDesc}</div>
            </div>
          </div>
          
          <span
            class="text-slate-400 text-xs transition-transform pointer-events-none
            {isActive(section.key) ? 'rotate-180' : ''}"
          >
            ▼
          </span>
        </button>

        <!-- Expandable Section -->
        {#if isActive(section.key)}
          <div class="px-3 pb-3" transition:slide>
            <div class="p-3 bg-blue-50 border-l-4 border-blue-400 rounded-r">
              <p class="text-xs text-blue-900">
                <strong class="font-semibold">Why this matters:</strong>
                {section.whyMatter}
              </p>
            </div>
          </div>
        {/if}
      </div>
    {/each}
  </div>
</div>
