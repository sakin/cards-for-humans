import { describe, it, expect } from 'vitest';
import { Client } from 'boardgame.io/client';
import { Tractor, KITTY_SIZE, CARDS_PER_PLAYER } from './Tractor.js';
import { isJoker } from '$lib/shared/cards.js';
import type { TractorState } from './types.js';

const TOTAL_CARDS = 108; // 2 standard decks + 4 jokers

function makeClient(numPlayers = 4) {
	const client = Client<TractorState>({ game: Tractor, numPlayers });
	client.start();
	return client;
}

// ─── Setup ────────────────────────────────────────────────────────────────────

describe('Tractor setup', () => {
	it('deals 25 cards to each of 4 players', () => {
		const { G } = makeClient().getState()!;
		for (const hand of Object.values(G.hands)) {
			expect(hand).toHaveLength(CARDS_PER_PLAYER);
		}
	});

	it('puts 8 cards in the kitty', () => {
		const { G } = makeClient().getState()!;
		expect(G.kitty).toHaveLength(KITTY_SIZE);
	});

	it('accounts for all 108 cards with no duplicates', () => {
		const { G } = makeClient().getState()!;
		const allCards = [...Object.values(G.hands).flat(), ...G.kitty];
		expect(allCards).toHaveLength(TOTAL_CARDS);
		expect(new Set(allCards.map((c) => c.id)).size).toBe(TOTAL_CARDS);
	});

	it('starts in the declaration phase', () => {
		const { ctx } = makeClient().getState()!;
		expect(ctx.phase).toBe('declaration');
	});

	it('starts with no trump suit declared', () => {
		const { G } = makeClient().getState()!;
		expect(G.trumpSuit).toBeNull();
	});

	it('starts with trump rank at 2 (lowest starting level)', () => {
		const { G } = makeClient().getState()!;
		expect(G.trumpRank).toBe('2');
	});

	it('has 4 jokers distributed across hands and kitty', () => {
		const { G } = makeClient().getState()!;
		const allCards = [...Object.values(G.hands).flat(), ...G.kitty];
		expect(allCards.filter(isJoker)).toHaveLength(4);
	});
});

// ─── Declaration phase ────────────────────────────────────────────────────────

describe('Tractor declaration phase', () => {
	it('declareTrump sets the trump suit', () => {
		const client = makeClient();
		client.moves.declareTrump('spades');
		expect(client.getState()!.G.trumpSuit).toBe('spades');
	});

	it('declareTrump sets the declaring player as banker', () => {
		const client = makeClient();
		const { ctx } = client.getState()!;
		const declarer = ctx.currentPlayer;

		client.moves.declareTrump('hearts');

		expect(client.getState()!.G.banker).toBe(declarer);
	});

	it('declareTrump sets the banker team (declarer + partner across the table)', () => {
		const client = makeClient();
		const { ctx } = client.getState()!;
		const declarer = ctx.currentPlayer; // '0'
		// Partner sits across: (0+2)%4 = 2
		const expectedPartner = ctx.playOrder[(ctx.playOrder.indexOf(declarer) + 2) % 4];

		client.moves.declareTrump('clubs');

		const { bankerTeam } = client.getState()!.G;
		expect(bankerTeam).toContain(declarer);
		expect(bankerTeam).toContain(expectedPartner);
	});

	it('declareTrump advances phase to kitty', () => {
		const client = makeClient();
		client.moves.declareTrump('diamonds');
		expect(client.getState()!.ctx.phase).toBe('kitty');
	});

	it('rejects declareTrump with an invalid suit', () => {
		const client = makeClient();
		client.moves.declareTrump('joker' as never);
		expect(client.getState()!.G.trumpSuit).toBeNull();
		expect(client.getState()!.ctx.phase).toBe('declaration');
	});

	it('trump suit persists after the declaration phase ends', () => {
		const client = makeClient();
		client.moves.declareTrump('spades');
		// Phase has moved to kitty — declareTrump is no longer available,
		// but the declared suit must still be set in state
		expect(client.getState()!.G.trumpSuit).toBe('spades');
		expect(client.getState()!.ctx.phase).toBe('kitty');
	});
});

// ─── Kitty phase ─────────────────────────────────────────────────────────────

describe('Tractor kitty phase', () => {
	function advanceToKitty() {
		const client = makeClient();
		client.moves.declareTrump('spades');
		return client;
	}

	it('takeKitty adds kitty cards to banker hand', () => {
		const client = advanceToKitty();
		const { G } = client.getState()!;
		const banker = G.banker;
		const handSizeBefore = G.hands[banker].length;

		client.moves.takeKitty();

		const { G: G2 } = client.getState()!;
		expect(G2.hands[banker]).toHaveLength(handSizeBefore + KITTY_SIZE);
		expect(G2.kitty).toHaveLength(0);
	});

	it('buryCards removes 8 cards from banker hand', () => {
		const client = advanceToKitty();
		client.moves.takeKitty();

		const { G } = client.getState()!;
		const banker = G.banker;
		const handSizeBefore = G.hands[banker].length; // 25 + 8 = 33
		const cardsToBury = G.hands[banker].slice(0, KITTY_SIZE).map((c) => c.id);

		client.moves.buryCards(cardsToBury);

		const { G: G2 } = client.getState()!;
		expect(G2.hands[banker]).toHaveLength(handSizeBefore - KITTY_SIZE);
		expect(G2.buried).toHaveLength(KITTY_SIZE);
	});

	it('buryCards advances phase to play', () => {
		const client = advanceToKitty();
		client.moves.takeKitty();

		const { G } = client.getState()!;
		const cardsToBury = G.hands[G.banker].slice(0, KITTY_SIZE).map((c) => c.id);
		client.moves.buryCards(cardsToBury);

		expect(client.getState()!.ctx.phase).toBe('play');
	});

	it('rejects buryCards before takeKitty', () => {
		const client = advanceToKitty();
		const { G } = client.getState()!;
		// kitty is still full (not taken yet)
		const cardsToBury = G.hands[G.banker].slice(0, KITTY_SIZE).map((c) => c.id);

		client.moves.buryCards(cardsToBury);

		// Still in kitty phase and buried is still empty
		expect(client.getState()!.ctx.phase).toBe('kitty');
		expect(client.getState()!.G.buried).toHaveLength(0);
	});

	it('rejects buryCards with wrong number of cards', () => {
		const client = advanceToKitty();
		client.moves.takeKitty();

		const { G } = client.getState()!;
		const tooFew = G.hands[G.banker].slice(0, KITTY_SIZE - 1).map((c) => c.id);

		client.moves.buryCards(tooFew);

		expect(client.getState()!.G.buried).toHaveLength(0);
	});
});
