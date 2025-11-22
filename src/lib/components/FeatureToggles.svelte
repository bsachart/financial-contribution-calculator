<script lang="ts">
	import { SECTIONS } from '$lib/config/formConfig';
	import { uiStore } from '$lib/stores/uiStore';
	import { slide } from 'svelte/transition';

	// Make isEnabled a reactive function declaration
	$: isEnabled = (key: string) => $uiStore.enabledSections.includes(key);

	$: expandedHelp = $uiStore.expandedHelp;

	function toggleSection(key: string) {
		uiStore.toggleSection(key);
	}

	function toggleHelp(key: string) {
		uiStore.toggleHelp(key);
	}
</script>

<!-- Rest of the component remains exactly the same -->
<div class="card p-4">
	<div class="mb-4 flex items-center gap-2">
		<h3 class="text-sm font-bold text-slate-900 dark:text-white">Optional Features</h3>
		<span class="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
			Enable as needed
		</span>
	</div>

	<div class="space-y-2">
		{#each SECTIONS.filter((s) => s.key !== 'income' && s.key !== 'housing') as section}
			<div
				class="rounded-lg border-2 transition-all
        {isEnabled(section.key)
					? 'border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20'
					: 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600'}"
			>
				<div class="p-3">
					<label class="flex cursor-pointer items-start gap-3">
						<input
							type="checkbox"
							checked={isEnabled(section.key)}
							on:change={() => toggleSection(section.key)}
							class="mt-0.5 h-4 w-4 cursor-pointer rounded border-slate-300 text-indigo-600 transition-colors focus:ring-2 focus:ring-indigo-500"
							aria-label="Enable {section.title}"
						/>

						<div class="min-w-0 flex-1">
							<div class="mb-1 flex items-center gap-2">
								<span class="text-lg">{section.icon}</span>
								<span class="text-sm font-semibold text-slate-900 dark:text-white"
									>{section.title}</span
								>
							</div>
							<p class="mb-2 text-xs text-slate-600 dark:text-slate-400">{section.shortDesc}</p>

							<button
								type="button"
								class="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
								on:click={() => toggleHelp(section.key)}
							>
								<span
									class="inline-block transition-transform {expandedHelp[section.key]
										? 'rotate-90'
										: ''}"
								>
									▶
								</span>
								Why this matters
							</button>

							{#if expandedHelp[section.key]}
								<div
									class="mt-2 rounded border-l-4 border-blue-400 bg-blue-50 p-3 dark:border-blue-500 dark:bg-blue-900/30"
									transition:slide
								>
									<p class="text-xs leading-relaxed text-blue-900 dark:text-blue-200">
										<strong class="font-semibold">Why this matters:</strong>
										{section.whyMatter}
									</p>
								</div>
							{/if}
						</div>
					</label>
				</div>
			</div>
		{/each}
	</div>

	<div class="mt-4 border-t border-slate-200 pt-4">
		<p class="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
			<strong class="font-semibold text-slate-700 dark:text-slate-300">Tip:</strong> Start with just
			net income, then enable features that apply to your situation. Property ownership is configured
			in the settings bar above.
		</p>
	</div>
</div>
