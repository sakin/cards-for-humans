import { describe, it, expect } from 'vitest';
import { Client } from 'boardgame.io/client';
import { Big2, getPlayType, beatsPlay, checkWinner, cardValue } from './Big2.js';
import type { Big2State } from './types.js';

function makeClient(numPlayers = 4) {
	const client = Client<Big2State>({ game: Big2, numPlayers });
	client.start();
	return client;
}

// ─── Unit tests for pure helpers ─────────────────────────────────────────────

describe('cardValue', () => {
	it('3♦ is the lowest card', () => {
		expect(cardValue({ suit: 'diamonds', rank: '3', id: '' })).toBe(0);
	});

	it('2♠ is the highest card', () => {
		// rank 2 = index 12, suit spades = index 3 → 12*4+3 = 51
		expect(cardValue({ suit: 'spades', rank: '2', id: '' })).toBe(51);
	});

	it('suit breaks ties within same rank', () => {
		const clubs3 = cardValue({ suit: 'clubs', rank: '3', id: '' });
		const hearts3 = cardValue({ suit: 'hearts', rank: '3', id: '' });
		const spades3 = cardValue({ suit: 'spades', rank: '3', id: '' });
		expect(clubs3).toBeGreaterThan(cardValue({ suit: 'diamonds', rank: '3', id: '' }));
		expect(hearts3).toBeGreaterThan(clubs3);
		expect(spades3).toBeGreaterThan(hearts3);
	});
});

describe('getPlayType', () => {
	it('single card → single', () => {
		expect(getPlayType([{ suit: 'spades', rank: 'A', id: '' }])).toBe('single');
	});

	it('two cards same rank → pair', () => {
		expect(
			getPlayType([
				{ suit: 'spades', rank: 'K', id: '' },
				{ suit: 'hearts', rank: 'K', id: '' }
			])
		).toBe('pair');
	});

	it('two cards different rank → null', () => {
		expect(
			getPlayType([
				{ suit: 'spades', rank: 'K', id: '' },
				{ suit: 'hearts', rank: 'Q', id: '' }
			])
		).toBeNull();
	});

	it('three same rank → triple', () => {
		expect(
			getPlayType([
				{ suit: 'spades', rank: '7', id: '' },
				{ suit: 'hearts', rank: '7', id: '' },
				{ suit: 'clubs', rank: '7', id: '' }
			])
		).toBe('triple');
	});

	it('five-card straight → straight', () => {
		expect(
			getPlayType([
				{ suit: 'spades', rank: '3', id: '' },
				{ suit: 'clubs', rank: '4', id: '' },
				{ suit: 'hearts', rank: '5', id: '' },
				{ suit: 'diamonds', rank: '6', id: '' },
				{ suit: 'spades', rank: '7', id: '' }
			])
		).toBe('straight');
	});

	it('five-card flush → flush', () => {
		expect(
			getPlayType([
				{ suit: 'spades', rank: '3', id: '' },
				{ suit: 'spades', rank: '5', id: '' },
				{ suit: 'spades', rank: '7', id: '' },
				{ suit: 'spades', rank: '9', id: '' },
				{ suit: 'spades', rank: 'J', id: '' }
			])
		).toBe('flush');
	});

	it('full house → fullHouse', () => {
		expect(
			getPlayType([
				{ suit: 'spades', rank: 'K', id: '' },
				{ suit: 'hearts', rank: 'K', id: '' },
				{ suit: 'clubs', rank: 'K', id: '' },
				{ suit: 'spades', rank: 'Q', id: '' },
				{ suit: 'hearts', rank: 'Q', id: '' }
			])
		).toBe('fullHouse');
	});

	it('four of a kind + 1 → fourOfAKind', () => {
		expect(
			getPlayType([
				{ suit: 'spades', rank: 'A', id: '' },
				{ suit: 'hearts', rank: 'A', id: '' },
				{ suit: 'clubs', rank: 'A', id: '' },
				{ suit: 'diamonds', rank: 'A', id: '' },
				{ suit: 'spades', rank: '3', id: '' }
			])
		).toBe('fourOfAKind');
	});

	it('invalid combination → null', () => {
		expect(
			getPlayType([
				{ suit: 'spades', rank: 'A', id: '' },
				{ suit: 'hearts', rank: 'K', id: '' },
				{ suit: 'clubs', rank: 'Q', id: '' },
				{ suit: 'diamonds', rank: 'J', id: '' }
			])
		).toBeNull();
	});
});

describe('beatsPlay', () => {
	const single = (rank: string) => [{ suit: 'spades' as const, rank: rank as never, id: '' }];

	it('higher single beats lower single', () => {
		expect(beatsPlay(single('A'), 'single', { cards: single('K'), type: 'single' })).toBe(true);
	});

	it('lower single does not beat higher single', () => {
		expect(beatsPlay(single('K'), 'single', { cards: single('A'), type: 'single' })).toBe(false);
	});

	it('pair cannot beat a single', () => {
		const pair = [
			{ suit: 'spades' as const, rank: 'A' as const, id: '' },
			{ suit: 'hearts' as const, rank: 'A' as const, id: '' }
		];
		expect(beatsPlay(pair, 'pair', { cards: single('3'), type: 'single' })).toBe(false);
	});

	it('five-card hands beat by type rank: fullHouse > flush', () => {
		const cards5 = (r: string) =>
			Array.from({ length: 5 }, (_, i) => ({
				suit: 'spades' as const,
				rank: r as never,
				id: `${i}`
			}));
		expect(beatsPlay(cards5('A'), 'fullHouse', { cards: cards5('K'), type: 'flush' })).toBe(true);
		expect(beatsPlay(cards5('A'), 'flush', { cards: cards5('K'), type: 'fullHouse' })).toBe(false);
	});
});

describe('checkWinner', () => {
	it('returns undefined when all players have cards', () => {
		const client = makeClient();
		expect(checkWinner(client.getState()!.G)).toBeUndefined();
	});

	it('returns playerID when that player has an empty hand', () => {
		const G: Big2State = {
			hands: { '0': [], '1': [{ suit: 'spades', rank: 'A', id: 'x' }], '2': [], '3': [] },
			lastPlay: null,
			passCount: 0,
			startingPlayer: '1'
		};
		expect(checkWinner(G)).toBe('0');
	});
});

// ─── Integration tests via boardgame.io Client ────────────────────────────────

describe('Big2 game configuration', () => {
	it('should be configured for exactly 4 players', () => {
		expect(Big2.minPlayers).toBe(4);
		expect(Big2.maxPlayers).toBe(4);
	});

	it('should create a game with 4 players by default', () => {
		const client = makeClient(); // Uses default numPlayers: 4
		const state = client.getState()!;

		expect(state.ctx.numPlayers).toBe(4);
		expect(state.ctx.playOrder).toHaveLength(4);
		expect(Object.keys(state.G.hands)).toHaveLength(4);
	});
});

describe('Big2 setup', () => {
	it('deals 13 cards to each of 4 players', () => {
		const client = makeClient();
		for (const hand of Object.values(client.getState()!.G.hands)) {
			expect(hand).toHaveLength(13);
		}
	});

	it('distributes all 52 cards with no duplicates', () => {
		const client = makeClient();
		const allCards = Object.values(client.getState()!.G.hands).flat();
		expect(allCards).toHaveLength(52);
		expect(new Set(allCards.map((c) => c.id)).size).toBe(52);
	});

	it('starting player holds the 3 of diamonds', () => {
		const client = makeClient();
		const { G, ctx } = client.getState()!;
		expect(G.hands[G.startingPlayer].some((c) => c.rank === '3' && c.suit === 'diamonds')).toBe(
			true
		);
		expect(ctx.currentPlayer).toBe(G.startingPlayer);
	});
});

describe('Big2 playCards move', () => {
	it('removes the played card from hand', () => {
		const client = makeClient();
		const { G, ctx } = client.getState()!;
		const player = ctx.currentPlayer;
		const card = G.hands[player][0];

		client.moves.playCards([card.id]);

		const newHand = client.getState()!.G.hands[player];
		expect(newHand).toHaveLength(12);
		expect(newHand.some((c) => c.id === card.id)).toBe(false);
	});

	it('records the last play', () => {
		const client = makeClient();
		const { G, ctx } = client.getState()!;
		const card = G.hands[ctx.currentPlayer][0];

		client.moves.playCards([card.id]);

		expect(client.getState()!.G.lastPlay).not.toBeNull();
	});

	it('advances to the next player after playing', () => {
		const client = makeClient();
		const { G, ctx } = client.getState()!;
		const firstPlayer = ctx.currentPlayer;
		const card = G.hands[firstPlayer][0];

		client.moves.playCards([card.id]);

		expect(client.getState()!.ctx.currentPlayer).not.toBe(firstPlayer);
	});

	it('rejects a card not in hand', () => {
		const client = makeClient();
		const stateBefore = client.getState()!;

		client.moves.playCards(['no-such-card']);

		expect(client.getState()!.G.hands).toEqual(stateBefore.G.hands);
		expect(client.getState()!.G.lastPlay).toBeNull();
	});

	it('rejects a single that does not beat the last play', () => {
		const client = makeClient();
		const { G, ctx } = client.getState()!;

		// First player plays their highest card — guarantees second player has only lower cards
		const firstPlayer = ctx.currentPlayer;
		const highestFirst = G.hands[firstPlayer].reduce((a, b) =>
			cardValue(a) > cardValue(b) ? a : b
		);
		client.moves.playCards([highestFirst.id]);

		// Second player picks their lowest card
		const secondPlayer = client.getState()!.ctx.currentPlayer;
		const secondHand = client.getState()!.G.hands[secondPlayer];
		const lowestSecond = secondHand.reduce((a, b) => (cardValue(a) < cardValue(b) ? a : b));

		// The lowest card in any other player's hand must be ≤ the highest card played,
		// so it cannot beat the last play (and if they happen to be equal value, still can't
		// beat because a card can't beat itself).
		const stateBefore = client.getState()!.G;
		if (cardValue(lowestSecond) <= cardValue(highestFirst)) {
			client.moves.playCards([lowestSecond.id]);
			// State must be unchanged — the move was rejected
			expect(client.getState()!.G.hands[secondPlayer]).toHaveLength(
				stateBefore.hands[secondPlayer].length
			);
			expect(client.getState()!.G.lastPlay?.cards[0].id).toBe(highestFirst.id);
		}
	});
});

describe('Big2 pass move', () => {
	it('is invalid when leading a new round (no last play)', () => {
		const client = makeClient();
		const stateBefore = client.getState()!.G;

		client.moves.pass();

		expect(client.getState()!.G.passCount).toBe(stateBefore.passCount);
		expect(client.getState()!.G.lastPlay).toBeNull();
	});

	it('increments passCount after a play has been made', () => {
		const client = makeClient();
		const { G, ctx } = client.getState()!;
		const card = G.hands[ctx.currentPlayer][0];
		client.moves.playCards([card.id]);

		client.moves.pass();

		expect(client.getState()!.G.passCount).toBe(1);
	});

	it('clears the table after 3 consecutive passes', () => {
		const client = makeClient();
		const { G, ctx } = client.getState()!;
		const card = G.hands[ctx.currentPlayer][0];

		client.moves.playCards([card.id]); // player A plays
		client.moves.pass(); // player B passes
		client.moves.pass(); // player C passes
		client.moves.pass(); // player D passes → table clears

		const state = client.getState()!;
		expect(state.G.lastPlay).toBeNull();
		expect(state.G.passCount).toBe(0);
	});

	it('returning player leads freely after table clears', () => {
		const client = makeClient();
		const { G, ctx } = client.getState()!;
		const firstPlayer = ctx.currentPlayer;
		const firstCard = G.hands[firstPlayer][0];

		client.moves.playCards([firstCard.id]);
		client.moves.pass();
		client.moves.pass();
		client.moves.pass(); // table clears, back to firstPlayer

		// firstPlayer should be current again and can play any card
		expect(client.getState()!.ctx.currentPlayer).toBe(firstPlayer);
		const nextCard = client.getState()!.G.hands[firstPlayer][0];
		client.moves.playCards([nextCard.id]);
		expect(client.getState()!.G.lastPlay).not.toBeNull();
	});
});
