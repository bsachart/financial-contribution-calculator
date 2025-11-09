export interface Currency {
	code: string;
	name: string;
	flag: string;
}

export const CURRENCIES: Currency[] = [
	{ code: 'USD', name: 'United States Dollar', flag: '🇺🇸' },
	{ code: 'EUR', name: 'Euro', flag: '🇪🇺' },
	{ code: 'GBP', name: 'British Pound', flag: '🇬🇧' },
	{ code: 'CHF', name: 'Swiss Franc', flag: '🇨🇭' },
	{ code: 'CAD', name: 'Canadian Dollar', flag: '🇨🇦' },
	{ code: 'AUD', name: 'Australian Dollar', flag: '🇦🇺' },
	{ code: 'JPY', name: 'Japanese Yen', flag: '🇯🇵' }
];
