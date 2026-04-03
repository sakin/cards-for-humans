<script lang="ts">
	import type { Suit, Rank } from '$lib/shared/cards.js';
	import { getSuitSymbol, getSuitColor } from '$lib/utils/cardDisplay.js';

	interface Props {
		phase: string;
		trumpSuit: Suit | null;
		trumpRank: Rank;
		banker: string;
		bankerTeam: [string, string];
		playerID: string;
	}

	let { phase, trumpSuit, trumpRank, banker, bankerTeam, playerID }: Props = $props();

	const phaseLabel: Record<string, string> = {
		declaration: 'Declaration',
		kitty: 'Kitty',
		play: 'Play'
	};

	const isOnBankerTeam = $derived((bankerTeam as string[]).includes(playerID));
	const bankerName = $derived(`Player ${parseInt(banker) + 1}`);
	const partnerID = $derived(bankerTeam[0] === playerID ? bankerTeam[1] : bankerTeam[0]);
	const partnerName = $derived(`Player ${parseInt(partnerID) + 1}`);
</script>

<div class="flex flex-wrap gap-3 justify-center items-center px-4 py-2 bg-black/20 rounded-lg text-sm">
	<div class="text-white/70">
		Phase: <span class="text-yellow-300 font-semibold">{phaseLabel[phase] ?? phase}</span>
	</div>

	{#if trumpSuit}
		<div class="text-white/70">
			Trump: <span class="font-bold {getSuitColor(trumpSuit)} bg-white/90 px-1.5 py-0.5 rounded">
				{getSuitSymbol(trumpSuit)} {trumpSuit}
			</span>
		</div>
	{:else}
		<div class="text-white/50">Trump: not declared</div>
	{/if}

	<div class="text-white/70">
		Rank: <span class="text-white font-semibold">{trumpRank}</span>
	</div>

	<div class="text-white/70">
		Banker: <span class="text-white font-semibold">{bankerName}</span>
	</div>

	{#if phase !== 'declaration'}
		<div class="{isOnBankerTeam ? 'text-green-300' : 'text-orange-300'} font-semibold">
			{isOnBankerTeam ? `Your team (w/ ${partnerName})` : 'Opposing team'}
		</div>
	{/if}
</div>
