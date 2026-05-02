import { describe, it, expect } from 'vitest';
import { makeAIMove } from './ai.js';
import type { StandardCard } from '$lib/shared/cards.js';
import type { LastPlay } from '$lib/games/big2/types.js';

function card(suit: StandardCard['suit'], rank: StandardCard['rank']): StandardCard {
	return { suit, rank, id: `${suit}-${rank}` };
}

function lastPlay(cards: StandardCard[]): LastPlay {
	const type =
		cards.length === 1
			? 'single'
			: cards.length === 2
				? 'pair'
				: cards.length === 3
					? 'triple'
					: 'straight';
	return { playerID: '1', cards, type };
}

// ─── Leading ─────────────────────────────────────────────────────────────────

describe('makeAIMove – leading', () => {
	it('leads the lowest single when the lowest rank is isolated', () => {
		const hand = [card('diamonds', '3'), card('spades', '5'), card('hearts', '9')];
		const result = makeAIMove('0', hand, null);
		expect(result).toEqual(['diamonds-3']);
	});

	it('leads a pair when the lowest rank has 2 cards', () => {
		const hand = [
			card('diamonds', '3'),
			card('clubs', '3'),
			card('spades', '7'),
			card('hearts', 'A')
		];
		const result = makeAIMove('0', hand, null);
		expect(result).toHaveLength(2);
		// Both ids should be 3s
		const played = hand.filter((c) => (result as string[]).includes(c.id));
		expect(played.every((c) => c.rank === '3')).toBe(true);
	});

	it('leads a triple when the lowest rank has 3 cards', () => {
		const hand = [
			card('diamonds', '3'),
			card('clubs', '3'),
			card('hearts', '3'),
			card('spades', 'K')
		];
		const result = makeAIMove('0', hand, null);
		expect(result).toHaveLength(3);
		const played = hand.filter((c) => (result as string[]).includes(c.id));
		expect(played.every((c) => c.rank === '3')).toBe(true);
	});

	it('leads the highest card when ≤ 2 cards remain (end-game)', () => {
		const hand = [card('diamonds', '3'), card('spades', 'A')];
		const result = makeAIMove('0', hand, null);
		// Highest is A♠ (spades A = rank 11 * 4 + 3 = 47)
		expect(result).toEqual(['spades-A']);
	});

	it('also leads highest when exactly 1 card remains', () => {
		const hand = [card('clubs', '7')];
		const result = makeAIMove('0', hand, null);
		expect(result).toEqual(['clubs-7']);
	});
});

// ─── Following singles ────────────────────────────────────────────────────────

describe('makeAIMove – following singles', () => {
	it('returns the weakest single that beats the last play', () => {
		// Last play: 5♦ (value = 2*4+0 = 8)
		const last = lastPlay([card('diamonds', '5')]);
		const hand = [
			card('diamonds', '3'), // too low
			card('spades', '5'),   // same rank, higher suit — beats it
			card('hearts', 'A')    // also beats, but higher
		];
		const result = makeAIMove('0', hand, last);
		// Weakest beating card is 5♠
		expect(result).toEqual(['spades-5']);
	});

	it("returns 'pass' when no single can beat the last play", () => {
		const last = lastPlay([card('spades', '2')]); // highest possible card
		const hand = [card('diamonds', '3'), card('clubs', '5'), card('hearts', 'A')];
		const result = makeAIMove('0', hand, last);
		expect(result).toBe('pass');
	});
});

// ─── Following pairs ─────────────────────────────────────────────────────────

describe('makeAIMove – following pairs', () => {
	it('returns the weakest pair that beats the last play', () => {
		// Last play: pair of 4s (highest 4♠, value = 1*4+3 = 7)
		const last: LastPlay = {
			playerID: '1',
			cards: [card('hearts', '4'), card('spades', '4')],
			type: 'pair'
		};
		const hand = [
			card('diamonds', '4'), card('clubs', '4'), // 4♣ beats 4♥ but pair of 4s can't beat pair of 4s when highest is 4♠
			card('diamonds', '5'), card('clubs', '5'), // pair of 5s — beats
			card('hearts', 'K'), card('spades', 'K')  // pair of Ks — also beats
		];
		const result = makeAIMove('0', hand, last);
		expect(result).toHaveLength(2);
		const played = hand.filter((c) => (result as string[]).includes(c.id));
		expect(played.every((c) => c.rank === '5')).toBe(true); // weakest winning pair
	});

	it("returns 'pass' when no pair can beat the last play", () => {
		const last: LastPlay = {
			playerID: '1',
			cards: [card('hearts', '2'), card('spades', '2')],
			type: 'pair'
		};
		const hand = [card('diamonds', 'A'), card('spades', 'A'), card('clubs', '3')];
		const result = makeAIMove('0', hand, last);
		expect(result).toBe('pass');
	});
});

// ─── Following 5-card hands ───────────────────────────────────────────────────

describe('makeAIMove – following 5-card hands', () => {
	it('returns a valid 5-card play instead of passing when AI has a beating combo', () => {
		// Last play: straight 3-4-5-6-7 (highest 7♠, value = 4*4+3 = 19)
		const last: LastPlay = {
			playerID: '1',
			cards: [
				card('diamonds', '3'),
				card('clubs', '4'),
				card('hearts', '5'),
				card('diamonds', '6'),
				card('spades', '7')
			],
			type: 'straight'
		};
		// AI has a flush (beats any straight)
		const hand = [
			card('spades', '3'),
			card('spades', '6'),
			card('spades', '8'),
			card('spades', '10'),
			card('spades', 'Q'),
			card('hearts', 'K') // extra card
		];
		const result = makeAIMove('0', hand, last);
		expect(result).not.toBe('pass');
		expect((result as string[]).length).toBe(5);
	});

	it("returns 'pass' when AI has no 5-card combo that beats the last play", () => {
		// Last play: straight flush (highest type)
		const last: LastPlay = {
			playerID: '1',
			cards: [
				card('spades', '9'),
				card('spades', '10'),
				card('spades', 'J'),
				card('spades', 'Q'),
				card('spades', 'K')
			],
			type: 'straightFlush'
		};
		// AI has only a straight (lower than straight flush)
		const hand = [
			card('diamonds', '3'),
			card('clubs', '4'),
			card('hearts', '5'),
			card('spades', '6'),
			card('diamonds', '7')
		];
		const result = makeAIMove('0', hand, last);
		expect(result).toBe('pass');
	});

	it('prefers a weaker type over a stronger one when both beat', () => {
		// Last play: a straight
		const last: LastPlay = {
			playerID: '1',
			cards: [
				card('diamonds', '3'),
				card('clubs', '4'),
				card('hearts', '5'),
				card('diamonds', '6'),
				card('spades', '7')
			],
			type: 'straight'
		};
		// AI hand has both a flush and a full house — should play the flush (weaker)
		const hand = [
			// Flush: 5 spades (non-consecutive)
			card('spades', '3'),
			card('spades', '5'),
			card('spades', '7'),
			card('spades', '9'),
			card('spades', 'J'),
			// Full house: three Ks + two Qs
			card('clubs', 'K'),
			card('hearts', 'K'),
			card('diamonds', 'K'),
			card('clubs', 'Q'),
			card('hearts', 'Q')
		];
		const result = makeAIMove('0', hand, last);
		expect(result).not.toBe('pass');
		const played = hand.filter((c) => (result as string[]).includes(c.id));
		// Should be the flush (spades cards), not the full house
		expect(played.every((c) => c.suit === 'spades')).toBe(true);
	});
});
