<script lang="ts">
  import { calculatorStore } from '$lib/stores/calculatorStore';
  import SectionGroup from '$lib/components/SectionGroup.svelte';
  import { SECTIONS } from '$lib/stores/calculatorStore';
  
  export let person: any;
  // Removed unused index export
  
  function removePerson() {
    calculatorStore.update(state => ({
      ...state,
      people: state.people.filter(p => p.id !== person.id)
    }));
  }
</script>

<div class="bg-white rounded-lg shadow-lg p-6 min-w-[320px]">
  <div class="flex justify-between items-center mb-6">
    <!-- Changed to div to avoid a11y warning -->
    <div class="text-xl font-bold flex-1">
      <input 
        bind:value={person.name}
        class="w-full bg-gray-50 rounded px-2 py-1 border-0 focus:ring-2 focus:ring-indigo-500"
        placeholder="Enter name"
      />
    </div>
    {#if $calculatorStore.people.length > 2}
      <button 
        on:click={removePerson}
        class="ml-2 text-red-500 hover:text-red-700 text-2xl leading-none"
        aria-label="Remove {person.name}"
        type="button"
      >
        ×
      </button>
    {/if}
  </div>

  <!-- Base section (always visible) -->
  <SectionGroup section={SECTIONS.find(s => s.key === 'base')} {person} />
  
  <!-- Optional sections -->
  {#each SECTIONS.filter(s => s.key !== 'base' && $calculatorStore.activeSections.includes(s.key)) as section}
    <SectionGroup {section} {person} />
  {/each}
</div>