/**
 * UI state management - completely separate from business data
 * This can be reset without losing financial data
 */

import { writable } from 'svelte/store';

export interface UIState {
	activeSection: string | null;
	enabledSections: string[];
	expandedHelp: Record<string, boolean>;
}

function createDefaultUIState(): UIState {
	return {
		activeSection: 'inheritance',
		enabledSections: ['inheritance', 'debt', 'variable'],
		expandedHelp: {}
	};
}

function createUIStore() {
	const { subscribe, set, update } = writable<UIState>(createDefaultUIState());

	return {
		subscribe,

		toggleSection(key: string) {
			update((state) => ({
				...state,
				enabledSections: state.enabledSections.includes(key)
					? state.enabledSections.filter((k) => k !== key)
					: [...state.enabledSections, key]
			}));
		},

		setActiveSection(key: string | null) {
			update((state) => ({ ...state, activeSection: key }));
		},

		toggleHelp(key: string) {
			update((state) => ({
				...state,
				expandedHelp: {
					...state.expandedHelp,
					[key]: !state.expandedHelp[key]
				}
			}));
		},

		setState(newState: UIState) {
			set(newState);
		},

		resetUI() {
			set(createDefaultUIState());
		}
	};
}

export const uiStore = createUIStore();
