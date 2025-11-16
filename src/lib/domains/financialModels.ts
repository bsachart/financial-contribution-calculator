/**
 * Core domain models for the financial calculator
 * Pure TypeScript interfaces and factory functions - no Svelte dependencies
 */

export interface Inheritance {
	id: string;
	name: string;
	amount: number;
	receivedDate: string; // ISO date string (YYYY-MM-DD)
	discount: number; // 0-100 percentage
	returnRate: number; // Annual percentage rate
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
}

// Constants
export const ASSUMED_RETURN_RATE = 5.5;
export const DEFAULT_PASSIVE_ADVANTAGES_RATE = 5.5;

/**
 * Factory function to create a new Person with sensible defaults
 */
export function createInitialPerson(name: string): Person {
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

/**
 * Factory function to create a new Inheritance with sensible defaults
 */
export function createInitialInheritance(name: string): Inheritance {
	return {
		id: crypto.randomUUID(),
		name,
		amount: 0,
		receivedDate: new Date().toISOString().split('T')[0], // Today
		discount: 0,
		returnRate: ASSUMED_RETURN_RATE
	};
}
