<script lang="ts">
	import type { Person } from '$lib/domains/financialModels';
	import { calculatorStore } from '$lib/stores/calculatorStore';
	import { FIELDS, type FieldConfig } from '$lib/config/formConfig';
	import MoneyInput from '../MoneyInput.svelte';
	import { slide } from 'svelte/transition';

	export let person: Person;

	$: variableFields = {
		variableIncome: FIELDS.variableIncome as FieldConfig,
		variableIncomeDiscount: FIELDS.variableIncomeDiscount as FieldConfig
	};

	function updateField<K extends keyof Person>(key: K, value: Person[K]) {
		calculatorStore.updatePerson(person.id, key, value);
	}
</script>

<div
	class="mb-6 rounded-2xl border border-purple-100 bg-purple-50/50 p-5 dark:border-purple-800/30 dark:bg-purple-900/10"
	transition:slide
>
	<h4 class="mb-4 flex items-center gap-2 font-bold text-purple-900 dark:text-purple-300">
		<span class="text-xl">📈</span>
		Variable Income
	</h4>

	<div class="space-y-4">
		<MoneyInput
			id="variableIncome-{person.id}"
			label={variableFields.variableIncome.label}
			value={person.variableIncome}
			onChange={(val) => updateField('variableIncome', val)}
			step="1000"
		/>

		<label for="variableIncomeDiscount-{person.id}" class="block">
			<span class="label-text">{variableFields.variableIncomeDiscount.label}</span>
			<div class="flex items-center gap-2">
				<input
					id="variableIncomeDiscount-{person.id}"
					type="number"
					value={person.variableIncomeDiscount}
					on:input={(e) =>
						updateField(
							'variableIncomeDiscount',
							Math.max(0, Math.min(80, Number((e.target as HTMLInputElement).value) || 0))
						)}
					class="input-base py-1.5 text-sm"
					min={variableFields.variableIncomeDiscount.min}
					max={variableFields.variableIncomeDiscount.max}
					step="5"
				/>
			</div>
		</label>
	</div>
</div>
