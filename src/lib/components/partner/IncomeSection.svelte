<script lang="ts">
	import type { Person } from '$lib/domains/financialModels';
	import { calculatorStore } from '$lib/stores/calculatorStore';
	import { FIELDS, type FieldConfig } from '$lib/config/formConfig';
	import MoneyInput from '../MoneyInput.svelte';

	export let person: Person;

	$: timeframe = $calculatorStore.timeframe;
	$: netIncomeField = (FIELDS.netIncome as (t: string) => FieldConfig)(timeframe);

	function updateField(value: number) {
		calculatorStore.updatePerson(person.id, 'netIncome', value);
	}
</script>

<div class="mb-8">
	<MoneyInput
		id="netIncome-{person.id}"
		label={netIncomeField.label}
		value={person.netIncome}
		onChange={updateField}
		step={netIncomeField.step}
		helpText={netIncomeField.help}
	/>
</div>
