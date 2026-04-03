<script lang="ts">
	import type { Trick } from '$lib/games/tractor/types.js';
	import TractorCard from './TractorCard.svelte';

	interface Props {
		currentTrick: Trick | null;
		playOrder: string[];
		tricksWon: Record<string, number>;
	}

	let { currentTrick, playOrder, tricksWon }: Props = $props();

	function playerName(id: string): string {
		return `P${parseInt(id) + 1}`;
	}

	function totalTricks(id: string): number {
		return tricksWon[id] ?? 0;
	}
</script>

<div class="bg-black/20 rounded-xl p-4 min-h-[160px] flex flex-col gap-3">
	<div class="text-white/70 text-xs uppercase tracking-wider text-center">Current Trick</div>

	{#if currentTrick}
		<div class="flex flex-wrap gap-4 justify-center">
			{#each playOrder as playerID}
				<div class="flex flex-col items-center gap-1">
					<div class="text-white/60 text-xs">
						{playerName(playerID)}
						{playerID === currentTrick.leader ? ' (led)' : ''}
					</div>
					{#if currentTrick.played[playerID]}
						<div class="flex gap-1">
							{#each currentTrick.played[playerID] as card (card.id)}
								<TractorCard {card} disabled={true} />
							{/each}
						</div>
					{:else}
						<div class="w-[60px] h-[84px] rounded-lg border-2 border-dashed border-white/20 flex items-center justify-center">
							<span class="text-white/30 text-xs">—</span>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{:else}
		<div class="flex-1 flex flex-col items-center justify-center gap-2">
			<div class="text-white/40 text-sm">Waiting for lead…</div>
			<div class="flex gap-4 flex-wrap justify-center">
				{#each playOrder as playerID}
					<div class="text-white/50 text-xs">
						{playerName(playerID)}: {totalTricks(playerID)} tricks
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>
