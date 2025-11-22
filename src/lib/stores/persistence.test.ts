import { describe, it, expect, beforeEach, vi } from 'vitest';
import { get } from 'svelte/store';
import { calculatorStore } from './calculatorStore';
import { uiStore } from './uiStore';

describe('Persistence', () => {
    beforeEach(() => {
        calculatorStore.resetState();
        uiStore.resetUI();
        vi.useFakeTimers();
    });

    it('should export combined state with metadata', () => {
        const json = calculatorStore.exportState();
        const data = JSON.parse(json);

        expect(data).toHaveProperty('meta');
        expect(data.meta).toHaveProperty('version', 1);
        expect(data.meta).toHaveProperty('date');
        expect(data).toHaveProperty('calculator');
        expect(data).toHaveProperty('ui');
    });

    it('should import combined state and restore both stores', () => {
        // Setup initial state
        calculatorStore.updateSharedExpenses(5000);
        uiStore.toggleSection('debt'); // Disable debt section (enabled by default)

        const json = calculatorStore.exportState();

        // Reset to defaults
        calculatorStore.resetState();
        uiStore.resetUI();

        // Verify reset worked
        expect(get(calculatorStore).sharedExpenses).toBe(3000);
        expect(get(uiStore).enabledSections).toContain('debt');

        // Import
        const success = calculatorStore.importState(json);
        expect(success).toBe(true);

        // Verify restoration
        expect(get(calculatorStore).sharedExpenses).toBe(5000);
        expect(get(uiStore).enabledSections).not.toContain('debt');
    });

    it('should handle legacy import format', () => {
        const legacyState = {
            currency: 'EUR',
            sharedExpenses: 4000,
            timeframe: 'monthly',
            people: [],
            propertyArrangement: 'none',
            propertyOwnerId: null,
            marketRent: 0
        };

        const success = calculatorStore.importState(JSON.stringify(legacyState));
        expect(success).toBe(true);
        expect(get(calculatorStore).currency).toBe('EUR');
        expect(get(calculatorStore).sharedExpenses).toBe(4000);
    });
});
