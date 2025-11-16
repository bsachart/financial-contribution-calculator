export type Timeframe = 'monthly' | 'yearly';

export class TimeframeService {
	static readonly MONTHS_PER_YEAR = 12;

	/**
	 * Convert value to monthly base (internal storage format)
	 */
	static toMonthly(value: number, timeframe: Timeframe): number {
		return timeframe === 'yearly' ? value / this.MONTHS_PER_YEAR : value;
	}

	/**
	 * Convert value to display format (for user interface)
	 */
	static toDisplay(value: number, timeframe: Timeframe): number {
		return timeframe === 'yearly' ? value * this.MONTHS_PER_YEAR : value;
	}

	/**
	 * Get label suffix for display
	 */
	static getLabel(timeframe: Timeframe): string {
		return timeframe === 'yearly' ? '/yr' : '/mo';
	}
}
