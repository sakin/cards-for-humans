<script lang="ts">
	import type { StandardCard } from '$lib/shared/cards.js';
	import Card from '$lib/components/cards/Card.svelte';
	import { sortCardsForDisplay } from '$lib/utils/cardDisplay.js';

	interface Props {
		cards: StandardCard[];
		selectedIds: Set<string>;
		onSelect: (cardId: string) => void;
		disabled?: boolean;
	}

	let { cards, selectedIds, onSelect, disabled = false }: Props = $props();

	const sortedCards = $derived(sortCardsForDisplay(cards));
</script>

<div class="w-full p-4">
	<div class="text-white font-semibold text-sm md:text-base mb-2 text-center">
		Your Hand ({cards.length} cards)
	</div>

	<!-- Mobile: horizontal scroll with snap -->
	<div class="lg:hidden overflow-x-auto pb-4">
		<div class="flex gap-2 snap-x snap-mandatory min-w-min px-2">
			{#each sortedCards as card (card.id)}
				<div class="snap-start shrink-0">
					<Card
						{card}
						selected={selectedIds.has(card.id)}
						{disabled}
						onclick={() => onSelect(card.id)}
					/>
				</div>
			{/each}
		</div>
	</div>

	<!-- Desktop: fan layout with overlap -->
	<div class="hidden lg:flex justify-center -space-x-12 px-4">
		{#each sortedCards as card (card.id)}
			<div class="transition-all duration-200 hover:scale-105 hover:z-10">
				<Card
					{card}
					selected={selectedIds.has(card.id)}
					{disabled}
					onclick={() => onSelect(card.id)}
				/>
			</div>
		{/each}
	</div>
</div>
