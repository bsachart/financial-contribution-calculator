<script lang="ts">
	import { slide } from 'svelte/transition';
	import { calculatorStore } from '$lib/stores/calculatorStore';
	import { FIELDS } from '$lib/config/formConfig';

	export let section: any;
	export let person: any;

	let isExpanded = section.alwaysExpanded || false;
	let showHelp = true;

	$: timeframe = $calculatorStore.timeframe;
	$: fields =
		section.key === 'base'
			? [['netIncome', FIELDS.netIncome]]
			: Object.entries(FIELDS).filter(
					([, config]) => (config as any).section === section.key
				);

	function toggleExpand(e: Event) {
		if (!section.alwaysExpanded) {
			isExpanded = !isExpanded;
		}
	}
</script>

<div class="border-t border-gray-200 pt-4 mt-4 {section.key === 'base' ? 'border-t-0 pt-0' : ''}">
	<div class="flex items-center justify-between">
		<div
			class="flex items-center flex-1 font-medium text-gray-900 hover:text-indigo-600 cursor-pointer select-none"
			on:click={toggleExpand}
			on:keydown={(e) => e.key === 'Enter' && toggleExpand(e)}
			role="button"
			tabindex="0"
			aria-expanded={isExpanded}
		>
			<span class="flex items-center">
				{section.title}
				<button
					type="button"
					class="ml-2 text-indigo-500 hover:text-indigo-700 text-sm"
					on:click|stopPropagation={() => (showHelp = !showHelp)}
				>
					{showHelp ? 'Hide' : 'What?'}
				</button>
			</span>
			{#if !section.alwaysExpanded}
				<span class="ml-2 text-gray-400">{isExpanded ? '▼' : '▶'}</span>
			{/if}
		</div>
	</div>

	{#if showHelp}
		<div class="mt-2 p-3 bg-blue-50 border-l-4 border-blue-400 text-sm text-blue-800" transition:slide>
			{section.description}
		</div>
	{/if}

	{#if isExpanded || section.alwaysExpanded}
		<div class="mt-4 space-y-4">
			{#each fields as [key, config]}
				{@const fieldConfig = typeof config === 'function' ? config(timeframe) : config}
				<label class="block">
					<span class="text-sm font-medium text-gray-700">{fieldConfig.label}</span>

					{#if fieldConfig.type === 'number'}
						<input
							type="number"
							bind:value={person[key]}
							placeholder={fieldConfig.placeholder || '0'}
							step={fieldConfig.step || 100}
							class="mt-1 block w-full form-input"
							min="0"
						/>
					{:else if fieldConfig.type === 'select'}
						<select bind:value={person[key]} class="mt-1 block w-full form-select">
							{#each fieldConfig.options as option}
								<option {value}>{option}</option>
							{/each}
						</select>
					{:else if fieldConfig.type === 'slider'}
						<div class="flex items-center gap-4 mt-2">
							<input
								type="range"
								bind:value={person[key]}
								min={fieldConfig.min}
								max={fieldConfig.max}
								step={fieldConfig.step}
								class="w-full"
							/>
							<span class="text-sm font-semibold text-gray-800 w-16 text-center"
								>{person[key] || 0}%</span
							>
						</div>
					{/if}
				</label>
			{/each}
		</div>
	{/if}
</div>