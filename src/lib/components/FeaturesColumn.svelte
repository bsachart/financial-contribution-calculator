<script lang="ts">
	import { SECTIONS } from '$lib/config/formConfig';
	import { calculatorStore } from '$lib/stores/calculatorStore';
	import { setActiveSection } from '$lib/stores/calculatorStore';

	$: activeSection = $calculatorStore.activeSection;
</script>

<div class="bg-white rounded-xl shadow-lg p-6 min-w-[380px]">
	<div class="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
		<h2 class="text-xl font-bold text-gray-900">Feature Guide</h2>
		<span class="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-medium">
			WHY IT MATTERS
		</span>
	</div>

	<div class="space-y-4">
		{#each SECTIONS as section}
			<button
				type="button"
				class="w-full text-left p-4 rounded-lg border-2 transition-all {activeSection === section.key 
					? 'border-indigo-500 bg-indigo-50' 
					: 'border-gray-200 hover:border-gray-300 bg-white'}"
				on:click={() => setActiveSection(section.key)}
			>
				<div class="flex items-start gap-3">
					<span class="text-2xl">{section.icon}</span>
					<div class="flex-1">
						<h3 class="font-semibold text-gray-900">{section.title}</h3>
						<p class="text-sm text-gray-600 mt-1">{section.description}</p>
						
						{#if activeSection === section.key}
							<div class="mt-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
								<p class="text-sm text-blue-800">
									<strong>Why this matters:</strong> {section.whyMatter}
								</p>
							</div>
						{/if}
					</div>
				</div>
			</button>
		{/each}
	</div>

	<div class="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
		<h4 class="font-semibold text-amber-900 mb-2">🎯 The Fairness Test</h4>
		<p class="text-sm text-amber-800">
			"Would this arrangement feel fair if the relationship ended tomorrow?" 
			If yes, you've found the right balance.
		</p>
	</div>
</div>