import type { Card } from '$lib/shared/cards.js';
import type { TractorState } from '$lib/games/tractor/types.js';

/** Pick a suit to declare as trump */
export function makeAIDeclaration(): 'spades' {
	return 'spades';
}

/** Pick first 8 cards to bury */
export function makeAIBuryCards(hand: Card[]): string[] {
	return hand.slice(0, 8).map((c) => c.id);
}

/**
 * Pick cards to play in the play phase.
 * Returns card IDs to lead with (1 card) or follow with (match led count).
 */
export function makeAIPlayMove(
	playerID: string,
	hand: Card[],
	G: TractorState
): { action: 'leadTrick' | 'followTrick'; cardIds: string[] } {
	if (G.currentTrick === null) {
		// Lead: play first card
		return { action: 'leadTrick', cardIds: [hand[0].id] };
	}

	// Follow: play first N cards matching led count
	const count = G.currentTrick.led.length;
	const cardIds = hand.slice(0, count).map((c) => c.id);
	return { action: 'followTrick', cardIds };
}
