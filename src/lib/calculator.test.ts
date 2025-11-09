import { describe, it, expect } from 'vitest';
import { calculate } from './calculator';
import type { CalculatorState } from './stores/calculatorStore';

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

describe('Calculator', () => {
	describe('Edge Cases', () => {
		it('handles zero income without NaN', () => {
			const state = {
				...DEFAULT_STATE,
				people: [
					{ id: '1', name: 'A', netIncome: 0, variableIncomeDiscount: 20 },
					{ id: '2', name: 'B', netIncome: 0, variableIncomeDiscount: 20 }
				]
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

		it('handles three partners with varying incomes', () => {
			const state = {
				...DEFAULT_STATE,
				people: [
					{ id: '1', name: 'A', netIncome: 6000, variableIncomeDiscount: 20 },
					{ id: '2', name: 'B', netIncome: 4000, variableIncomeDiscount: 20 },
					{ id: '3', name: 'C', netIncome: 2000, variableIncomeDiscount: 20 }
				]
			};
			const results = calculate(state);

			expect(results).toHaveLength(3);
			const totalPercentage = results.reduce((sum, r) => sum + r.percentage, 0);
			expect(totalPercentage).toBeCloseTo(100, 5);

			const a = results.find((r) => r.personId === '1')!;
			expect(a.percentage).toBeCloseTo(50, 1); // 6000 / 12000 = 50%
		});

		it('handles single partner edge case', () => {
			const state = {
				...DEFAULT_STATE,
				people: [{ id: '1', name: 'A', netIncome: 5000, variableIncomeDiscount: 20 }]
			};
			const results = calculate(state);

			expect(results).toHaveLength(1);
			expect(results[0].percentage).toBe(100);
			expect(results[0].monthlyContribution).toBe(3000);
		});

		it('handles zero shared expenses', () => {
			const state = {
				...DEFAULT_STATE,
				sharedExpenses: 0,
				people: [
					{ id: '1', name: 'A', netIncome: 5000, variableIncomeDiscount: 20 },
					{ id: '2', name: 'B', netIncome: 3000, variableIncomeDiscount: 20 }
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
					{ id: '1', name: 'A', netIncome: -1000, variableIncomeDiscount: 20 },
					{ id: '2', name: 'B', netIncome: 5000, variableIncomeDiscount: 20 }
				]
			};
			const results = calculate(state);

			expect(results[0].monthlyCapacity).toBe(0); // Should clamp to 0
			expect(results[1].monthlyCapacity).toBeGreaterThan(0);
		});

		it('handles very high inheritance values', () => {
			const state = {
				...DEFAULT_STATE,
				people: [
					{
						id: '1',
						name: 'A',
						netIncome: 5000,
						inheritances: [
							{ id: 'i1', name: 'Test', amount: 5000000, discount: 0, returnRate: 5.5 }
						],
						passiveAdvantages: 0,
						passiveAdvantagesDiscount: 70,
						passiveAdvantagesReturnRate: 5.5,
						expectedFutureInheritance: 0,
						expectedFutureInheritanceDiscount: 50,
						studentLoans: 0,
						familySupport: 0,
						variableIncome: 0,
						variableIncomeDiscount: 20,
						retirementMatching: 0
					},
					{ id: '2', name: 'B', netIncome: 5000, variableIncomeDiscount: 20 }
				]
			};
			const results = calculate(state);

			const a = results.find((r) => r.personId === '1')!;
			const b = results.find((r) => r.personId === '2')!;

			// A should have significantly higher capacity due to $5M inheritance
			expect(a.monthlyCapacity).toBeGreaterThan(b.monthlyCapacity * 2);
			expect(a.percentage).toBeGreaterThan(80);
		});

		it('handles uneven inheritance discount rates', () => {
			const state = {
				...DEFAULT_STATE,
				people: [
					{
						id: '1',
						name: 'A',
						netIncome: 5000,
						inheritances: [
							{ id: 'i1', name: 'Illiquid', amount: 100000, discount: 80, returnRate: 5.5 }
						],
						passiveAdvantages: 0,
						passiveAdvantagesDiscount: 70,
						passiveAdvantagesReturnRate: 5.5,
						expectedFutureInheritance: 0,
						expectedFutureInheritanceDiscount: 50,
						studentLoans: 0,
						familySupport: 0,
						variableIncome: 0,
						variableIncomeDiscount: 20,
						retirementMatching: 0
					},
					{
						id: '2',
						name: 'B',
						netIncome: 5000,
						inheritances: [
							{ id: 'i2', name: 'Cash', amount: 100000, discount: 0, returnRate: 5.5 }
						],
						passiveAdvantages: 0,
						passiveAdvantagesDiscount: 70,
						passiveAdvantagesReturnRate: 5.5,
						expectedFutureInheritance: 0,
						expectedFutureInheritanceDiscount: 50,
						studentLoans: 0,
						familySupport: 0,
						variableIncome: 0,
						variableIncomeDiscount: 20,
						retirementMatching: 0
					}
				]
			};
			const results = calculate(state);

			const a = results.find((r) => r.personId === '1')!;
			const b = results.find((r) => r.personId === '2')!;

			// B should have higher capacity due to lower discount on inheritance
			expect(b.monthlyCapacity).toBeGreaterThan(a.monthlyCapacity);
		});
	});

	describe('Basic Calculations', () => {
		it('splits 60/40 based on income ratio', () => {
			const state = {
				...DEFAULT_STATE,
				people: [
					{ id: '1', name: 'A', netIncome: 6000, variableIncomeDiscount: 20 },
					{ id: '2', name: 'B', netIncome: 4000, variableIncomeDiscount: 20 }
				]
			};
			const results = calculate(state);

			const a = results.find((r) => r.personId === '1')!;
			const b = results.find((r) => r.personId === '2')!;

			expect(a.percentage).toBeCloseTo(60, 1);
			expect(b.percentage).toBeCloseTo(40, 1);
			expect(a.monthlyContribution).toBeCloseTo(1800, 0); // 60% of $3000
			expect(b.monthlyContribution).toBeCloseTo(1200, 0); // 40% of $3000
		});

		it('handles retirement matching correctly', () => {
			const state = {
				...DEFAULT_STATE,
				people: [
					{
						id: '1',
						name: 'A',
						netIncome: 6000,
						retirementMatching: 500,
						variableIncomeDiscount: 20
					},
					{ id: '2', name: 'B', netIncome: 4000, variableIncomeDiscount: 20 }
				]
			};
			const results = calculate(state);

			const a = results.find((r) => r.personId === '1')!;
			// Person A has $6500 total income (6000 + 500 matching), Person B has $4000
			// Ratio should be 62/38
			expect(a.percentage).toBeCloseTo(61.9, 1);
			expect(a.monthlyCapacity).toBeCloseTo(6500, 0);
		});
	});

	describe('Inheritance', () => {
		it('adds imputed income from direct inheritance with configurable rate', () => {
			const state = {
				...DEFAULT_STATE,
				people: [
					{
						id: '1',
						name: 'A',
						netIncome: 5000,
						inheritances: [
							{ id: 'i1', name: 'Test', amount: 100000, discount: 0, returnRate: 7.0 }
						],
						passiveAdvantages: 0,
						passiveAdvantagesDiscount: 70,
						passiveAdvantagesReturnRate: 5.5,
						expectedFutureInheritance: 0,
						expectedFutureInheritanceDiscount: 50,
						studentLoans: 0,
						familySupport: 0,
						variableIncome: 0,
						variableIncomeDiscount: 20,
						retirementMatching: 0
					},
					{ id: '2', name: 'B', netIncome: 5000, variableIncomeDiscount: 20 }
				]
			};
			const results = calculate(state);

			const a = results.find((r) => r.personId === '1')!;
			const b = results.find((r) => r.personId === '2')!;

			// $100k * 7% / 12 = ~$583/month imputed income
			expect(a.monthlyCapacity).toBeCloseTo(5583, 0);
			expect(b.monthlyCapacity).toBeCloseTo(5000, 0);
			expect(a.percentage).toBeGreaterThan(b.percentage);
		});

		it('applies discount to passive advantages with configurable rate', () => {
			const state = {
				...DEFAULT_STATE,
				people: [
					{
						id: '1',
						name: 'A',
						netIncome: 5000,
						inheritances: [],
						passiveAdvantages: 100000,
						passiveAdvantagesDiscount: 70,
						passiveAdvantagesReturnRate: 6.0,
						expectedFutureInheritance: 0,
						expectedFutureInheritanceDiscount: 50,
						studentLoans: 0,
						familySupport: 0,
						variableIncome: 0,
						variableIncomeDiscount: 20,
						retirementMatching: 0
					},
					{ id: '2', name: 'B', netIncome: 5000, variableIncomeDiscount: 20 }
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
					{
						id: '1',
						name: 'A',
						netIncome: 5000,
						inheritances: [],
						passiveAdvantages: 0,
						passiveAdvantagesDiscount: 70,
						passiveAdvantagesReturnRate: 5.5,
						expectedFutureInheritance: 200000,
						expectedFutureInheritanceDiscount: 50,
						studentLoans: 0,
						familySupport: 0,
						variableIncome: 0,
						variableIncomeDiscount: 20,
						retirementMatching: 0
					},
					{ id: '2', name: 'B', netIncome: 5000, variableIncomeDiscount: 20 }
				]
			};
			const results = calculate(state);

			const a = results.find((r) => r.personId === '1')!;
			// $200k * 0.5 * 5.5% / 12 = ~$458/month
			expect(a.monthlyCapacity).toBeCloseTo(5458, 0);
		});

		it('handles multiple inheritances per person', () => {
			const state = {
				...DEFAULT_STATE,
				people: [
					{
						id: '1',
						name: 'A',
						netIncome: 5000,
						inheritances: [
							{ id: 'i1', name: 'Inheritance 1', amount: 50000, discount: 0, returnRate: 5.5 },
							{ id: 'i2', name: 'Inheritance 2', amount: 50000, discount: 50, returnRate: 5.5 }
						],
						passiveAdvantages: 0,
						passiveAdvantagesDiscount: 70,
						passiveAdvantagesReturnRate: 5.5,
						expectedFutureInheritance: 0,
						expectedFutureInheritanceDiscount: 50,
						studentLoans: 0,
						familySupport: 0,
						variableIncome: 0,
						variableIncomeDiscount: 20,
						retirementMatching: 0
					},
					{ id: '2', name: 'B', netIncome: 5000, variableIncomeDiscount: 20 }
				]
			};
			const results = calculate(state);

			const a = results.find((r) => r.personId === '1')!;
			// First: $50k * 5.5% / 12 = $229
			// Second: $50k * 0.5 * 5.5% / 12 = $115
			// Total imputed income: $344
			expect(a.monthlyCapacity).toBeCloseTo(5344, 0);
		});
	});

	describe('Debt & Obligations', () => {
		it('deducts student loans from capacity', () => {
			const state = {
				...DEFAULT_STATE,
				people: [
					{ id: '1', name: 'A', netIncome: 5000, studentLoans: 500, variableIncomeDiscount: 20 },
					{ id: '2', name: 'B', netIncome: 5000, variableIncomeDiscount: 20 }
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
					{ id: '1', name: 'A', netIncome: 5000, familySupport: 800, variableIncomeDiscount: 20 },
					{ id: '2', name: 'B', netIncome: 5000, variableIncomeDiscount: 20 }
				]
			};
			const results = calculate(state);

			const a = results.find((r) => r.personId === '1')!;
			expect(a.monthlyCapacity).toBeCloseTo(4200, 0);
		});
	});

	describe('Variable Income', () => {
		it('applies uncertainty discount correctly', () => {
			const state = {
				...DEFAULT_STATE,
				people: [
					{
						id: '1',
						name: 'A',
						netIncome: 5000,
						variableIncome: 12000,
						variableIncomeDiscount: 50
					},
					{ id: '2', name: 'B', netIncome: 5000, variableIncomeDiscount: 20 }
				]
			};
			const results = calculate(state);

			const a = results.find((r) => r.personId === '1')!;
			// $12k * 50% discount / 12 = $500/month
			expect(a.monthlyCapacity).toBeCloseTo(5500, 0);
		});

		it('handles 0% discount (guaranteed bonus)', () => {
			const state = {
				...DEFAULT_STATE,
				people: [
					{ id: '1', name: 'A', netIncome: 5000, variableIncome: 12000, variableIncomeDiscount: 0 },
					{ id: '2', name: 'B', netIncome: 5000, variableIncomeDiscount: 20 }
				]
			};
			const results = calculate(state);

			const a = results.find((r) => r.personId === '1')!;
			// $12k / 12 = $1000/month
			expect(a.monthlyCapacity).toBeCloseTo(6000, 0);
		});

		it('handles 100% discount (ignore variable income)', () => {
			const state = {
				...DEFAULT_STATE,
				people: [
					{
						id: '1',
						name: 'A',
						netIncome: 5000,
						variableIncome: 12000,
						variableIncomeDiscount: 100
					},
					{ id: '2', name: 'B', netIncome: 5000, variableIncomeDiscount: 20 }
				]
			};
			const results = calculate(state);

			const a = results.find((r) => r.personId === '1')!;
			expect(a.monthlyCapacity).toBeCloseTo(5000, 0);
		});
	});

	describe('Property Ownership', () => {
		it('adds imputed rent for owner', () => {
			const state = {
				...DEFAULT_STATE,
				propertyArrangement: 'owned',
				propertyOwnerId: '1',
				marketRent: 2000,
				people: [
					{ id: '1', name: 'A', netIncome: 5000, variableIncomeDiscount: 20 },
					{ id: '2', name: 'B', netIncome: 5000, variableIncomeDiscount: 20 }
				]
			};
			const results = calculate(state);

			const a = results.find((r) => r.personId === '1')!;
			const b = results.find((r) => r.personId === '2')!;

			// Owner gets $2000 imputed income, but pays 50% of it as rent = $1000 net benefit
			expect(a.monthlyCapacity).toBeCloseTo(6000, 0); // $5000 + $1000
			expect(b.monthlyCapacity).toBeCloseTo(5000, 0);
		});
	});

	describe('Yearly/Monthly Conversion', () => {
		it('converts yearly to monthly correctly', () => {
			const state = {
				...DEFAULT_STATE,
				timeframe: 'yearly',
				sharedExpenses: 36000, // $3000/month
				people: [
					{ id: '1', name: 'A', netIncome: 60000, variableIncomeDiscount: 20 }, // $5000/month
					{ id: '2', name: 'B', netIncome: 40000, variableIncomeDiscount: 20 } // $3333/month
				]
			};
			const results = calculate(state);

			const a = results.find((r) => r.personId === '1')!;
			expect(a.monthlyContribution).toBeCloseTo(1800, 0); // Still 60% of $3000
		});

		it('converts yearly inheritance values correctly', () => {
			const state = {
				...DEFAULT_STATE,
				timeframe: 'yearly',
				people: [
					{
						id: '1',
						name: 'A',
						netIncome: 60000,
						inheritances: [
							{ id: 'i1', name: 'Test', amount: 120000, discount: 0, returnRate: 5.5 }
						],
						passiveAdvantages: 0,
						passiveAdvantagesDiscount: 70,
						passiveAdvantagesReturnRate: 5.5,
						expectedFutureInheritance: 0,
						expectedFutureInheritanceDiscount: 50,
						studentLoans: 0,
						familySupport: 0,
						variableIncome: 0,
						variableIncomeDiscount: 20,
						retirementMatching: 0
					},
					{ id: '2', name: 'B', netIncome: 60000, variableIncomeDiscount: 20 }
				]
			};
			const results = calculate(state);

			const a = results.find((r) => r.personId === '1')!;
			// $120k * 5.5% / 12 = $550/month imputed income
			expect(a.monthlyCapacity).toBeCloseTo(5550, 0);
		});
	});

	describe('Retirement Matching', () => {
		it('adds employer matching to capacity', () => {
			const state = {
				...DEFAULT_STATE,
				people: [
					{
						id: '1',
						name: 'A',
						netIncome: 5000,
						retirementMatching: 300,
						variableIncomeDiscount: 20
					},
					{ id: '2', name: 'B', netIncome: 5000, retirementMatching: 0, variableIncomeDiscount: 20 }
				]
			};
			const results = calculate(state);

			const a = results.find((r) => r.personId === '1')!;
			const b = results.find((r) => r.personId === '2')!;

			expect(a.monthlyCapacity).toBeCloseTo(5300, 0); // 5000 + 300
			expect(b.monthlyCapacity).toBeCloseTo(5000, 0);
		});
	});
});
