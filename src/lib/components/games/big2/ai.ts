import type { StandardCard } from '$lib/shared/cards.js';
import type { LastPlay, PlayType } from '$lib/games/big2/types.js';
import { getPlayType, beatsPlay, highestCard, cardValue } from '$lib/games/big2/Big2.js';

// Local type rank for sorting 5-card plays weakest-first
const FIVE_CARD_TYPE_RANK: Partial<Record<PlayType, number>> = {
	straight: 0,
	flush: 1,
	fullHouse: 2,
	fourOfAKind: 3,
	straightFlush: 4
};

/**
 * Generate all k-element combinations from an array.
 */
function combinations<T>(arr: T[], k: number): T[][] {
	if (k === 0) return [[]];
	if (arr.length < k) return [];
	const [first, ...rest] = arr;
	const withFirst = combinations(rest, k - 1).map((combo) => [first, ...combo]);
	const withoutFirst = combinations(rest, k);
	return [...withFirst, ...withoutFirst];
}

/**
 * Find all valid plays that can beat the last play.
 */
function findValidPlays(
	hand: StandardCard[],
	lastPlay: LastPlay
): { cards: StandardCard[]; type: PlayType }[] {
	const validPlays: { cards: StandardCard[]; type: PlayType }[] = [];
	const targetLength = lastPlay.cards.length;

	if (targetLength === 1) {
		for (const card of hand) {
			const playType = getPlayType([card]);
			if (playType && beatsPlay([card], playType, lastPlay)) {
				validPlays.push({ cards: [card], type: playType });
			}
		}
	} else if (targetLength === 2) {
		const rankGroups = new Map<string, StandardCard[]>();
		for (const card of hand) {
			if (!rankGroups.has(card.rank)) rankGroups.set(card.rank, []);
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
		const rankGroups = new Map<string, StandardCard[]>();
		for (const card of hand) {
			if (!rankGroups.has(card.rank)) rankGroups.set(card.rank, []);
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
	} else if (targetLength === 5) {
		for (const combo of combinations(hand, 5)) {
			const playType = getPlayType(combo);
			if (playType && beatsPlay(combo, playType, lastPlay)) {
				validPlays.push({ cards: combo, type: playType });
			}
		}
	}

	return validPlays;
}

/**
 * Simple AI strategy to make a move.
 * Returns array of card IDs to play, or 'pass'.
 */
export function makeAIMove(
	playerID: string,
	hand: StandardCard[],
	lastPlay: LastPlay | null
): string[] | 'pass' {
	const sortedHand = [...hand].sort((a, b) => cardValue(a) - cardValue(b));

	// Leading a new round
	if (lastPlay === null || lastPlay.playerID === playerID) {
		// End-game: ≤2 cards left — play highest to try to win and go out
		if (sortedHand.length <= 2) {
			return [sortedHand[sortedHand.length - 1].id];
		}

		// Find all cards matching the lowest rank
		const lowestRank = sortedHand[0].rank;
		const lowestGroup = sortedHand.filter((c) => c.rank === lowestRank);

		if (lowestGroup.length >= 3) {
			return lowestGroup.slice(0, 3).map((c) => c.id);
		}
		if (lowestGroup.length === 2) {
			return lowestGroup.map((c) => c.id);
		}
		return [sortedHand[0].id];
	}

	// Following: find all valid beating plays
	const validPlays = findValidPlays(sortedHand, lastPlay);

	if (validPlays.length > 0) {
		// Sort weakest-first: by type rank (for 5-card), then by highest card value
		validPlays.sort((a, b) => {
			const aTypeRank = FIVE_CARD_TYPE_RANK[a.type] ?? -1;
			const bTypeRank = FIVE_CARD_TYPE_RANK[b.type] ?? -1;
			if (aTypeRank !== bTypeRank) return aTypeRank - bTypeRank;
			return cardValue(highestCard(a.cards)) - cardValue(highestCard(b.cards));
		});
		return validPlays[0].cards.map((c) => c.id);
	}

	return 'pass';
}
