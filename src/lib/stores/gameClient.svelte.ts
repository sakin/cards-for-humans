import { Client } from 'boardgame.io/client';
import type { Game } from 'boardgame.io';

export function createGameClient<G extends object>(game: Game<G>) {
	const client = Client<G>({ game, debug: false });
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
