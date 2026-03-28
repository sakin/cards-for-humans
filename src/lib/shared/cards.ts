export type Suit = 'clubs' | 'diamonds' | 'hearts' | 'spades';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';
export type JokerType = 'small' | 'big';

export interface StandardCard {
	suit: Suit;
	rank: Rank;
	id: string;
}

export interface Joker {
	joker: JokerType;
	id: string;
}

export type Card = StandardCard | Joker;

export const SUITS: readonly Suit[] = ['clubs', 'diamonds', 'hearts', 'spades'];
export const RANKS: readonly Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

export function isJoker(card: Card): card is Joker {
	return 'joker' in card;
}

export function createStandardDeck(): StandardCard[] {
	return SUITS.flatMap((suit) => RANKS.map((rank) => ({ suit, rank, id: `${suit}-${rank}` })));
}

export function createTractorDeck(): Card[] {
	const deck1 = createStandardDeck().map((c) => ({ ...c, id: `${c.id}-1` }));
	const deck2 = createStandardDeck().map((c) => ({ ...c, id: `${c.id}-2` }));
	const jokers: Joker[] = [
		{ joker: 'small', id: 'joker-small-1' },
		{ joker: 'small', id: 'joker-small-2' },
		{ joker: 'big', id: 'joker-big-1' },
		{ joker: 'big', id: 'joker-big-2' }
	];
	return [...deck1, ...deck2, ...jokers];
}
