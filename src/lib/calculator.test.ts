import { describe, it, expect } from 'vitest';
import { calculate } from './calculator';
import type { CalculatorState, Person } from './stores/calculatorStore';

const createPerson = (overrides: Partial<Person> = {}): Person => ({
	id: crypto.randomUUID(),
	name: 'Test Person',
	netIncome: 0,
	inheritances: [],
	passiveAdvantages: 0,
	passiveAdvantagesDiscount: 70,
	passiveAdvantagesReturnRate: 5.5,
	expectedFutureInheritance: 0,
	expectedFutureInheritanceDiscount: 50,
	studentLoans: 0,
	familySupport: 0,
	variableIncome: 0,
	variableIncomeDiscount: 20,
	retirementMatching: 0,
	...overrides
});

const DEFAULT_STATE: CalculatorState = {
	currency: 'USD',
	sharedExpenses: 3000,
	timeframe: 'monthly',
	people: [],
	propertyArrangement: 'none',
	propertyOwnerId: null,
	marketRent: 0,
	activeSection: null,
	enabledSections: []
};

describe('Calculator - Basic Functionality', () => {
	it('handles zero income without NaN', () => {
		const state = {
			...DEFAULT_STATE,
			people: [createPerson({ id: '1', netIncome: 0 }), createPerson({ id: '2', netIncome: 0 })]
		};
		const results = calculate(state);

		expect(results).toHaveLength(2);
		results.forEach((r) => {
			expect(r.monthlyCapacity).toBe(0);
			expect(r.monthlyContribution).toBe(0);
			expect(r.percentage).toBe(0);
			expect(isNaN(r.percentage)).toBe(false);
		});
	});

	it('splits 60/40 based on income ratio', () => {
		const state = {
			...DEFAULT_STATE,
			people: [
				createPerson({ id: '1', netIncome: 6000 }),
				createPerson({ id: '2', netIncome: 4000 })
			]
		};
		const results = calculate(state);

		const a = results.find((r) => r.personId === '1')!;
		const b = results.find((r) => r.personId === '2')!;

		expect(a.percentage).toBeCloseTo(60, 1);
		expect(b.percentage).toBeCloseTo(40, 1);
		expect(a.monthlyContribution).toBeCloseTo(1800, 0);
		expect(b.monthlyContribution).toBeCloseTo(1200, 0);
	});

	it('handles three partners with varying incomes', () => {
		const state = {
			...DEFAULT_STATE,
			people: [
				createPerson({ id: '1', netIncome: 6000 }),
				createPerson({ id: '2', netIncome: 4000 }),
				createPerson({ id: '3', netIncome: 2000 })
			]
		};
		const results = calculate(state);

		expect(results).toHaveLength(3);
		const totalPercentage = results.reduce((sum, r) => sum + r.percentage, 0);
		expect(totalPercentage).toBeCloseTo(100, 5);

		const a = results.find((r) => r.personId === '1')!;
		expect(a.percentage).toBeCloseTo(50, 1);
	});

	it('handles zero shared expenses', () => {
		const state = {
			...DEFAULT_STATE,
			sharedExpenses: 0,
			people: [
				createPerson({ id: '1', netIncome: 5000 }),
				createPerson({ id: '2', netIncome: 3000 })
			]
		};
		const results = calculate(state);

		results.forEach((r) => {
			expect(r.monthlyContribution).toBe(0);
			expect(isNaN(r.percentage)).toBe(false);
		});
	});

	it('handles negative values gracefully', () => {
		const state = {
			...DEFAULT_STATE,
			people: [
				createPerson({ id: '1', netIncome: -1000 }),
				createPerson({ id: '2', netIncome: 5000 })
			]
		};
		const results = calculate(state);

		expect(results[0].monthlyCapacity).toBe(0);
		expect(results[1].monthlyCapacity).toBeGreaterThan(0);
	});
});

describe('Calculator - Inheritance with Compounding', () => {
	it('compounds inheritance from received date', () => {
		// Create a date 5 years ago
		const fiveYearsAgo = new Date();
		fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);

		const state = {
			...DEFAULT_STATE,
			people: [
				createPerson({
					id: '1',
					netIncome: 5000,
					inheritances: [
						{
							id: 'i1',
							name: 'Test',
							amount: 100000,
							receivedDate: fiveYearsAgo.toISOString().split('T')[0],
							discount: 0,
							returnRate: 5.5
						}
					]
				}),
				createPerson({ id: '2', netIncome: 5000 })
			]
		};
		const results = calculate(state);

		const a = results.find((r) => r.personId === '1')!;
		const b = results.find((r) => r.personId === '2')!;

		// After 5 years at 5.5%: $100k * (1.055^5) ≈ $131,010
		// Monthly income: $131,010 * 0.055 / 12 ≈ $600/month
		expect(a.monthlyCapacity).toBeGreaterThan(5500);
		expect(a.monthlyCapacity).toBeLessThan(5700);
		expect(b.monthlyCapacity).toBeCloseTo(5000, 0);
		expect(a.percentage).toBeGreaterThan(b.percentage);
	});

	it('handles multiple inheritances per person with different dates', () => {
		const fiveYearsAgo = new Date();
		fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);

		const oneYearAgo = new Date();
		oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

		const state = {
			...DEFAULT_STATE,
			people: [
				createPerson({
					id: '1',
					netIncome: 5000,
					inheritances: [
						{
							id: 'i1',
							name: 'Inheritance 1',
							amount: 50000,
							receivedDate: fiveYearsAgo.toISOString().split('T')[0],
							discount: 0,
							returnRate: 5.5
						},
						{
							id: 'i2',
							name: 'Inheritance 2',
							amount: 50000,
							receivedDate: oneYearAgo.toISOString().split('T')[0],
							discount: 50,
							returnRate: 5.5
						}
					]
				}),
				createPerson({ id: '2', netIncome: 5000 })
			]
		};
		const results = calculate(state);

		const a = results.find((r) => r.personId === '1')!;
		// First inheritance compounded 5 years
		// Second inheritance compounded 1 year with 50% discount
		expect(a.monthlyCapacity).toBeGreaterThan(5300);
	});

	it('applies discount after compounding', () => {
		const fiveYearsAgo = new Date();
		fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);

		const state = {
			...DEFAULT_STATE,
			people: [
				createPerson({
					id: '1',
					netIncome: 5000,
					inheritances: [
						{
							id: 'i1',
							name: 'Illiquid',
							amount: 100000,
							receivedDate: fiveYearsAgo.toISOString().split('T')[0],
							discount: 50, // 50% discount
							returnRate: 5.5
						}
					]
				}),
				createPerson({ id: '2', netIncome: 5000 })
			]
		};
		const results = calculate(state);

		const a = results.find((r) => r.personId === '1')!;
		// Compounded value ≈ $131k, then 50% discount = $65.5k
		// Monthly: $65.5k * 0.055 / 12 ≈ $300/month
		expect(a.monthlyCapacity).toBeGreaterThan(5250);
		expect(a.monthlyCapacity).toBeLessThan(5350);
	});

	it('applies discount to passive advantages', () => {
		const state = {
			...DEFAULT_STATE,
			people: [
				createPerson({
					id: '1',
					netIncome: 5000,
					passiveAdvantages: 100000,
					passiveAdvantagesDiscount: 70,
					passiveAdvantagesReturnRate: 6.0
				}),
				createPerson({ id: '2', netIncome: 5000 })
			]
		};
		const results = calculate(state);

		const a = results.find((r) => r.personId === '1')!;
		// $100k * 0.3 * 6% / 12 = ~$150/month
		expect(a.monthlyCapacity).toBeCloseTo(5150, 0);
	});

	it('applies uncertainty discount to future inheritance', () => {
		const state = {
			...DEFAULT_STATE,
			people: [
				createPerson({
					id: '1',
					netIncome: 5000,
					expectedFutureInheritance: 200000,
					expectedFutureInheritanceDiscount: 50
				}),
				createPerson({ id: '2', netIncome: 5000 })
			]
		};
		const results = calculate(state);

		const a = results.find((r) => r.personId === '1')!;
		// $200k * 0.5 * 5.5% / 12 = ~$458/month
		expect(a.monthlyCapacity).toBeCloseTo(5458, 0);
	});
});

describe('Calculator - Debt & Obligations', () => {
	it('deducts student loans from capacity', () => {
		const state = {
			...DEFAULT_STATE,
			people: [
				createPerson({ id: '1', netIncome: 5000, studentLoans: 500 }),
				createPerson({ id: '2', netIncome: 5000 })
			]
		};
		const results = calculate(state);

		const a = results.find((r) => r.personId === '1')!;
		expect(a.monthlyCapacity).toBeCloseTo(4500, 0);
	});

	it('deducts family support from capacity', () => {
		const state = {
			...DEFAULT_STATE,
			people: [
				createPerson({ id: '1', netIncome: 5000, familySupport: 800 }),
				createPerson({ id: '2', netIncome: 5000 })
			]
		};
		const results = calculate(state);

		const a = results.find((r) => r.personId === '1')!;
		expect(a.monthlyCapacity).toBeCloseTo(4200, 0);
	});

	it('handles combined debt obligations', () => {
		const state = {
			...DEFAULT_STATE,
			people: [
				createPerson({ id: '1', netIncome: 6000, studentLoans: 500, familySupport: 300 }),
				createPerson({ id: '2', netIncome: 5000 })
			]
		};
		const results = calculate(state);

		const a = results.find((r) => r.personId === '1')!;
		expect(a.monthlyCapacity).toBeCloseTo(5200, 0);
	});
});

describe('Calculator - Variable Income', () => {
	it('applies uncertainty discount correctly', () => {
		const state = {
			...DEFAULT_STATE,
			people: [
				createPerson({
					id: '1',
					netIncome: 5000,
					variableIncome: 12000,
					variableIncomeDiscount: 50
				}),
				createPerson({ id: '2', netIncome: 5000 })
			]
		};
		const results = calculate(state);

		const a = results.find((r) => r.personId === '1')!;
		// $12k * 50% / 12 = $500/month
		expect(a.monthlyCapacity).toBeCloseTo(5500, 0);
	});

	it('handles 0% discount (guaranteed bonus)', () => {
		const state = {
			...DEFAULT_STATE,
			people: [
				createPerson({
					id: '1',
					netIncome: 5000,
					variableIncome: 12000,
					variableIncomeDiscount: 0
				}),
				createPerson({ id: '2', netIncome: 5000 })
			]
		};
		const results = calculate(state);

		const a = results.find((r) => r.personId === '1')!;
		expect(a.monthlyCapacity).toBeCloseTo(6000, 0);
	});

	it('handles 100% discount (ignore variable income)', () => {
		const state = {
			...DEFAULT_STATE,
			people: [
				createPerson({
					id: '1',
					netIncome: 5000,
					variableIncome: 12000,
					variableIncomeDiscount: 100
				}),
				createPerson({ id: '2', netIncome: 5000 })
			]
		};
		const results = calculate(state);

		const a = results.find((r) => r.personId === '1')!;
		expect(a.monthlyCapacity).toBeCloseTo(5000, 0);
	});
});

describe('Calculator - Retirement Matching', () => {
	it('adds employer matching to capacity', () => {
		const state = {
			...DEFAULT_STATE,
			people: [
				createPerson({ id: '1', netIncome: 5000, retirementMatching: 300 }),
				createPerson({ id: '2', netIncome: 5000 })
			]
		};
		const results = calculate(state);

		const a = results.find((r) => r.personId === '1')!;
		const b = results.find((r) => r.personId === '2')!;

		expect(a.monthlyCapacity).toBeCloseTo(5300, 0);
		expect(b.monthlyCapacity).toBeCloseTo(5000, 0);
	});

	it('handles matching correctly in split', () => {
		const state = {
			...DEFAULT_STATE,
			people: [
				createPerson({ id: '1', netIncome: 6000, retirementMatching: 500 }),
				createPerson({ id: '2', netIncome: 4000 })
			]
		};
		const results = calculate(state);

		const a = results.find((r) => r.personId === '1')!;
		// 6500 / (6500 + 4000) = 61.9%
		expect(a.percentage).toBeCloseTo(61.9, 1);
	});
});

describe('Calculator - Property Ownership', () => {
	it('adds imputed rent for owner', () => {
		const state = {
			...DEFAULT_STATE,
			propertyArrangement: 'owned',
			propertyOwnerId: '1',
			marketRent: 2000,
			people: [
				createPerson({ id: '1', netIncome: 5000 }),
				createPerson({ id: '2', netIncome: 5000 })
			]
		};
		const results = calculate(state);

		const a = results.find((r) => r.personId === '1')!;
		const b = results.find((r) => r.personId === '2')!;

		// Owner gets 50% of $2000 = $1000 added to capacity
		expect(a.monthlyCapacity).toBeCloseTo(6000, 0);
		expect(b.monthlyCapacity).toBeCloseTo(5000, 0);
	});

	it('handles property ownership with unequal incomes', () => {
		const state = {
			...DEFAULT_STATE,
			propertyArrangement: 'owned',
			propertyOwnerId: '2',
			marketRent: 3000,
			people: [
				createPerson({ id: '1', netIncome: 8000 }),
				createPerson({ id: '2', netIncome: 4000 })
			]
		};
		const results = calculate(state);

		const a = results.find((r) => r.personId === '1')!;
		const b = results.find((r) => r.personId === '2')!;

		// Owner (lower earner) gets $1500 boost
		expect(b.monthlyCapacity).toBeCloseTo(5500, 0);
		expect(a.monthlyCapacity).toBeCloseTo(8000, 0);
	});

	it('ignores property if no owner set', () => {
		const state = {
			...DEFAULT_STATE,
			propertyArrangement: 'owned',
			propertyOwnerId: null,
			marketRent: 2000,
			people: [
				createPerson({ id: '1', netIncome: 5000 }),
				createPerson({ id: '2', netIncome: 5000 })
			]
		};
		const results = calculate(state);

		results.forEach((r) => {
			expect(r.monthlyCapacity).toBeCloseTo(5000, 0);
		});
	});
});

describe('Calculator - Timeframe Conversion', () => {
	it('converts yearly to monthly correctly', () => {
		const state = {
			...DEFAULT_STATE,
			timeframe: 'yearly',
			sharedExpenses: 36000,
			people: [
				createPerson({ id: '1', netIncome: 60000 }),
				createPerson({ id: '2', netIncome: 40000 })
			]
		};
		const results = calculate(state);

		const a = results.find((r) => r.personId === '1')!;
		expect(a.monthlyContribution).toBeCloseTo(1800, 0);
	});

	it('converts yearly debt obligations correctly', () => {
		const state = {
			...DEFAULT_STATE,
			timeframe: 'yearly',
			people: [
				createPerson({ id: '1', netIncome: 60000, studentLoans: 6000 }),
				createPerson({ id: '2', netIncome: 60000 })
			]
		};
		const results = calculate(state);

		const a = results.find((r) => r.personId === '1')!;
		expect(a.monthlyCapacity).toBeCloseTo(4500, 0);
	});
});

describe('Calculator - Complex Scenarios', () => {
	it('handles all features combined', () => {
		const fiveYearsAgo = new Date();
		fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);

		const state = {
			...DEFAULT_STATE,
			propertyArrangement: 'owned',
			propertyOwnerId: '1',
			marketRent: 2000,
			people: [
				createPerson({
					id: '1',
					netIncome: 8000,
					inheritances: [
						{
							id: 'i1',
							name: 'Estate',
							amount: 200000,
							receivedDate: fiveYearsAgo.toISOString().split('T')[0],
							discount: 0,
							returnRate: 5.5
						}
					],
					studentLoans: 500,
					retirementMatching: 400,
					variableIncome: 12000,
					variableIncomeDiscount: 30
				}),
				createPerson({
					id: '2',
					netIncome: 5000,
					passiveAdvantages: 100000,
					passiveAdvantagesDiscount: 70,
					familySupport: 300
				})
			]
		};
		const results = calculate(state);

		const a = results.find((r) => r.personId === '1')!;
		const b = results.find((r) => r.personId === '2')!;

		expect(a.monthlyCapacity).toBeGreaterThan(10000);
		expect(b.monthlyCapacity).toBeGreaterThan(4500);
		expect(a.percentage).toBeGreaterThan(65);
	});

	it('prevents negative capacities', () => {
		const state = {
			...DEFAULT_STATE,
			people: [
				createPerson({ id: '1', netIncome: 3000, studentLoans: 2000, familySupport: 1500 }),
				createPerson({ id: '2', netIncome: 5000 })
			]
		};
		const results = calculate(state);

		results.forEach((r) => {
			expect(r.monthlyCapacity).toBeGreaterThanOrEqual(0);
			expect(r.monthlyContribution).toBeGreaterThanOrEqual(0);
		});
	});
});
