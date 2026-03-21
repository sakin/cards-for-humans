import { describe, it, expect } from 'vitest';
import { Client } from 'boardgame.io/client';
import { CardsForHumans } from './CardsForHumans.js';

describe('CardsForHumans', () => {
	it('starts with count 0', () => {
		const client = Client({ game: CardsForHumans });
		client.start();
		expect(client.getState()!.G.count).toBe(0);
	});

	it('increment increases count by 1', () => {
		const client = Client({ game: CardsForHumans });
		client.start();
		client.moves.increment();
		expect(client.getState()!.G.count).toBe(1);
	});

	it('multiple increments accumulate', () => {
		const client = Client({ game: CardsForHumans });
		client.start();
		client.moves.increment();
		client.moves.increment();
		client.moves.increment();
		expect(client.getState()!.G.count).toBe(3);
	});
});
