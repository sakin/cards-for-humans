import type { Game, Move } from 'boardgame.io';
import { INVALID_MOVE } from 'boardgame.io/core';
import { createStandardDeck } from '$lib/shared/cards.js';
import type { StandardCard } from '$lib/shared/cards.js';
import type { Big2State, PlayType, LastPlay } from './types.js';

// Big 2 rank order: 3 is lowest, 2 is highest
const RANK_ORDER: Record<string, number> = {
	'3': 0,
	'4': 1,
	'5': 2,
	'6': 3,
	'7': 4,
	'8': 5,
	'9': 6,
	'10': 7,
	J: 8,
	Q: 9,
	K: 10,
	A: 11,
	'2': 12
};

const SUIT_ORDER: Record<string, number> = {
	diamonds: 0,
	clubs: 1,
	hearts: 2,
	spades: 3
};

export function cardValue(card: StandardCard): number {
	return RANK_ORDER[card.rank] * 4 + SUIT_ORDER[card.suit];
}

export function highestCard(cards: StandardCard[]): StandardCard {
	return cards.reduce((a, b) => (cardValue(a) > cardValue(b) ? a : b));
}

function groupByRank(cards: StandardCard[]): Record<string, StandardCard[]> {
	return cards.reduce(
		(acc, card) => {
			acc[card.rank] = [...(acc[card.rank] ?? []), card];
			return acc;
		},
		{} as Record<string, StandardCard[]>
	);
}

function getFiveCardType(cards: StandardCard[]): PlayType | null {
	const ranks = cards.map((c) => RANK_ORDER[c.rank]).sort((a, b) => a - b);
	const suits = new Set(cards.map((c) => c.suit));
	const groupSizes = Object.values(groupByRank(cards))
		.map((g) => g.length)
		.sort((a, b) => b - a);

	const isFlush = suits.size === 1;
	const isStraight = ranks.every((r, i) => i === 0 || r === ranks[i - 1] + 1);

	if (isFlush && isStraight) return 'straightFlush';
	if (groupSizes[0] === 4) return 'fourOfAKind';
	if (groupSizes[0] === 3 && groupSizes[1] === 2) return 'fullHouse';
	if (isFlush) return 'flush';
	if (isStraight) return 'straight';
	return null;
}

export function getPlayType(cards: StandardCard[]): PlayType | null {
	const n = cards.length;
	if (n === 1) return 'single';
	if (n === 2) return cards[0].rank === cards[1].rank ? 'pair' : null;
	if (n === 3) return cards.every((c) => c.rank === cards[0].rank) ? 'triple' : null;
	if (n === 5) return getFiveCardType(cards);
	return null;
}

const FIVE_CARD_RANK: Partial<Record<PlayType, number>> = {
	straight: 0,
	flush: 1,
	fullHouse: 2,
	fourOfAKind: 3,
	straightFlush: 4
};

export function beatsPlay(
	newCards: StandardCard[],
	newType: PlayType,
	lastPlay: Pick<LastPlay, 'cards' | 'type'>
): boolean {
	if (newType !== lastPlay.type) {
		// Five-card hands beat other five-card hands by type rank
		const newRank = FIVE_CARD_RANK[newType];
		const lastRank = FIVE_CARD_RANK[lastPlay.type];
		if (newRank !== undefined && lastRank !== undefined) {
			return newRank > lastRank;
		}
		return false;
	}
	return cardValue(highestCard(newCards)) > cardValue(highestCard(lastPlay.cards));
}

export function checkWinner(G: Big2State): string | undefined {
	return Object.entries(G.hands).find(([, hand]) => hand.length === 0)?.[0];
}

const playCards: Move<Big2State> = ({ G, ctx, events }, cardIds: string[]) => {
	if (!Array.isArray(cardIds) || cardIds.length === 0) return INVALID_MOVE;

	const playerHand = G.hands[ctx.currentPlayer];
	const cards = cardIds
		.map((id) => playerHand.find((c) => c.id === id))
		.filter((c): c is StandardCard => c !== undefined);

	if (cards.length !== cardIds.length) return INVALID_MOVE;

	const playType = getPlayType(cards);
	if (!playType) return INVALID_MOVE;

	if (G.lastPlay !== null && !beatsPlay(cards, playType, G.lastPlay)) return INVALID_MOVE;

	G.hands[ctx.currentPlayer] = playerHand.filter((c) => !cardIds.includes(c.id));
	G.lastPlay = { playerID: ctx.currentPlayer, cards, type: playType };
	G.passCount = 0;

	events.endTurn();
};

const pass: Move<Big2State> = ({ G, ctx, events }) => {
	// Cannot pass when leading a new round (no last play, or you were the last to play)
	if (G.lastPlay === null || G.lastPlay.playerID === ctx.currentPlayer) return INVALID_MOVE;

	G.passCount += 1;

	// All other players passed — table clears, next player leads freely
	if (G.passCount >= ctx.numPlayers - 1) {
		G.lastPlay = null;
		G.passCount = 0;
	}

	events.endTurn();
};

export const Big2: Game<Big2State> = {
	name: 'big2',

	setup: ({ ctx, random }) => {
		const deck = random.Shuffle(createStandardDeck());
		const hands: Record<string, StandardCard[]> = {};

		ctx.playOrder.forEach((playerID, i) => {
			hands[playerID] = deck.slice(i * 13, (i + 1) * 13);
		});

		const startingPlayer =
			ctx.playOrder.find((id) =>
				hands[id].some((c) => c.rank === '3' && c.suit === 'diamonds')
			) ?? ctx.playOrder[0];

		return { hands, lastPlay: null, passCount: 0, startingPlayer };
	},

	turn: {
		order: {
			first: ({ G, ctx }) => ctx.playOrder.indexOf(G.startingPlayer),
			next: ({ ctx }) => (ctx.playOrderPos + 1) % ctx.numPlayers
		}
	},

	moves: { playCards, pass },

	endIf: ({ G }) => {
		const winner = checkWinner(G);
		return winner !== undefined ? { winner } : undefined;
	}
};
