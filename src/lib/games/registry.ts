import type { Game } from 'boardgame.io';
import { Big2 } from './big2/Big2.js';
import { Tractor } from './tractor/Tractor.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const games: Record<string, Game<any>> = {
	big2: Big2,
	tractor: Tractor
};

export type GameId = keyof typeof games;
