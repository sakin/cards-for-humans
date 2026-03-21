import type { Game, Move } from 'boardgame.io';
import { INVALID_MOVE } from 'boardgame.io/core';
import { createTractorDeck, isJoker } from '$lib/shared/cards.js';
import type { Card, Suit } from '$lib/shared/cards.js';
import type { TractorState } from './types.js';

const KITTY_SIZE = 8;
const CARDS_PER_PLAYER = 25; // (108 - 8) / 4

// ─── Declaration phase ────────────────────────────────────────────────────────

const declareTrump: Move<TractorState> = ({ G, ctx, events }, suit: Suit) => {
	if (G.trumpSuit !== null) return INVALID_MOVE; // already declared
	if (!['clubs', 'diamonds', 'hearts', 'spades'].includes(suit)) return INVALID_MOVE;

	G.trumpSuit = suit;
	G.banker = ctx.currentPlayer;
	// Banker's partner sits across (positions 0↔2, 1↔3)
	const pos = ctx.playOrder.indexOf(ctx.currentPlayer);
	const partnerPos = (pos + 2) % ctx.numPlayers;
	G.bankerTeam = [ctx.currentPlayer, ctx.playOrder[partnerPos]];

	events.endPhase(); // → kitty
};

// ─── Kitty phase ──────────────────────────────────────────────────────────────

const takeKitty: Move<TractorState> = ({ G, ctx }) => {
	if (ctx.currentPlayer !== G.banker) return INVALID_MOVE;
	if (G.kitty.length === 0) return INVALID_MOVE; // already taken

	G.hands[G.banker] = [...G.hands[G.banker], ...G.kitty];
	G.kitty = [];
};

const buryCards: Move<TractorState> = ({ G, ctx, events }, cardIds: string[]) => {
	if (ctx.currentPlayer !== G.banker) return INVALID_MOVE;
	if (!Array.isArray(cardIds) || cardIds.length !== KITTY_SIZE) return INVALID_MOVE;
	if (G.kitty.length > 0) return INVALID_MOVE; // must take kitty first

	const hand = G.hands[G.banker];
	const cards = cardIds
		.map((id) => hand.find((c) => c.id === id))
		.filter((c): c is Card => c !== undefined);

	if (cards.length !== KITTY_SIZE) return INVALID_MOVE;

	G.hands[G.banker] = hand.filter((c) => !cardIds.includes(c.id));
	G.buried = cards;

	events.endPhase(); // → play
};

// ─── Play phase ───────────────────────────────────────────────────────────────

const leadTrick: Move<TractorState> = ({ G, ctx, events }, cardIds: string[]) => {
	if (G.currentTrick !== null) return INVALID_MOVE; // trick already in progress

	const hand = G.hands[ctx.currentPlayer];
	const cards = cardIds
		.map((id) => hand.find((c) => c.id === id))
		.filter((c): c is Card => c !== undefined);

	if (cards.length === 0 || cards.length !== cardIds.length) return INVALID_MOVE;

	G.hands[ctx.currentPlayer] = hand.filter((c) => !cardIds.includes(c.id));
	G.currentTrick = {
		led: cards,
		leader: ctx.currentPlayer,
		played: { [ctx.currentPlayer]: cards }
	};

	events.endTurn();
};

const followTrick: Move<TractorState> = ({ G, ctx, events }, cardIds: string[]) => {
	if (G.currentTrick === null) return INVALID_MOVE;
	if (ctx.currentPlayer in G.currentTrick.played) return INVALID_MOVE; // already played

	const hand = G.hands[ctx.currentPlayer];
	const cards = cardIds
		.map((id) => hand.find((c) => c.id === id))
		.filter((c): c is Card => c !== undefined);

	if (cards.length !== G.currentTrick.led.length || cards.length !== cardIds.length)
		return INVALID_MOVE;

	G.hands[ctx.currentPlayer] = hand.filter((c) => !cardIds.includes(c.id));
	G.currentTrick.played[ctx.currentPlayer] = cards;

	const playersWhoPlayed = Object.keys(G.currentTrick.played).length;

	if (playersWhoPlayed === ctx.numPlayers) {
		// Trick complete — simplified: leader wins (full Tractor logic is complex)
		const winner = G.currentTrick.leader;
		G.tricksWon[winner] = (G.tricksWon[winner] ?? 0) + 1;
		G.currentTrick = null;
	}

	events.endTurn();
};

// ─── Game definition ──────────────────────────────────────────────────────────

export const Tractor: Game<TractorState> = {
	name: 'tractor',

	setup: ({ ctx, random }) => {
		const deck = random.Shuffle(createTractorDeck());
		const hands: Record<string, Card[]> = {};

		ctx.playOrder.forEach((playerID, i) => {
			hands[playerID] = deck.slice(i * CARDS_PER_PLAYER, (i + 1) * CARDS_PER_PLAYER);
		});

		const kitty = deck.slice(ctx.numPlayers * CARDS_PER_PLAYER);

		return {
			hands,
			kitty,
			buried: [],
			trumpSuit: null,
			trumpRank: '2',
			banker: ctx.playOrder[0],
			bankerTeam: [ctx.playOrder[0], ctx.playOrder[2]],
			currentTrick: null,
			tricksWon: {}
		};
	},

	phases: {
		declaration: {
			start: true,
			moves: { declareTrump },
			next: 'kitty'
		},
		kitty: {
			moves: { takeKitty, buryCards },
			next: 'play',
			turn: {
				order: {
					first: ({ G, ctx }) => ctx.playOrder.indexOf(G.banker),
					next: ({ ctx }) => (ctx.playOrderPos + 1) % ctx.numPlayers
				}
			}
		},
		play: {
			moves: { leadTrick, followTrick }
		}
	},

	endIf: ({ G }) => {
		const allHandsEmpty = Object.values(G.hands).every((h) => h.length === 0);
		if (!allHandsEmpty) return undefined;

		// Count points captured by the non-banker team
		// Point cards: 5=5pts, 10=10pts, K=10pts
		const nonBankerTeam = Object.keys(G.tricksWon).filter(
			(id) => !G.bankerTeam.includes(id as never)
		);
		const _ = nonBankerTeam; // scoring logic would go here
		return { winner: G.bankerTeam[0] }; // simplified
	}
};

export { KITTY_SIZE, CARDS_PER_PLAYER, isJoker };
