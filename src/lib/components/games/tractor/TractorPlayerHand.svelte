<script lang="ts">
	import type { Card, Suit, Rank } from '$lib/shared/cards.js';
	import { isJoker } from '$lib/shared/cards.js';
	import TractorCard from './TractorCard.svelte';

	interface Props {
		cards: Card[];
		selectedIds: Set<string>;
		onSelect: (cardId: string) => void;
		disabled?: boolean;
		label?: string;
	}

	let { cards, selectedIds, onSelect, disabled = false, label }: Props = $props();

	const SUIT_ORDER: Record<Suit, number> = { diamonds: 0, clubs: 1, hearts: 2, spades: 3 };
	const RANK_ORDER: Record<Rank, number> = {
		'3': 0, '4': 1, '5': 2, '6': 3, '7': 4, '8': 5,
		'9': 6, '10': 7, J: 8, Q: 9, K: 10, A: 11, '2': 12
	};

	function sortHand(hand: Card[]): Card[] {
		return [...hand].sort((a, b) => {
			const aJoker = isJoker(a);
			const bJoker = isJoker(b);
			if (aJoker && bJoker) return a.joker === b.joker ? 0 : a.joker === 'small' ? -1 : 1;
			if (aJoker) return 1;
			if (bJoker) return -1;
			const suitDiff = SUIT_ORDER[a.suit] - SUIT_ORDER[b.suit];
			if (suitDiff !== 0) return suitDiff;
			return RANK_ORDER[a.rank] - RANK_ORDER[b.rank];
		});
	}

	const sortedCards = $derived(sortHand(cards));
	const displayLabel = $derived(label ?? `Your Hand (${cards.length} cards)`);
</script>

<div class="w-full p-4">
	<div class="text-white font-semibold text-sm md:text-base mb-2 text-center">
		{displayLabel}
	</div>

	<!-- Mobile: horizontal scroll -->
	<div class="lg:hidden overflow-x-auto pb-4">
		<div class="flex gap-2 snap-x snap-mandatory min-w-min px-2">
			{#each sortedCards as card (card.id)}
				<div class="snap-start shrink-0">
					<TractorCard
						{card}
						selected={selectedIds.has(card.id)}
						{disabled}
						onclick={() => onSelect(card.id)}
					/>
				</div>
			{/each}
		</div>
	</div>

	<!-- Desktop: fan layout -->
	<div class="hidden lg:flex justify-center -space-x-12 px-4">
		{#each sortedCards as card (card.id)}
			<div class="transition-all duration-200 hover:scale-105 hover:z-10">
				<TractorCard
					{card}
					selected={selectedIds.has(card.id)}
					{disabled}
					onclick={() => onSelect(card.id)}
				/>
			</div>
		{/each}
	</div>
</div>
