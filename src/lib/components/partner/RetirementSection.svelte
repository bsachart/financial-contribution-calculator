<script lang="ts">
	import type { Person } from '$lib/domains/financialModels';
	import { calculatorStore } from '$lib/stores/calculatorStore';
	import { FIELDS, type FieldConfig } from '$lib/config/formConfig';
	import MoneyInput from '../MoneyInput.svelte';
	import { slide } from 'svelte/transition';

	export let person: Person;

	$: timeframe = $calculatorStore.timeframe;
	$: retirementFields = {
		retirementMatching: (FIELDS.retirementMatching as (t: string) => FieldConfig)(timeframe)
	};

	function updateField<K extends keyof Person>(key: K, value: Person[K]) {
		calculatorStore.updatePerson(person.id, key, value);
	}
</script>

<div
	class="mb-6 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5 dark:border-emerald-800/30 dark:bg-emerald-900/10"
	transition:slide
>
	<h4 class="mb-4 flex items-center gap-2 font-bold text-emerald-900 dark:text-emerald-300">
		<span class="text-xl">💼</span>
		Retirement Matching
	</h4>

	<MoneyInput
		id="retirementMatching-{person.id}"
		label={retirementFields.retirementMatching.label}
		value={person.retirementMatching}
		onChange={(val) => updateField('retirementMatching', val)}
		step={retirementFields.retirementMatching.step}
	/>
</div>
