import { Client } from 'boardgame.io/client';
import { CardsForHumans } from '$lib/game/CardsForHumans.js';
import type { CardsForHumansState } from '$lib/game/types.js';

export function createGameClient() {
	const client = Client<CardsForHumansState>({ game: CardsForHumans, debug: false });
	type GameState = ReturnType<typeof client.getState>;
	let gameState = $state<GameState>(null);

	$effect(() => {
		client.start();
		const unsubscribe = client.subscribe((state) => {
			gameState = state;
		});
		return () => {
			unsubscribe();
			client.stop();
		};
	});

	return {
		get state() {
			return gameState;
		},
		moves: client.moves,
	};
}
