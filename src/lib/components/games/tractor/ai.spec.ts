import { describe, it, expect } from 'vitest';
import { makeAIDeclaration, makeAIBuryCards } from './ai.js';
import type { Card, StandardCard, Joker } from '$lib/shared/cards.js';

function sc(suit: StandardCard['suit'], rank: StandardCard['rank']): StandardCard {
	return { suit, rank, id: `${suit}-${rank}` };
}

function joker(type: 'small' | 'big'): Joker {
	return { joker: type, id: `joker-${type}` };
}

// ─── makeAIDeclaration ────────────────────────────────────────────────────────

describe('makeAIDeclaration', () => {
	it('returns the suit with the most cards', () => {
		const hand: Card[] = [
			sc('spades', '3'), sc('spades', '5'), sc('spades', '7'),
			sc('hearts', '4'), sc('hearts', '6'),
			sc('diamonds', 'A')
		];
		expect(makeAIDeclaration(hand)).toBe('spades');
	});

	it('breaks ties alphabetically for determinism', () => {
		// clubs and spades both have 2 cards — clubs < spades alphabetically
		const hand: Card[] = [
			sc('clubs', '3'), sc('clubs', '5'),
			sc('spades', '4'), sc('spades', '6')
		];
		expect(makeAIDeclaration(hand)).toBe('clubs');
	});

	it('ignores jokers when counting suits', () => {
		// Many jokers but most standard cards are hearts
		const hand: Card[] = [
			joker('small'), joker('big'),
			sc('hearts', '3'), sc('hearts', '5'), sc('hearts', '7'),
			sc('clubs', 'A')
		];
		expect(makeAIDeclaration(hand)).toBe('hearts');
	});

	it('handles a hand with no jokers', () => {
		const hand: Card[] = [
			sc('diamonds', '3'), sc('diamonds', '4'), sc('diamonds', '5'),
			sc('clubs', '9'), sc('clubs', '10')
		];
		expect(makeAIDeclaration(hand)).toBe('diamonds');
	});
});

// ─── makeAIBuryCards ─────────────────────────────────────────────────────────

describe('makeAIBuryCards', () => {
	function makeHand(): Card[] {
		return [
			sc('diamonds', '3'),  // low, off-suit → should be buried
			sc('clubs', '4'),     // low, off-suit → should be buried
			sc('hearts', '6'),
			sc('diamonds', '7'),
			sc('clubs', '8'),
			sc('hearts', '9'),
			sc('diamonds', 'J'),
			sc('clubs', 'Q'),
			sc('spades', 'A'),    // high value — keep
			sc('spades', '5'),    // point card (5 pts) — keep
			sc('hearts', '10'),   // point card (10 pts) — keep
			sc('hearts', 'K'),    // point card (10 pts) — keep
			sc('spades', '3'),    // trump suit card (trumpSuit = spades) — keep
			sc('spades', '2'),    // trump rank (trumpRank = '2') — keep
			joker('small'),       // joker — always keep
			joker('big')          // joker — always keep
		];
	}

	it('returns exactly 8 card ids', () => {
		const result = makeAIBuryCards(makeHand(), 'spades', '2');
		expect(result).toHaveLength(8);
	});

	it('never includes jokers', () => {
		const hand = makeHand();
		const result = makeAIBuryCards(hand, 'spades', '2');
		const buried = hand.filter((c) => result.includes(c.id));
		expect(buried.some((c) => 'joker' in c)).toBe(false);
	});

	it('never includes trump suit cards when trumpSuit is set', () => {
		const hand = makeHand();
		const result = makeAIBuryCards(hand, 'spades', '2');
		const buried = hand.filter((c) => result.includes(c.id));
		expect(buried.some((c) => !('joker' in c) && (c as StandardCard).suit === 'spades')).toBe(false);
	});

	it('never includes the trump rank card', () => {
		const hand = makeHand();
		const result = makeAIBuryCards(hand, 'spades', '2');
		const buried = hand.filter((c) => result.includes(c.id));
		expect(buried.some((c) => !('joker' in c) && (c as StandardCard).rank === '2')).toBe(false);
	});

	it('prefers burying low-rank off-suit cards over point cards', () => {
		const hand = makeHand();
		const result = makeAIBuryCards(hand, 'spades', '2');
		const buried = hand.filter((c) => result.includes(c.id)) as StandardCard[];
		// Low-rank off-suit cards (3♦, 4♣) should be in the burial list
		expect(buried.some((c) => c.rank === '3' && c.suit === 'diamonds')).toBe(true);
		expect(buried.some((c) => c.rank === '4' && c.suit === 'clubs')).toBe(true);
		// Point cards (5♠ is trump, 10♥, K♥) should NOT be buried
		expect(buried.some((c) => c.rank === '10')).toBe(false);
		expect(buried.some((c) => c.rank === 'K')).toBe(false);
	});

	it('works with no trump suit (trumpSuit = null)', () => {
		const hand: Card[] = Array.from({ length: 10 }, (_, i) =>
			sc(['diamonds', 'clubs', 'hearts', 'spades'][i % 4] as StandardCard['suit'],
			   ['3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q'][i] as StandardCard['rank'])
		);
		const result = makeAIBuryCards(hand, null, '2');
		expect(result).toHaveLength(8);
	});
});
