import type { CalculatorState, Person, Inheritance } from './stores/calculatorStore';

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

// Calculate years between two dates
function getYearsBetween(startDate: string, endDate: Date = new Date()): number {
	const start = new Date(startDate);
	const diffTime = Math.abs(endDate.getTime() - start.getTime());
	const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
	return diffYears;
}

// Calculate compounded value from inheritance date
function calculateCompoundedValue(
	initialAmount: number,
	receivedDate: string,
	annualRate: number = 5.5
): number {
	if (!initialAmount || initialAmount <= 0) return 0;
	if (!receivedDate) return initialAmount;

	const years = getYearsBetween(receivedDate);
	const compoundedValue = initialAmount * Math.pow(1 + annualRate / 100, years);
	return compoundedValue;
}

// Calculate monthly income from inheritance using its specific rate and date
function calculateImputedIncome(inheritance: Inheritance): number {
	if (!inheritance.amount || inheritance.amount <= 0) return 0;

	// First, compound the original amount from the received date
	const compoundedValue = calculateCompoundedValue(
		inheritance.amount,
		inheritance.receivedDate,
		inheritance.returnRate
	);

	// Apply discount to the compounded value
	const discount = Math.max(0, Math.min(100, inheritance.discount)) / 100;
	const discountedValue = compoundedValue * (1 - discount);

	// Calculate monthly income from the discounted compounded value
	const monthlyIncome = (discountedValue * inheritance.returnRate) / (12 * 100);

	return Math.max(0, monthlyIncome);
}

// Calculate total capacity for a person
function calculatePersonCapacity(
	person: Person,
	isYearly: boolean,
	conversionFactor: number
): { capacity: number; breakdown: CalculationResult['breakdown'] } {
	const netIncome = Math.max(0, person.netIncome) * conversionFactor;
	let capacity = netIncome;

	const breakdown: CalculationResult['breakdown'] = [
		{
			label: 'Net Income',
			amount: netIncome,
			type: 'income',
			category: 'income'
		}
	];

	// Employer retirement matching (free money - always add to capacity)
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

	// Direct inheritances (imputed income with compounding)
	person.inheritances.forEach((inheritance, index) => {
		const monthlyIncome = calculateImputedIncome(inheritance);
		if (monthlyIncome > 0) {
			capacity += monthlyIncome;
			const percentage = 100 - inheritance.discount;
			const years = getYearsBetween(inheritance.receivedDate);
			breakdown.push({
				label: `${inheritance.name || `Inheritance ${index + 1}`} (${percentage}% valued, ${years.toFixed(1)}y @ ${inheritance.returnRate}%)`,
				amount: monthlyIncome,
				type: 'imputed',
				category: 'inheritance'
			});
		}
	});

	// Passive advantages (imputed income with heavy discount)
	if (person.passiveAdvantages > 0) {
		const discount = Math.max(0, Math.min(100, person.passiveAdvantagesDiscount)) / 100;
		const rate = person.passiveAdvantagesReturnRate;
		const discountedValue = person.passiveAdvantages * (1 - discount);
		const monthlyIncome = (discountedValue * rate) / (12 * 100);

		capacity += monthlyIncome;
		breakdown.push({
			label: `Family Advantages (${Math.round((1 - discount) * 100)}% valued @ ${rate}%)`,
			amount: monthlyIncome,
			type: 'imputed',
			category: 'advantages'
		});
	}

	// Expected future inheritance (imputed income with uncertainty discount)
	if (person.expectedFutureInheritance > 0) {
		const discount = Math.max(0, Math.min(100, person.expectedFutureInheritanceDiscount)) / 100;
		const rate = 5.5; // Use default rate for future inheritance
		const discountedValue = person.expectedFutureInheritance * (1 - discount);
		const monthlyIncome = (discountedValue * rate) / (12 * 100);

		capacity += monthlyIncome;
		breakdown.push({
			label: `Expected Inheritance (${Math.round((1 - discount) * 100)}% valued @ ${rate}%)`,
			amount: monthlyIncome,
			type: 'imputed',
			category: 'future-inheritance'
		});
	}

	// Student loans (deduction)
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

	// Family support (deduction)
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

	// Variable income (income with uncertainty discount)
	if (person.variableIncome > 0) {
		const discount = Math.max(0, Math.min(100, person.variableIncomeDiscount)) / 100;
		const monthlyValue = (person.variableIncome * (1 - discount)) / 12;
		capacity += monthlyValue;
		breakdown.push({
			label: `Variable Income (${Math.round((1 - discount) * 100)}% valued)`,
			amount: monthlyValue,
			type: 'income',
			category: 'variable'
		});
	}

	return {
		capacity: Math.max(0, capacity),
		breakdown
	};
}

export function calculate(state: CalculatorState): CalculationResult[] {
	const isYearly = state.timeframe === 'yearly';
	const conversionFactor = isYearly ? 1 / 12 : 1;
	const sharedExpensesMonthly = Math.max(0, state.sharedExpenses * conversionFactor);

	// Handle edge cases
	if (!state.people || state.people.length === 0) return [];
	if (sharedExpensesMonthly <= 0) {
		return state.people.map((person) => ({
			personId: person.id,
			monthlyCapacity: 0,
			monthlyContribution: 0,
			percentage: 0,
			monthlyDisposable: 0,
			monthlyNetIncome: 0,
			breakdown: []
		}));
	}

	// Calculate capacities for all people
	const capacities = state.people.map((person) => {
		const { capacity, breakdown } = calculatePersonCapacity(person, isYearly, conversionFactor);

		return {
			personId: person.id,
			monthlyCapacity: capacity,
			monthlyNetIncome: Math.max(0, person.netIncome * conversionFactor),
			breakdown
		};
	});

	// FIXED: Property ownership adjustment
	// Owner receives full market rent as imputed income
	// Non-owner(s) pay half of market rent (split equally if multiple non-owners)
	if (state.propertyArrangement === 'owned' && state.propertyOwnerId && state.marketRent > 0) {
		const monthlyRentValue = Math.max(0, state.marketRent) * conversionFactor;
		const ownerIndex = capacities.findIndex((c) => c.personId === state.propertyOwnerId);

		if (ownerIndex !== -1) {
			// Owner gets full market rent as imputed income
			capacities[ownerIndex].monthlyCapacity += monthlyRentValue;
			capacities[ownerIndex].breakdown.push({
				label: 'Property Ownership (market rent value)',
				amount: monthlyRentValue,
				type: 'imputed',
				category: 'property'
			});

			// Non-owner(s) pay half of market rent (deducted from their capacity)
			const nonOwners = capacities.filter((c) => c.personId !== state.propertyOwnerId);
			const rentPerNonOwner = (monthlyRentValue * 0.5) / nonOwners.length;

			nonOwners.forEach((nonOwner) => {
				const nonOwnerIndex = capacities.findIndex((c) => c.personId === nonOwner.personId);
				if (nonOwnerIndex !== -1) {
					capacities[nonOwnerIndex].monthlyCapacity -= rentPerNonOwner;
					capacities[nonOwnerIndex].breakdown.push({
						label: `Rent to Owner (${(50 / nonOwners.length).toFixed(0)}% of market rent)`,
						amount: -rentPerNonOwner,
						type: 'deduction',
						category: 'property-rent'
					});
				}
			});
		}
	}

	// Calculate proportional contributions
	const totalCapacity = capacities.reduce((sum, c) => sum + c.monthlyCapacity, 0);
	const safeTotalCapacity = totalCapacity > 0 ? totalCapacity : 1;

	return capacities.map((cap) => {
		const percentage = (cap.monthlyCapacity / safeTotalCapacity) * 100;
		const contribution = (cap.monthlyCapacity / safeTotalCapacity) * sharedExpensesMonthly;

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

export function formatCurrency(
	amount: number,
	currency: string,
	timeframe: 'monthly' | 'yearly'
): string {
	const displayAmount = timeframe === 'yearly' ? amount * 12 : amount;
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: currency,
		maximumFractionDigits: 0,
		minimumFractionDigits: 0
	}).format(isFinite(displayAmount) ? displayAmount : 0);
}

export function getTimeframeLabel(timeframe: 'monthly' | 'yearly'): string {
	return timeframe === 'yearly' ? '/yr' : '/mo';
}

export function getCurrencySymbol(currency: string): string {
	const symbols: Record<string, string> = {
		USD: '$',
		EUR: '€',
		GBP: '£',
		CHF: 'Fr.',
		CAD: 'C$',
		AUD: 'A$',
		JPY: '¥'
	};
	return symbols[currency] || currency;
}
