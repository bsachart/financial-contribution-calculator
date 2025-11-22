<script lang="ts">
	import type { Person } from '$lib/domains/financialModels';
	import { calculatorStore } from '$lib/stores/calculatorStore';
	import { FIELDS, type FieldConfig } from '$lib/config/formConfig';
	import MoneyInput from '../MoneyInput.svelte';
	import { slide } from 'svelte/transition';

	export let person: Person;

	$: timeframe = $calculatorStore.timeframe;
	$: debtFields = {
		studentLoans: (FIELDS.studentLoans as (t: string) => FieldConfig)(timeframe),
		familySupport: (FIELDS.familySupport as (t: string) => FieldConfig)(timeframe)
	};

	function updateField<K extends keyof Person>(key: K, value: Person[K]) {
		calculatorStore.updatePerson(person.id, key, value);
	}
</script>

<div
	class="mb-6 rounded-2xl border border-red-100 bg-red-50/50 p-5 dark:border-red-800/30 dark:bg-red-900/10"
	transition:slide
>
	<h4 class="mb-4 flex items-center gap-2 font-bold text-red-900 dark:text-red-300">
		<span class="text-xl">💳</span>
		Obligations & Debt
	</h4>

	<div class="space-y-4">
		<MoneyInput
			id="studentLoans-{person.id}"
			label={debtFields.studentLoans.label}
			value={person.studentLoans}
			onChange={(val) => updateField('studentLoans', val)}
			step={debtFields.studentLoans.step}
		/>

		<MoneyInput
			id="familySupport-{person.id}"
			label={debtFields.familySupport.label}
			value={person.familySupport}
			onChange={(val) => updateField('familySupport', val)}
			step={debtFields.familySupport.step}
		/>
	</div>
</div>
