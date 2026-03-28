<script lang="ts">
	import type { PlayType } from '$lib/games/big2/types.js';

	interface Props {
		type: PlayType;
	}

	let { type }: Props = $props();

	const labels: Record<PlayType, string> = {
		single: 'Single',
		pair: 'Pair',
		triple: 'Triple',
		straight: 'Straight',
		flush: 'Flush',
		fullHouse: 'Full House',
		fourOfAKind: 'Four of a Kind',
		straightFlush: 'Straight Flush'
	};

	const label = $derived(labels[type]);
</script>

<span class="font-semibold text-sm md:text-base">
	{label}
</span>
