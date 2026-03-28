import type { StandardCard } from '$lib/shared/cards.js';
import { cardValue } from '$lib/games/big2/Big2.js';

/**
 * Get the Unicode symbol for a card suit
 */
export function getSuitSymbol(suit: string): string {
	const symbols: Record<string, string> = {
		spades: '♠',
		hearts: '♥',
		diamonds: '♦',
		clubs: '♣'
	};
	return symbols[suit] ?? suit;
}

/**
 * Get the Tailwind color class for a card suit
 */
export function getSuitColor(suit: string): string {
	return suit === 'hearts' || suit === 'diamonds' ? 'text-red-600' : 'text-gray-900';
}

/**
 * Get the display text for a card rank
 */
export function getRankDisplay(rank: string): string {
	// Ranks like J, Q, K, A already display correctly
	// Just return the rank as-is
	return rank;
}

/**
 * Sort cards for display using Big 2 card value ordering
 */
export function sortCardsForDisplay(cards: StandardCard[]): StandardCard[] {
	return [...cards].sort((a, b) => cardValue(a) - cardValue(b));
}
