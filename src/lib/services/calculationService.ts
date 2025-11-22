import type { CalculatorState, Person, Inheritance } from '../domains/financialModels';
import { ASSUMED_RETURN_RATE } from '../domains/financialModels';

export interface CalculationResult {
	personId: string;
	monthlyCapacity: number;
	monthlyContribution: number;
	percentage: number;
	monthlyDisposable: number;
	monthlyNetIncome: number;
	breakdown: Array<{
		label: string;
		amount: number;
		type: 'income' | 'deduction' | 'imputed';
		category: string;
	}>;
}

export class CalculationService {
	/**
	 * Main entry point for calculating financial contributions.
	 */
	static calculate(state: CalculatorState): CalculationResult[] {
		if (!state.people || state.people.length === 0) {
			return [];
		}

		const isYearly = state.timeframe === 'yearly';
		const conversionFactor = isYearly ? 1 / 12 : 1;
		const sharedExpensesMonthly = Math.max(0, state.sharedExpenses * conversionFactor);

		// Step 1: Calculate base capacity for each person
		let capacities = state.people.map((person) =>
			this.calculateBaseCapacity(person, state.timeframe)
		);

		// Step 2: Apply property ownership adjustments if applicable
		capacities = this.applyPropertyAdjustment(state, capacities, conversionFactor);

		// Step 3: Calculate final contributions based on total capacity
		return this.calculateFinalContributions(state, capacities, sharedExpensesMonthly);
	}

	/**
	 * Calculates the base financial capacity for a single person.
	 */
	private static calculateBaseCapacity(
		person: Person,
		timeframe: 'monthly' | 'yearly'
	): {
		personId: string;
		monthlyCapacity: number;
		monthlyNetIncome: number;
		breakdown: CalculationResult['breakdown'];
	} {
		const conversionFactor = timeframe === 'yearly' ? 1 / 12 : 1;
		const netIncome = Math.max(0, person.netIncome) * conversionFactor;
		let capacity = netIncome;

		const breakdown: CalculationResult['breakdown'] = [
			{ label: 'Net Income', amount: netIncome, type: 'income', category: 'income' }
		];

		// 1. Retirement matching
		const matching = Math.max(0, person.retirementMatching) * conversionFactor;
		if (matching > 0) {
			capacity += matching;
			breakdown.push({
				label: 'Employer Retirement Matching',
				amount: matching,
				type: 'income',
				category: 'matching'
			});
		}

		// 2. Direct inheritances
		person.inheritances.forEach((inheritance, index) => {
			const monthlyIncome = this.calculateImputedIncome(inheritance);
			if (monthlyIncome > 0) {
				capacity += monthlyIncome;
				const percentage = 100 - inheritance.discount;
				const years = this.getYearsBetween(inheritance.receivedDate);
				breakdown.push({
					label: `${inheritance.name || `Inheritance ${index + 1}`} (${percentage}% valued, ${years.toFixed(1)}y @ ${inheritance.returnRate}%)`,
					amount: monthlyIncome,
					type: 'imputed',
					category: 'inheritance'
				});
			}
		});

		// 3. Passive advantages
		if (person.passiveAdvantages > 0) {
			const discount = Math.max(0, Math.min(100, person.passiveAdvantagesDiscount)) / 100;
			const rate = person.passiveAdvantagesReturnRate;
			const discountedValue = person.passiveAdvantages * (1 - discount);
			const monthlyIncome = (discountedValue * rate) / (12 * 100);

			if (monthlyIncome > 0) {
				capacity += monthlyIncome;
				breakdown.push({
					label: `Family Advantages (${Math.round((1 - discount) * 100)}% valued @ ${rate}%)`,
					amount: monthlyIncome,
					type: 'imputed',
					category: 'advantages'
				});
			}
		}

		// 4. Expected future inheritance
		if (person.expectedFutureInheritance > 0) {
			const discount = Math.max(0, Math.min(100, person.expectedFutureInheritanceDiscount)) / 100;
			const rate = ASSUMED_RETURN_RATE;
			const discountedValue = person.expectedFutureInheritance * (1 - discount);
			const monthlyIncome = (discountedValue * rate) / (12 * 100);

			if (monthlyIncome > 0) {
				capacity += monthlyIncome;
				breakdown.push({
					label: `Expected Inheritance (${Math.round((1 - discount) * 100)}% valued @ ${rate}%)`,
					amount: monthlyIncome,
					type: 'imputed',
					category: 'future-inheritance'
				});
			}
		}

		// 5. Student loans (Deduction)
		const loans = Math.max(0, person.studentLoans) * conversionFactor;
		if (loans > 0) {
			capacity -= loans;
			breakdown.push({
				label: 'Student Loans',
				amount: -loans,
				type: 'deduction',
				category: 'loans'
			});
		}

		// 6. Family support (Deduction)
		const support = Math.max(0, person.familySupport) * conversionFactor;
		if (support > 0) {
			capacity -= support;
			breakdown.push({
				label: 'Family Support',
				amount: -support,
				type: 'deduction',
				category: 'support'
			});
		}

		// 7. Variable income
		if (person.variableIncome > 0) {
			const discount = Math.max(0, Math.min(100, person.variableIncomeDiscount)) / 100;
			const monthlyValue = (person.variableIncome * (1 - discount)) / 12;

			if (monthlyValue > 0) {
				capacity += monthlyValue;
				breakdown.push({
					label: `Variable Income (${Math.round((1 - discount) * 100)}% valued)`,
					amount: monthlyValue,
					type: 'income',
					category: 'variable'
				});
			}
		}

		return {
			personId: person.id,
			monthlyCapacity: Math.max(0, capacity),
			monthlyNetIncome: netIncome,
			breakdown
		};
	}

	/**
	 * Applies property ownership adjustments (imputed rent for owner, rent deduction for non-owners).
	 */
	private static applyPropertyAdjustment(
		state: CalculatorState,
		capacities: ReturnType<typeof CalculationService.calculateBaseCapacity>[],
		conversionFactor: number
	) {
		const shouldAdjust =
			state.propertyArrangement === 'owned' &&
			state.propertyOwnerId &&
			state.marketRent > 0;

		if (!shouldAdjust) {
			return capacities;
		}

		const monthlyRentValue = Math.max(0, state.marketRent) * conversionFactor;
		const nonOwners = state.people.filter((p) => p.id !== state.propertyOwnerId);
		
		if (nonOwners.length === 0) {
			return capacities;
		}

		// Fix: Rent should be split among ALL people (owner + non-owners) to determine consumption value
		const rentPerPerson = monthlyRentValue / state.people.length;
		const ownerName = state.people.find((p) => p.id === state.propertyOwnerId)?.name || 'Owner';

		return capacities.map((cap) => {
			// Owner: Add rent paid by non-owners as imputed income
			// (This represents the cash/value flow from others to the owner)
			if (cap.personId === state.propertyOwnerId) {
				const rentFromOthers = rentPerPerson * nonOwners.length;
				const newBreakdown = [
					...cap.breakdown,
					{
						label: `Property Ownership (Rent from ${nonOwners.map((p) => p.name).join(', ')})`,
						amount: rentFromOthers,
						type: 'imputed' as const,
						category: 'property'
					}
				];
				return {
					...cap,
					monthlyCapacity: cap.monthlyCapacity + rentFromOthers,
					breakdown: newBreakdown
				};
			}
			// Non-owner: Deduct their share of rent
			else if (nonOwners.some((p) => p.id === cap.personId)) {
				const newBreakdown = [
					...cap.breakdown,
					{
						label: `Rent Paid to ${ownerName}`,
						amount: -rentPerPerson,
						type: 'deduction' as const,
						category: 'property-rent'
					}
				];
				return {
					...cap,
					monthlyCapacity: Math.max(0, cap.monthlyCapacity - rentPerPerson),
					breakdown: newBreakdown
				};
			}
			
			return cap;
		});
	}

	/**
	 * Calculates final contributions and percentages based on total capacity.
	 */
	private static calculateFinalContributions(
		state: CalculatorState,
		capacities: ReturnType<typeof CalculationService.calculateBaseCapacity>[],
		sharedExpensesMonthly: number
	): CalculationResult[] {
		const totalCapacity = capacities.reduce((sum, c) => sum + c.monthlyCapacity, 0);

		if (totalCapacity <= 0) {
			return capacities.map((cap) => ({
				personId: cap.personId,
				monthlyCapacity: 0,
				monthlyContribution: 0,
				percentage: 0,
				monthlyDisposable: cap.monthlyNetIncome,
				monthlyNetIncome: cap.monthlyNetIncome,
				breakdown: cap.breakdown
			}));
		}

		return capacities.map((cap) => {
			const percentage = (cap.monthlyCapacity / totalCapacity) * 100;
			const contribution = (percentage / 100) * sharedExpensesMonthly;

			return {
				personId: cap.personId,
				monthlyCapacity: cap.monthlyCapacity,
				monthlyContribution: Math.max(0, contribution),
				percentage: isFinite(percentage) ? percentage : 0,
				monthlyDisposable: Math.max(0, cap.monthlyNetIncome - contribution),
				monthlyNetIncome: cap.monthlyNetIncome,
				breakdown: cap.breakdown
			};
		});
	}

	// --- Helper Methods ---

	private static getYearsBetween(startDate: string, endDate: Date = new Date()): number {
		const start = new Date(startDate);
		const diffTime = Math.abs(endDate.getTime() - start.getTime());
		const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
		return diffYears;
	}

	private static calculateCompoundedValue(
		initialAmount: number,
		receivedDate: string,
		annualRate: number
	): number {
		if (!initialAmount || initialAmount <= 0) return 0;
		if (!receivedDate) return initialAmount;

		const years = this.getYearsBetween(receivedDate);
		const compoundedValue = initialAmount * Math.pow(1 + annualRate / 100, years);
		return compoundedValue;
	}

	private static calculateImputedIncome(inheritance: Inheritance): number {
		if (!inheritance.amount || inheritance.amount <= 0) return 0;

		const compoundedValue = this.calculateCompoundedValue(
			inheritance.amount,
			inheritance.receivedDate,
			inheritance.returnRate
		);

		const discount = Math.max(0, Math.min(100, inheritance.discount)) / 100;
		const discountedValue = compoundedValue * (1 - discount);
		const monthlyIncome = (discountedValue * inheritance.returnRate) / (12 * 100);

		return Math.max(0, monthlyIncome);
	}
}
