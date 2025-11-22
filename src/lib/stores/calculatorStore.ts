import { writable, get } from 'svelte/store';
import type { CalculatorState, Person, Inheritance } from '../domains/financialModels';
import { createInitialPerson, createInitialInheritance } from '../domains/financialModels';
import { CalculationService } from '../services/calculationService';

// Import UI state store separately
import { uiStore } from './uiStore';

function createDefaultState(): CalculatorState {
	return {
		currency: 'USD',
		sharedExpenses: 3000,
		timeframe: 'monthly',
		people: [createInitialPerson('Partner A'), createInitialPerson('Partner B')],
		propertyArrangement: 'none',
		propertyOwnerId: null,
		marketRent: 0
	};
}

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
	const initialState = loadFromStorage() || createDefaultState();
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
		update, // CRITICAL: Expose update method for direct state updates

		// Partner management
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

		// Inheritance management
		addInheritance(personId: string) {
			update((state) => ({
				...state,
				people: state.people.map((p) =>
					p.id === personId
						? {
								...p,
								inheritances: [
									...p.inheritances,
									createInitialInheritance(`Inheritance ${p.inheritances.length + 1}`)
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

		// UI state management (delegated to uiStore)
		toggleSection(key: string) {
			uiStore.toggleSection(key);
		},

		setActiveSection(key: string | null) {
			uiStore.setActiveSection(key);
		},

		// Global settings
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

		updateCurrency(currency: string) {
			update((state) => ({ ...state, currency }));
		},

		updateSharedExpenses(expenses: number) {
			update((state) => ({ ...state, sharedExpenses: Math.max(0, expenses) }));
		},

		// CRITICAL FIX: This method was missing proper implementation
		updateMarketRent(rent: number) {
			update((state) => {
				console.log('🔧 Updating market rent:', { old: state.marketRent, new: rent });
				return { ...state, marketRent: Math.max(0, rent) };
			});
		},

		setPropertyArrangement(arrangement: 'none' | 'owned') {
			update((state) => ({
				...state,
				propertyArrangement: arrangement,
				// Clear owner when switching to 'none'
				propertyOwnerId: arrangement === 'none' ? null : state.propertyOwnerId
			}));
		},

		setPropertyOwner(ownerId: string | null) {
			update((state) => {
				// Ensure arrangement is 'owned' when setting owner
				const newArrangement = ownerId ? 'owned' : 'none';
				console.log('🔧 Setting property owner:', { ownerId, arrangement: newArrangement });
				return {
					...state,
					propertyArrangement: newArrangement,
					propertyOwnerId: ownerId
				};
			});
		},

		// Data export/import
		exportState(): string {
			const calculatorState = get({ subscribe });
			const uiState = get(uiStore);
			
			const exportData = {
				meta: {
					version: 1,
					date: new Date().toISOString(),
					app: 'Financial Contribution Calculator'
				},
				calculator: calculatorState,
				ui: uiState
			};
			
			return JSON.stringify(exportData, null, 2);
		},

		importState(jsonString: string): boolean {
			try {
				const parsed = JSON.parse(jsonString);
				
				// Handle legacy format (direct calculator state)
				if (parsed.people && Array.isArray(parsed.people) && !parsed.calculator) {
					console.log('Importing legacy format');
					set(parsed);
					return true;
				}

				// Handle new format
				if (parsed.calculator) {
					if (!parsed.calculator.people || !Array.isArray(parsed.calculator.people)) {
						throw new Error('Invalid calculator state format');
					}
					set(parsed.calculator);
					
					// Import UI state if present
					if (parsed.ui) {
						uiStore.setState(parsed.ui);
					}
					
					return true;
				}

				throw new Error('Unknown file format');
			} catch (error) {
				console.error('Failed to import state:', error);
				return false;
			}
		},

		resetState() {
			set(createDefaultState());
		},

		getResults() {
			const state = get({ subscribe });
			return CalculationService.calculate(state);
		}
	};
}

export const calculatorStore = createStore();
