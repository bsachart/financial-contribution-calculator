export function formatCurrency(
	amount: number,
	currency: string,
	timeframe: 'monthly' | 'yearly'
): string {
	// Convert to monthly base for calculation, then format for display
	const displayAmount = timeframe === 'yearly' ? amount * 12 : amount;
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: currency,
		maximumFractionDigits: 0, // Cleaner display
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
