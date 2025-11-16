export interface FieldConfig {
	label: string;
	type: 'currency' | 'slider' | 'number' | 'date' | 'text';
	placeholder?: string;
	help?: string;
	min?: number;
	max?: number;
	step?: number;
	section: string;
	timeframeSensitive?: boolean;
}

export const DEFAULT_UNCERTAINTY_DISCOUNT = 20;

export const FIELDS: Record<string, FieldConfig | ((timeframe: string) => FieldConfig)> = {
	netIncome: (timeframe) => ({
		label: `Net ${timeframe === 'yearly' ? 'Yearly' : 'Monthly'} Income (After Tax)`,
		type: 'currency',
		placeholder: '0',
		help: "Your actual take-home pay. This is what's truly available to spend.",
		step: 100,
		section: 'income',
		timeframeSensitive: true
	}),

	// Inheritance fields
	inheritanceName: {
		label: 'Inheritance Name',
		type: 'text',
		placeholder: 'e.g., Grandparent Estate',
		help: 'Give this inheritance a meaningful name',
		section: 'inheritance'
	},

	inheritanceAmount: {
		label: 'Amount',
		type: 'currency',
		placeholder: '0',
		help: 'Total value of inheritance received',
		step: 1000,
		section: 'inheritance'
	},

	inheritanceDiscount: {
		label: 'Discount %',
		type: 'number',
		min: 0,
		max: 100,
		step: 5,
		help: 'Liquidity discount (0% for cash, higher for illiquid assets)',
		section: 'inheritance'
	},

	inheritanceReturnRate: {
		label: 'Expected Annual Return %',
		type: 'number',
		min: 0,
		max: 20,
		step: 0.5,
		help: 'What this inheritance could generate annually (default 5.5%)',
		section: 'inheritance'
	},

	passiveAdvantages: {
		label: 'Lifetime Passive Advantages Value',
		type: 'currency',
		placeholder: 'Estimated total value',
		help: 'Education without debt, healthcare, tutoring, career support.',
		step: 1000,
		section: 'inheritance'
	},

	passiveAdvantagesDiscount: {
		label: 'Discount %',
		type: 'number',
		min: 0,
		max: 100,
		step: 5,
		help: 'These are non-liquid benefits (typically 60-80% discount)',
		section: 'inheritance'
	},

	passiveAdvantagesReturnRate: {
		label: 'Expected Annual Return %',
		type: 'number',
		min: 0,
		max: 20,
		step: 0.5,
		help: 'Annual return rate for these advantages (default 5.5%)',
		section: 'inheritance'
	},

	expectedFutureInheritance: {
		label: 'Expected Future Inheritance',
		type: 'currency',
		placeholder: 'Expected amount',
		help: 'Likely inheritance based on family wealth.',
		step: 1000,
		section: 'inheritance'
	},

	expectedFutureInheritanceDiscount: {
		label: 'Uncertainty Discount %',
		type: 'number',
		min: 0,
		max: 100,
		step: 5,
		help: 'Uncertainty discount (typically 30-70%)',
		section: 'inheritance'
	},

	// Debt fields
	studentLoans: (timeframe) => ({
		label: `Student Loan Payments (${timeframe === 'yearly' ? 'Yearly' : 'Monthly'})`,
		type: 'currency',
		placeholder: '0',
		help: `${timeframe === 'yearly' ? 'Annual' : 'Monthly'} payments that reduce your available income.`,
		step: 50,
		section: 'debt',
		timeframeSensitive: true
	}),

	familySupport: (timeframe) => ({
		label: `Family Support Obligations (${timeframe === 'yearly' ? 'Yearly' : 'Monthly'})`,
		type: 'currency',
		placeholder: '0',
		help: 'Support for parents, siblings, or relatives. This is deducted from capacity.',
		step: 50,
		section: 'debt',
		timeframeSensitive: true
	}),

	// Variable income
	variableIncome: {
		label: 'Variable Income (Bonus/Commission)',
		type: 'currency',
		placeholder: '0',
		help: 'Expected annual amount from bonuses, commissions, or freelance work.',
		step: 1000,
		section: 'variable'
	},

	variableIncomeDiscount: {
		label: 'Uncertainty Discount %',
		type: 'number',
		min: 0,
		max: 80,
		step: 5,
		help: 'How uncertain is this income? Higher discount = less reliable.',
		section: 'variable'
	},

	// Retirement matching (instead of contributions)
	retirementMatching: (timeframe) => ({
		label: `Employer Retirement Matching (${timeframe === 'yearly' ? 'Yearly' : 'Monthly'})`,
		type: 'currency',
		placeholder: '0',
		help: 'Free money from employer matching. This increases your capacity.',
		step: 50,
		section: 'retirement',
		timeframeSensitive: true
	}),

	// Housing
	marketRent: (timeframe) => ({
		label: `Fair Market Rent (${timeframe === 'yearly' ? 'Yearly' : 'Monthly'})`,
		type: 'currency',
		placeholder: '0',
		help: 'What would this property rent for on the open market?',
		step: 100,
		section: 'housing',
		timeframeSensitive: true
	})
} as const;

export type SectionKey = 'income' | 'inheritance' | 'debt' | 'variable' | 'retirement' | 'housing';
export type Timeframe = 'monthly' | 'yearly';

// Change SECTIONS to use the new type
export const SECTIONS: ReadonlyArray<{
	key: SectionKey;
	title: string;
	icon: string;
	shortDesc: string;
	description: string;
	whyMatter: string;
}> = [
	{
		key: 'income',
		title: 'Net Income',
		icon: '💰',
		shortDesc: 'After-tax earnings',
		description: 'The foundation of all calculations. Use after-tax income for accuracy.',
		whyMatter:
			"This is what's actually available to spend. Using gross income would penalize those in higher tax brackets."
	},
	{
		key: 'inheritance',
		title: 'Inheritance & Advantages',
		icon: '🏛️',
		shortDesc: 'Past inheritances & advantages',
		description: 'Direct cash inheritances and lifetime advantages like debt-free education.',
		whyMatter:
			'Someone who inherited $500k has vastly more capacity than their salary suggests. Ignoring this means the higher earner subsidizes someone objectively wealthier.'
	},
	{
		key: 'debt',
		title: 'Obligations & Debt',
		icon: '💳',
		shortDesc: 'Student loans & support',
		description: 'Student loans and family support reduce available income.',
		whyMatter:
			'Two people earning $100k have different capacity if one has $1,500/month in student loans.'
	},
	{
		key: 'variable',
		title: 'Variable Income',
		icon: '📈',
		shortDesc: 'Bonuses & commissions',
		description: 'Income that is not guaranteed, discounted for uncertainty.',
		whyMatter:
			'$100k base + $50k typical bonus has more capacity than $150k guaranteed, but less than $150k guaranteed.'
	},
	{
		key: 'retirement',
		title: 'Retirement Savings',
		icon: '💼',
		shortDesc: 'Employer matching',
		description: 'Free money from employer retirement plan matching.',
		whyMatter:
			'Employer matching is part of total compensation and increases your financial capacity.'
	},
	{
		key: 'housing',
		title: 'Property Ownership',
		icon: '🏠',
		shortDesc: 'Home ownership',
		description: 'If one partner owns the home, they should pay 50% of market rent.',
		whyMatter: "The owner builds equity; the non-owner shouldn't subsidize this wealth-building."
	}
] as const;
