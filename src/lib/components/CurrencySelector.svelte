<script lang="ts">
	import { createEventDispatcher, onMount, onDestroy } from 'svelte';
	import { fly } from 'svelte/transition';
	import { CURRENCIES } from '$lib/config/currencies';
	import { browser } from '$app/environment';

	export let value: string;

	let isOpen = false;
	let searchTerm = '';
	let dropdownElement: HTMLDivElement;

	const dispatch = createEventDispatcher();

	$: selected = CURRENCIES.find((c) => c.code === value) || CURRENCIES[0];

	$: filteredCurrencies = searchTerm
		? CURRENCIES.filter(
				(c) =>
					c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
					c.code.toLowerCase().includes(searchTerm.toLowerCase())
			)
		: CURRENCIES;

	function selectCurrency(currency: (typeof CURRENCIES)[0]) {
		value = currency.code;
		dispatch('change', value);
		isOpen = false;
		searchTerm = '';
	}

	function toggleDropdown(e: Event) {
		e.stopPropagation();
		isOpen = !isOpen;
		if (!isOpen) {
			searchTerm = '';
		}
	}

	function handleClickOutside(e: MouseEvent) {
		if (dropdownElement && !dropdownElement.contains(e.target as Node)) {
			isOpen = false;
			searchTerm = '';
		}
	}

	function handleKeyDown(e: KeyboardEvent, currency: (typeof CURRENCIES)[0]) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			selectCurrency(currency);
		}
	}

	onMount(() => {
		if (browser) {
			document.addEventListener('click', handleClickOutside);
		}
	});

	onDestroy(() => {
		if (browser) {
			document.removeEventListener('click', handleClickOutside);
		}
	});
</script>

<div class="relative" bind:this={dropdownElement}>
	<button
		type="button"
		class="relative w-full cursor-pointer rounded-lg border border-gray-300 bg-white py-2 pr-10 pl-3 text-left shadow-sm focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
		on:click={toggleDropdown}
		aria-haspopup="listbox"
		aria-expanded={isOpen}
	>
		<span class="flex items-center">
			<span class="mr-2 text-lg">{selected.flag}</span>
			<span class="block truncate">{selected.code}</span>
		</span>
		<span class="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
			<svg
				class="h-5 w-5 text-gray-400"
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 20 20"
				fill="currentColor"
			>
				<path
					fill-rule="evenodd"
					d="M10 3a.75.75 0 01.53.22l3.5 3.5a.75.75 0 01-1.06 1.06L10 4.81 6.53 8.28a.75.75 0 01-1.06-1.06l3.5-3.5A.75.75 0 0110 3zm-3.72 9.28a.75.75 0 011.06 0L10 15.19l3.47-3.47a.75.75 0 111.06 1.06l-4 4a.75.75 0 01-1.06 0l-4-4a.75.75 0 010-1.06z"
					clip-rule="evenodd"
				/>
			</svg>
		</span>
	</button>

	{#if isOpen}
		<div
			transition:fly={{ y: -5, duration: 150 }}
			class="ring-opacity-5 absolute z-[200] mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-1 text-base shadow-lg ring-1 ring-black focus:outline-none dark:bg-slate-800 dark:ring-slate-700"
			role="listbox"
		>
			<div
				class="sticky top-0 border-b border-gray-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-800"
			>
				<input
					type="text"
					placeholder="Search currency..."
					bind:value={searchTerm}
					class="w-full rounded-md border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder-slate-400"
					on:click|stopPropagation
					aria-label="Search currencies"
				/>
			</div>
			<ul role="listbox">
				{#each filteredCurrencies as currency (currency.code)}
					<li
						role="option"
						aria-selected={selected.code === currency.code}
						class="relative cursor-pointer py-2 pr-9 pl-3 text-gray-900 outline-none select-none hover:bg-indigo-600 hover:text-white focus:bg-indigo-600 focus:text-white dark:text-white"
						on:click|stopPropagation={() => selectCurrency(currency)}
						on:keydown={(e) => handleKeyDown(e, currency)}
						tabindex="0"
					>
						<div class="flex items-center">
							<span class="mr-2">{currency.flag}</span>
							<span class="block truncate">{currency.name}</span>
							<span class="ml-auto text-xs">{currency.code}</span>
						</div>
					</li>
				{/each}
			</ul>
		</div>
	{/if}
</div>
