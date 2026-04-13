import type { Card, Suit, Rank } from '$lib/shared/cards.js';
import { isJoker } from '$lib/shared/cards.js';
import type { TractorState } from '$lib/games/tractor/types.js';

// Rank order for burial scoring (higher = more useful to keep)
const RANK_KEEP_VALUE: Record<Rank, number> = {
	'3': 0, '4': 10, '5': 20, '6': 30, '7': 40,
	'8': 50, '9': 60, '10': 70, J: 75, Q: 80,
	K: 85, A: 90, '2': 95
};

/**
 * Score a card for burial: higher score = more important to keep.
 * Low off-suit non-point cards score lowest and should be buried first.
 */
function burialScore(card: Card, trumpSuit: Suit | null, trumpRank: Rank): number {
	if (isJoker(card)) return 1000; // never bury jokers
	if (card.rank === trumpRank) return 900; // trump rank cards are powerful
	if (trumpSuit && card.suit === trumpSuit) return 700; // trump suit cards
	// Point cards (5=5pts, 10=10pts, K=10pts) are valuable at game end
	if (card.rank === '5' || card.rank === '10' || card.rank === 'K') return 600;
	// Everything else: lower rank = more burialworthy
	return RANK_KEEP_VALUE[card.rank] ?? 50;
}

/**
 * Pick which suit to declare as trump: the non-joker suit with the most cards.
 * Ties are broken alphabetically for determinism.
 */
export function makeAIDeclaration(hand: Card[]): Suit {
	const counts: Record<Suit, number> = { clubs: 0, diamonds: 0, hearts: 0, spades: 0 };
	for (const card of hand) {
		if (!isJoker(card)) counts[card.suit]++;
	}
	return (Object.entries(counts) as [Suit, number][])
		.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0][0];
}

/**
 * Pick 8 cards to bury: prefer burying low off-suit non-point cards.
 * Never buries jokers, trump rank cards, or trump suit cards.
 */
export function makeAIBuryCards(hand: Card[], trumpSuit: Suit | null, trumpRank: Rank): string[] {
	return [...hand]
		.sort((a, b) => burialScore(a, trumpSuit, trumpRank) - burialScore(b, trumpSuit, trumpRank))
		.slice(0, 8)
		.map((c) => c.id);
}

/**
 * Pick cards to play in the play phase.
 * Returns the action name and card IDs to play.
 */
export function makeAIPlayMove(
	playerID: string,
	hand: Card[],
	G: TractorState
): { action: 'leadTrick' | 'followTrick'; cardIds: string[] } {
	if (G.currentTrick === null) {
		return { action: 'leadTrick', cardIds: [hand[0].id] };
	}
	const count = G.currentTrick.led.length;
	return { action: 'followTrick', cardIds: hand.slice(0, count).map((c) => c.id) };
}
