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
	let symbolWidth = 0;
</script>

<label for={id} class="block">
	<span class="label-text">{label}</span>
	<div class="input-group relative">
		<input
			{id}
			type="number"
			{value}
			on:input={(e) => onChange(Number((e.target as HTMLInputElement).value) || 0)}
			{placeholder}
			{step}
			class="input-currency text-sm"
			style="padding-left: {symbolWidth + 24}px"
			{min}
		/>
		<div class="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-3">
			<span class="font-medium text-slate-900 dark:text-white" bind:clientWidth={symbolWidth}
				>{currencySymbol}</span
			>
		</div>
	</div>
	{#if helpText}
		<p class="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{helpText}</p>
	{/if}
	<slot />
</label>
