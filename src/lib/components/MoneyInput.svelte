<script lang="ts">
	import { getCurrencySymbol } from '$lib/utils/formatters';
	import { calculatorStore } from '$lib/stores/calculatorStore';

	export let id: string;
	export let value: number;
	export let label: string;
	export let placeholder = '0';
	export let step: number | string = '100';
	export let min: number | string = '0';
	export let helpText = '';
	export let onChange: (value: number) => void;

	$: currencySymbol = getCurrencySymbol($calculatorStore.currency);
</script>

<label for={id} class="block">
	<span class="label-text">{label}</span>
	<div class="input-group relative">
		<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
			<span class="font-medium text-slate-500 dark:text-slate-400">{currencySymbol}</span>
		</div>
		<input
			{id}
			type="number"
			{value}
			on:input={(e) => onChange(Number((e.target as HTMLInputElement).value) || 0)}
			{placeholder}
			{step}
			class="input-currency pl-12 text-sm"
			{min}
		/>
	</div>
	{#if helpText}
		<p class="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{helpText}</p>
	{/if}
	<slot />
</label>
