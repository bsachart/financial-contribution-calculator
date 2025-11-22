<script lang="ts">
	import type { Person } from '$lib/domains/financialModels';
	import { calculatorStore } from '$lib/stores/calculatorStore';
	import { FIELDS, type FieldConfig } from '$lib/config/formConfig';
	import MoneyInput from '../MoneyInput.svelte';
	import { slide } from 'svelte/transition';

	export let person: Person;

	$: inheritanceFields = {
		passiveAdvantages: FIELDS.passiveAdvantages as FieldConfig,
		passiveAdvantagesDiscount: FIELDS.passiveAdvantagesDiscount as FieldConfig,
		passiveAdvantagesReturnRate: FIELDS.passiveAdvantagesReturnRate as FieldConfig,
		expectedFutureInheritance: FIELDS.expectedFutureInheritance as FieldConfig,
		expectedFutureInheritanceDiscount: FIELDS.expectedFutureInheritanceDiscount as FieldConfig
	};

	function updateField<K extends keyof Person>(key: K, value: Person[K]) {
		calculatorStore.updatePerson(person.id, key, value);
	}
</script>

<div
	class="mb-6 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-5 dark:border-indigo-800/30 dark:bg-indigo-900/10"
	transition:slide
>
	<h4 class="mb-4 flex items-center gap-2 font-bold text-indigo-900 dark:text-indigo-300">
		<span class="text-xl">🏛️</span>
		Inheritance & Advantages
	</h4>

	<div class="space-y-6">
		<!-- Multiple Direct Inheritances -->
		<div>
			<div class="mb-3 flex items-center justify-between">
				<span
					class="text-xs font-bold tracking-wider text-indigo-800/70 uppercase dark:text-indigo-300/70"
					>Direct Inheritances</span
				>
				<button
					type="button"
					on:click={() => calculatorStore.addInheritance(person.id)}
					class="rounded-md bg-white/50 px-2 py-1 text-xs font-bold text-indigo-600 shadow-sm transition-all hover:text-indigo-700 hover:shadow dark:bg-slate-800/50 dark:text-indigo-400 dark:hover:text-indigo-300"
				>
					+ Add
				</button>
			</div>

			{#if person.inheritances && person.inheritances.length > 0}
				<div class="space-y-3">
					{#each person.inheritances as inheritance (inheritance.id)}
						<div
							class="rounded-xl border border-indigo-100/50 bg-white/60 p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800/60"
							transition:slide
						>
							<div class="mb-3 flex items-center justify-between gap-2">
								<label for="inheritance-name-{inheritance.id}" class="sr-only"
									>Inheritance name</label
								>
								<input
									id="inheritance-name-{inheritance.id}"
									type="text"
									value={inheritance.name}
									on:input={(e) =>
										calculatorStore.updateInheritance(person.id, inheritance.id, {
											name: (e.target as HTMLInputElement).value
										})}
									class="w-full border-b border-dashed border-slate-300 bg-transparent pb-1 text-xs font-bold text-slate-700 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:text-slate-200"
									placeholder="Inheritance Name"
								/>
								<button
									type="button"
									on:click={() => calculatorStore.removeInheritance(person.id, inheritance.id)}
									class="text-slate-400 transition-colors hover:text-red-500"
									aria-label="Remove inheritance"
								>
									✕
								</button>
							</div>

							<div class="space-y-3">
								<div>
									<MoneyInput
										id="inheritance-amount-{inheritance.id}"
										label="Amount"
										value={inheritance.amount}
										onChange={(val) =>
											calculatorStore.updateInheritance(person.id, inheritance.id, {
												amount: val
											})}
										step="1000"
									/>
								</div>

								<div>
									<label for="inheritance-date-{inheritance.id}" class="label-text"
										>Date Received</label
									>
									<input
										id="inheritance-date-{inheritance.id}"
										type="date"
										value={inheritance.receivedDate}
										on:input={(e) =>
											calculatorStore.updateInheritance(person.id, inheritance.id, {
												receivedDate: (e.target as HTMLInputElement).value
											})}
										class="input-base py-1.5 text-sm"
									/>
								</div>

								<div class="grid grid-cols-2 gap-3">
									<div>
										<label for="inheritance-discount-{inheritance.id}" class="label-text"
											>Discount %</label
										>
										<div class="flex items-center gap-2">
											<input
												id="inheritance-discount-{inheritance.id}"
												type="number"
												value={inheritance.discount}
												on:input={(e) =>
													calculatorStore.updateInheritance(person.id, inheritance.id, {
														discount: Math.max(
															0,
															Math.min(100, Number((e.target as HTMLInputElement).value) || 0)
														)
													})}
												class="input-base py-1.5 text-center text-sm"
												min="0"
												max="100"
												step="5"
											/>
										</div>
									</div>

									<div>
										<label for="inheritance-rate-{inheritance.id}" class="label-text">Rate %</label>
										<input
											id="inheritance-rate-{inheritance.id}"
											type="number"
											value={inheritance.returnRate}
											on:input={(e) =>
												calculatorStore.updateInheritance(person.id, inheritance.id, {
													returnRate: Math.max(
														0,
														Math.min(100, Number((e.target as HTMLInputElement).value) || 5.5)
													)
												})}
											class="input-base py-1.5 text-center text-sm"
											min="0"
											max="100"
											step="0.5"
										/>
									</div>
								</div>
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<div
					class="rounded-xl border border-dashed border-indigo-200 p-4 text-center dark:border-indigo-800/50"
				>
					<p class="text-xs text-indigo-400 italic dark:text-indigo-500/70">
						No inheritances added yet
					</p>
				</div>
			{/if}
		</div>

		<!-- Passive Advantages -->
		<div>
			<MoneyInput
				id="passiveAdvantages-{person.id}"
				label={inheritanceFields.passiveAdvantages.label}
				value={person.passiveAdvantages}
				onChange={(val) => updateField('passiveAdvantages', val)}
				step="1000"
			>
				<div class="mt-3 grid grid-cols-2 gap-3">
					<div>
						<label for="passiveAdvantagesDiscount-{person.id}" class="label-text">Discount %</label>
						<input
							id="passiveAdvantagesDiscount-{person.id}"
							type="number"
							value={person.passiveAdvantagesDiscount}
							on:input={(e) =>
								updateField(
									'passiveAdvantagesDiscount',
									Math.max(0, Math.min(100, Number((e.target as HTMLInputElement).value) || 70))
								)}
							class="input-base py-1.5 text-center text-sm"
							min="0"
							max="100"
							step="5"
						/>
					</div>
					<div>
						<label for="passiveAdvantagesReturnRate-{person.id}" class="label-text">Rate %</label>
						<input
							id="passiveAdvantagesReturnRate-{person.id}"
							type="number"
							value={person.passiveAdvantagesReturnRate}
							on:input={(e) =>
								updateField(
									'passiveAdvantagesReturnRate',
									Math.max(0, Math.min(100, Number((e.target as HTMLInputElement).value) || 5.5))
								)}
							class="input-base py-1.5 text-center text-sm"
							min="0"
							max="100"
							step="0.5"
						/>
					</div>
				</div>
			</MoneyInput>
		</div>

		<!-- Expected Future Inheritance -->
		<div>
			<MoneyInput
				id="futureInheritance-{person.id}"
				label={inheritanceFields.expectedFutureInheritance.label}
				value={person.expectedFutureInheritance}
				onChange={(val) => updateField('expectedFutureInheritance', val)}
				step="1000"
			>
				<div class="mt-3">
					<label for="futureInheritanceDiscount-{person.id}" class="label-text"
						>Uncertainty Discount %</label
					>
					<input
						id="futureInheritanceDiscount-{person.id}"
						type="number"
						value={person.expectedFutureInheritanceDiscount}
						on:input={(e) =>
							updateField(
								'expectedFutureInheritanceDiscount',
								Math.max(0, Math.min(100, Number((e.target as HTMLInputElement).value) || 50))
							)}
						class="input-base py-1.5 text-sm"
						min="0"
						max="100"
						step="5"
					/>
				</div>
			</MoneyInput>
		</div>
	</div>
</div>
