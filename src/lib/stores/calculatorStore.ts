import { writable, get } from 'svelte/store';

export interface Inheritance {
	id: string;
	name: string;
	amount: number;
	receivedDate: string; // ISO date string
	discount: number;
	returnRate: number;
}

export interface Person {
	id: string;
	name: string;
	netIncome: number;
	inheritances: Inheritance[];
	passiveAdvantages: number;
	passiveAdvantagesDiscount: number;
	passiveAdvantagesReturnRate: number;
	expectedFutureInheritance: number;
	expectedFutureInheritanceDiscount: number;
	studentLoans: number;
	familySupport: number;
	variableIncome: number;
	variableIncomeDiscount: number;
	retirementMatching: number;
}

export interface CalculatorState {
	currency: string;
	sharedExpenses: number;
	timeframe: 'monthly' | 'yearly';
	people: Person[];
	propertyArrangement: 'none' | 'owned';
	propertyOwnerId: string | null;
	marketRent: number;
	activeSection: string | null;
	enabledSections: string[];
}

// Constants
export const ASSUMED_RETURN_RATE = 5.5;
export const DEFAULT_PASSIVE_ADVANTAGES_RATE = 5.5;

export { SECTIONS } from '$lib/config/formConfig';

function createInitialPerson(name: string): Person {
	return {
		id: crypto.randomUUID(),
		name,
		netIncome: 0,
		inheritances: [],
		passiveAdvantages: 0,
		passiveAdvantagesDiscount: 70,
		passiveAdvantagesReturnRate: DEFAULT_PASSIVE_ADVANTAGES_RATE,
		expectedFutureInheritance: 0,
		expectedFutureInheritanceDiscount: 50,
		studentLoans: 0,
		familySupport: 0,
		variableIncome: 0,
		variableIncomeDiscount: 20,
		retirementMatching: 0
	};
}

const DEFAULT_STATE: CalculatorState = {
	currency: 'USD',
	sharedExpenses: 3000,
	timeframe: 'monthly',
	people: [createInitialPerson('Partner A'), createInitialPerson('Partner B')],
	propertyArrangement: 'none',
	propertyOwnerId: null,
	marketRent: 0,
	activeSection: null,
	enabledSections: ['inheritance', 'debt', 'variable']
};

function loadFromStorage(): CalculatorState | null {
	if (typeof window === 'undefined') return null;

	try {
		const saved = localStorage.getItem('financial-calculator-state');
		if (!saved) return null;

		const parsed = JSON.parse(saved);
		if (!parsed.people || !Array.isArray(parsed.people)) return null;

		return parsed;
	} catch (error) {
		console.warn('Failed to load state from localStorage:', error);
		return null;
	}
}

function createStore() {
	const initialState = loadFromStorage() || DEFAULT_STATE;
	const { subscribe, set, update } = writable<CalculatorState>(initialState);

	// Auto-save to localStorage on every change
	subscribe((state) => {
		if (typeof window === 'undefined') return;
		try {
			localStorage.setItem('financial-calculator-state', JSON.stringify(state));
		} catch (error) {
			console.warn('Failed to save state to localStorage:', error);
		}
	});

	return {
		subscribe,
		set,
		update,

		addPartner(name?: string) {
			update((state) => ({
				...state,
				people: [...state.people, createInitialPerson(name || `Partner ${state.people.length + 1}`)]
			}));
		},

		removePartner(id: string) {
			update((state) => {
				if (state.people.length <= 2) return state;
				return {
					...state,
					people: state.people.filter((p) => p.id !== id),
					propertyOwnerId: state.propertyOwnerId === id ? null : state.propertyOwnerId
				};
			});
		},

		updatePerson<K extends keyof Person>(id: string, key: K, value: Person[K]) {
			update((state) => ({
				...state,
				people: state.people.map((p) => (p.id === id ? { ...p, [key]: value } : p))
			}));
		},

		addInheritance(personId: string) {
			update((state) => ({
				...state,
				people: state.people.map((p) =>
					p.id === personId
						? {
								...p,
								inheritances: [
									...p.inheritances,
									{
										id: crypto.randomUUID(),
										name: `Inheritance ${p.inheritances.length + 1}`,
										amount: 0,
										receivedDate: new Date().toISOString().split('T')[0],
										discount: 0,
										returnRate: ASSUMED_RETURN_RATE
									}
								]
							}
						: p
				)
			}));
		},

		removeInheritance(personId: string, inheritanceId: string) {
			update((state) => ({
				...state,
				people: state.people.map((p) =>
					p.id === personId
						? {
								...p,
								inheritances: p.inheritances.filter((i) => i.id !== inheritanceId)
							}
						: p
				)
			}));
		},

		updateInheritance(personId: string, inheritanceId: string, updates: Partial<Inheritance>) {
			update((state) => ({
				...state,
				people: state.people.map((p) =>
					p.id === personId
						? {
								...p,
								inheritances: p.inheritances.map((i) =>
									i.id === inheritanceId ? { ...i, ...updates } : i
								)
							}
						: p
				)
			}));
		},

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

		setTimeframe(timeframe: 'monthly' | 'yearly') {
			update((state) => {
				if (state.timeframe === timeframe) return state;

				const factor = timeframe === 'yearly' ? 12 : 1 / 12;

				return {
					...state,
					timeframe,
					sharedExpenses: Math.round(state.sharedExpenses * factor),
					marketRent: Math.round(state.marketRent * factor),
					people: state.people.map((p) => ({
						...p,
						netIncome: Math.round(p.netIncome * factor),
						studentLoans: Math.round(p.studentLoans * factor),
						familySupport: Math.round(p.familySupport * factor),
						retirementMatching: Math.round(p.retirementMatching * factor)
					}))
				};
			});
		},

		exportState(): string {
			const state = get({ subscribe });
			return JSON.stringify(state, null, 2);
		},

		importState(jsonString: string): boolean {
			try {
				const parsed = JSON.parse(jsonString);
				if (!parsed.people || !Array.isArray(parsed.people)) {
					throw new Error('Invalid state format');
				}
				set(parsed);
				return true;
			} catch (error) {
				console.error('Failed to import state:', error);
				return false;
			}
		},

		resetState() {
			set(DEFAULT_STATE);
		}
	};
}

export const calculatorStore = createStore();
