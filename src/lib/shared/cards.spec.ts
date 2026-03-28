import { describe, it, expect } from 'vitest';
import { createStandardDeck, createTractorDeck, SUITS, RANKS, isJoker } from './cards.js';

describe('createStandardDeck', () => {
	it('has 52 cards', () => {
		expect(createStandardDeck()).toHaveLength(52);
	});

	it('contains every suit/rank combination', () => {
		const deck = createStandardDeck();
		for (const suit of SUITS) {
			for (const rank of RANKS) {
				expect(deck.some((c) => c.suit === suit && c.rank === rank)).toBe(true);
			}
		}
	});

	it('has unique IDs', () => {
		const deck = createStandardDeck();
		const ids = deck.map((c) => c.id);
		expect(new Set(ids).size).toBe(52);
	});
});

describe('createTractorDeck', () => {
	it('has 108 cards', () => {
		expect(createTractorDeck()).toHaveLength(108);
	});

	it('has exactly 4 jokers', () => {
		const deck = createTractorDeck();
		expect(deck.filter(isJoker)).toHaveLength(4);
	});

	it('has 2 small jokers and 2 big jokers', () => {
		const deck = createTractorDeck();
		const jokers = deck.filter(isJoker);
		expect(jokers.filter((j) => j.joker === 'small')).toHaveLength(2);
		expect(jokers.filter((j) => j.joker === 'big')).toHaveLength(2);
	});

	it('has unique IDs across both decks', () => {
		const deck = createTractorDeck();
		const ids = deck.map((c) => c.id);
		expect(new Set(ids).size).toBe(108);
	});

	it('has 104 standard cards (52 × 2)', () => {
		const deck = createTractorDeck();
		expect(deck.filter((c) => !isJoker(c))).toHaveLength(104);
	});
});
