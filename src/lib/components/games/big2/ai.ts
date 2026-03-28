import type { StandardCard } from '$lib/shared/cards.js';
import type { LastPlay, PlayType } from '$lib/games/big2/types.js';
import { getPlayType, beatsPlay, cardValue } from '$lib/games/big2/Big2.js';

/**
 * Find all valid plays that can beat the last play
 */
function findValidPlays(
	hand: StandardCard[],
	lastPlay: LastPlay
): { cards: StandardCard[]; type: PlayType }[] {
	const validPlays: { cards: StandardCard[]; type: PlayType }[] = [];
	const targetLength = lastPlay.cards.length;

	if (targetLength === 1) {
		// Singles: try each card
		for (const card of hand) {
			const playType = getPlayType([card]);
			if (playType && beatsPlay([card], playType, lastPlay)) {
				validPlays.push({ cards: [card], type: playType });
			}
		}
	} else if (targetLength === 2) {
		// Pairs: find all pairs
		const rankGroups = new Map<string, StandardCard[]>();
		for (const card of hand) {
			if (!rankGroups.has(card.rank)) {
				rankGroups.set(card.rank, []);
			}
			rankGroups.get(card.rank)!.push(card);
		}

		for (const cards of rankGroups.values()) {
			if (cards.length >= 2) {
				const pair = cards.slice(0, 2);
				const playType = getPlayType(pair);
				if (playType && beatsPlay(pair, playType, lastPlay)) {
					validPlays.push({ cards: pair, type: playType });
				}
			}
		}
	} else if (targetLength === 3) {
		// Triples: find all triples
		const rankGroups = new Map<string, StandardCard[]>();
		for (const card of hand) {
			if (!rankGroups.has(card.rank)) {
				rankGroups.set(card.rank, []);
			}
			rankGroups.get(card.rank)!.push(card);
		}

		for (const cards of rankGroups.values()) {
			if (cards.length >= 3) {
				const triple = cards.slice(0, 3);
				const playType = getPlayType(triple);
				if (playType && beatsPlay(triple, playType, lastPlay)) {
					validPlays.push({ cards: triple, type: playType });
				}
			}
		}
	}
	// For 5-card hands, a smarter AI would enumerate straights, flushes, etc.
	// For MVP, we'll just skip those - AI will pass if it can't beat a 5-card hand

	return validPlays;
}

/**
 * Simple AI strategy to make a move
 * Returns array of card IDs to play, or 'pass'
 */
export function makeAIMove(
	playerID: string,
	hand: StandardCard[],
	lastPlay: LastPlay | null
): string[] | 'pass' {
	// Sort hand by card value
	const sortedHand = [...hand].sort((a, b) => cardValue(a) - cardValue(b));

	// If leading (no lastPlay, or we were the last to play)
	if (lastPlay === null || lastPlay.playerID === playerID) {
		// Play the lowest single card
		return [sortedHand[0].id];
	}

	// Try to beat the lastPlay
	const validPlays = findValidPlays(sortedHand, lastPlay);

	if (validPlays.length > 0) {
		// Sort by the highest card value in each play (ascending) to play the weakest valid play
		validPlays.sort((a, b) => {
			const aMax = Math.max(...a.cards.map(cardValue));
			const bMax = Math.max(...b.cards.map(cardValue));
			return aMax - bMax;
		});

		// Return the smallest valid play
		return validPlays[0].cards.map((c) => c.id);
	}

	// Can't beat, must pass
	return 'pass';
}
