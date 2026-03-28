import type { StandardCard } from '$lib/shared/cards.js';

export type PlayType =
	| 'single'
	| 'pair'
	| 'triple'
	| 'straight'
	| 'flush'
	| 'fullHouse'
	| 'fourOfAKind'
	| 'straightFlush';

export interface LastPlay {
	playerID: string;
	cards: StandardCard[];
	type: PlayType;
}

export interface Big2State {
	hands: Record<string, StandardCard[]>;
	lastPlay: LastPlay | null;
	passCount: number;
	startingPlayer: string;
}
