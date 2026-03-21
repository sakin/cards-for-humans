import type { Game } from 'boardgame.io';
import type { CardsForHumansState } from './types.js';

export const CardsForHumans: Game<CardsForHumansState> = {
	name: 'CardsForHumans',

	setup: (): CardsForHumansState => ({ count: 0 }),

	moves: {
		increment: ({ G }) => {
			G.count += 1;
		},
	},
};
