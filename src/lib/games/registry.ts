import type { Game } from 'boardgame.io';
import { Big2 } from './big2/Big2.js';
import { Tractor } from './tractor/Tractor.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const games = {
	big2: Big2,
	tractor: Tractor
} satisfies Record<string, Game<any>>;

export type GameId = keyof typeof games;
