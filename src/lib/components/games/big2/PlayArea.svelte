<script lang="ts">
	import type { LastPlay } from '$lib/games/big2/types.js';
	import Card from '$lib/components/cards/Card.svelte';
	import PlayTypeLabel from './PlayTypeLabel.svelte';

	interface Props {
		lastPlay: LastPlay | null;
	}

	let { lastPlay }: Props = $props();
</script>

<div
	class="
		w-full
		max-w-4xl
		mx-auto
		p-4
		md:p-6
		lg:p-8
		bg-gradient-to-br
		from-green-100
		to-green-200
		border-4
		border-dashed
		border-green-800/30
		rounded-2xl
		min-h-[200px]
		md:min-h-[240px]
		flex
		flex-col
		items-center
		justify-center
		gap-4
	"
>
	{#if lastPlay === null}
		<div class="text-green-800 font-semibold text-base md:text-lg text-center">
			Table is clear - Lead any cards
		</div>
	{:else}
		<div class="text-green-800 text-sm md:text-base">
			Player {parseInt(lastPlay.playerID) + 1} played:
		</div>
		<div class="flex gap-2 flex-wrap justify-center">
			{#each lastPlay.cards as card (card.id)}
				<Card {card} disabled />
			{/each}
		</div>
		<PlayTypeLabel type={lastPlay.type} />
	{/if}
</div>
