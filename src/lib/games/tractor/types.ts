import type { Card, Suit, Rank } from '$lib/shared/cards.js';

export interface Trick {
	led: Card[];
	leader: string;
	played: Record<string, Card[]>;
}

export interface TractorState {
	hands: Record<string, Card[]>;
	kitty: Card[];
	buried: Card[];
	trumpSuit: Suit | null;
	trumpRank: Rank;
	banker: string;
	bankerTeam: [string, string];
	currentTrick: Trick | null;
	tricksWon: Record<string, number>;
}
