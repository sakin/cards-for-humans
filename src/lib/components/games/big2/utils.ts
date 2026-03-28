import type { StandardCard } from '$lib/shared/cards.js';
import type { LastPlay, PlayType } from '$lib/games/big2/types.js';
import { getPlayType, beatsPlay } from '$lib/games/big2/Big2.js';

export interface ValidationResult {
	valid: boolean;
	type: PlayType | null;
	message: string;
}

/**
 * Validate a selection of cards for play
 */
export function validateSelection(cards: StandardCard[]): ValidationResult {
	if (cards.length === 0) {
		return { valid: false, type: null, message: 'No cards selected' };
	}

	const playType = getPlayType(cards);

	if (playType === null) {
		return { valid: false, type: null, message: 'Invalid card combination' };
	}

	return { valid: true, type: playType, message: 'Valid play' };
}

/**
 * Check if selected cards can beat the last play
 */
export function canBeatLastPlay(
	cards: StandardCard[],
	lastPlay: LastPlay | null
): { can: boolean; message: string } {
	if (lastPlay === null) {
		return { can: true, message: 'Leading - any valid play works' };
	}

	const playType = getPlayType(cards);
	if (playType === null) {
		return { can: false, message: 'Invalid card combination' };
	}

	const beats = beatsPlay(cards, playType, lastPlay);
	if (!beats) {
		return { can: false, message: 'Cannot beat the current play' };
	}

	return { can: true, message: 'Can beat the current play' };
}

/**
 * Get opponent positions for layout
 */
export function getOpponentPositions(
	playerID: string,
	playOrder: string[]
): { top: string; left: string; right: string } {
	const playerIndex = playOrder.indexOf(playerID);
	const numPlayers = playOrder.length;

	return {
		top: playOrder[(playerIndex + 2) % numPlayers],
		left: playOrder[(playerIndex + 1) % numPlayers],
		right: playOrder[(playerIndex + 3) % numPlayers]
	};
}
