export interface Currency {
	code: string;
	name: string;
	flag: string;
	symbol: string;
}

export const CURRENCIES: Currency[] = [
	{ code: 'USD', symbol: '$', name: 'United States Dollar', flag: '🇺🇸' },
	{ code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
	{ code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧' },
	{ code: 'CHF', symbol: 'Fr.', name: 'Swiss Franc', flag: '🇨🇭' },
	{ code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', flag: '🇨🇦' },
	{ code: 'AUD', symbol: 'A$', name: 'Australian Dollar', flag: '🇦🇺' },
	{ code: 'JPY', symbol: '¥', name: 'Japanese Yen', flag: '🇯🇵' }
];
