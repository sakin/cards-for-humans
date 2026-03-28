import { describe, it, expect } from 'vitest';
import { Client } from 'boardgame.io/client';
import type { Game } from 'boardgame.io';

describe('gameClient player count configuration', () => {
	it('should use minPlayers from game definition when creating client', () => {
		const mockGame: Game = {
			name: 'test',
			minPlayers: 4,
			maxPlayers: 4,
			setup: () => ({})
		};

		// Test that boardgame.io Client respects numPlayers
		const numPlayers = mockGame.minPlayers || mockGame.maxPlayers || 2;
		const client = Client({ game: mockGame, numPlayers });
		client.start();
		const state = client.getState();

		expect(state?.ctx.numPlayers).toBe(4);
		expect(state?.ctx.playOrder).toHaveLength(4);
	});

	it('should fall back to maxPlayers if minPlayers not set', () => {
		const mockGame: Game = {
			name: 'test',
			maxPlayers: 3,
			setup: () => ({})
		};

		const numPlayers = mockGame.minPlayers || mockGame.maxPlayers || 2;
		const client = Client({ game: mockGame, numPlayers });
		client.start();
		const state = client.getState();

		expect(state?.ctx.numPlayers).toBe(3);
	});

	it('should default to 2 players if neither minPlayers nor maxPlayers set', () => {
		const mockGame: Game = {
			name: 'test',
			setup: () => ({})
		};

		const numPlayers = mockGame.minPlayers || mockGame.maxPlayers || 2;
		const client = Client({ game: mockGame, numPlayers });
		client.start();
		const state = client.getState();

		expect(state?.ctx.numPlayers).toBe(2);
	});
});
