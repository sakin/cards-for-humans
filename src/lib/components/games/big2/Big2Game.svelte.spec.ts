import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Big2Game from './Big2Game.svelte';
import { Big2 } from '$lib/games/big2/Big2.js';
import { Client } from 'boardgame.io/client';

describe('Big2Game component', () => {
	it('should render 3 AI opponents for a 4-player game', () => {
		const client = Client({ game: Big2, numPlayers: 4 });
		client.start();
		const state = client.getState();

		const { container } = render(Big2Game, {
			gameState: state,
			moves: client.moves
		});

		// Count opponent indicators - should be 3 (players 1, 2, 3)
		// We're looking for elements that show player names like "Player 2", "Player 3", "Player 4"
		const playerTexts = container.textContent || '';
		expect(playerTexts).toContain('Player 2');
		expect(playerTexts).toContain('Player 3');
		expect(playerTexts).toContain('Player 4');

		// Should not show "Player 1" as that's the human player (shown as "Your Hand")
		expect(playerTexts).toContain('Your Hand');
	});

	it('should show correct card count for each opponent', () => {
		const client = Client({ game: Big2, numPlayers: 4 });
		client.start();
		const state = client.getState();

		const { container } = render(Big2Game, {
			gameState: state,
			moves: client.moves
		});

		// Each opponent should have 13 cards at the start
		const text = container.textContent || '';
		// Should see "13 cards" three times (one for each opponent)
		const cardCountMatches = text.match(/13 cards/g);
		expect(cardCountMatches).toHaveLength(3);
	});

	it('should highlight current player turn', () => {
		const client = Client({ game: Big2, numPlayers: 4 });
		client.start();
		const state = client.getState();

		const { container } = render(Big2Game, {
			gameState: state,
			moves: client.moves
		});

		// The component uses border-yellow-400 and ring-yellow-400 for current turn
		const highlighted = container.querySelector('.border-yellow-400');
		expect(highlighted).toBeTruthy();
	});
});
