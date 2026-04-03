<script lang="ts">
	import type { Suit } from '$lib/shared/cards.js';
	import { getSuitSymbol, getSuitColor } from '$lib/utils/cardDisplay.js';

	interface Props {
		phase: string;
		isPlayerTurn: boolean;
		isPlayerBanker: boolean;
		kittyTaken: boolean;
		selectedCount: number;
		trickLedCount: number; // 0 when no trick in progress
		onDeclareTrump: (suit: Suit) => void;
		onTakeKitty: () => void;
		onBuryCards: () => void;
		onLeadTrick: () => void;
		onFollowTrick: () => void;
		onClear: () => void;
	}

	let {
		phase,
		isPlayerTurn,
		isPlayerBanker,
		kittyTaken,
		selectedCount,
		trickLedCount,
		onDeclareTrump,
		onTakeKitty,
		onBuryCards,
		onLeadTrick,
		onFollowTrick,
		onClear
	}: Props = $props();

	const suits: Suit[] = ['clubs', 'diamonds', 'hearts', 'spades'];

	const canBury = $derived(kittyTaken && selectedCount === 8);
	const canLead = $derived(selectedCount > 0);
	const canFollow = $derived(trickLedCount > 0 && selectedCount === trickLedCount);

	const btnBase = 'px-4 py-2 font-semibold rounded-lg shadow transition-all active:scale-95 text-sm';
	const btnPrimary = `${btnBase} bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed`;
	const btnSecondary = `${btnBase} bg-white/20 text-white hover:bg-white/30 disabled:opacity-40 disabled:cursor-not-allowed`;
</script>

<div class="fixed bottom-0 left-0 right-0 lg:static bg-black/60 backdrop-blur-sm border-t border-white/10 p-3">
	{#if phase === 'declaration' && isPlayerTurn}
		<div class="flex flex-col gap-2 items-center">
			<div class="text-white/70 text-xs">Declare trump suit:</div>
			<div class="flex gap-2 justify-center">
				{#each suits as suit}
					<button
						type="button"
						class="{btnBase} bg-white text-gray-900 hover:scale-105 font-bold text-base px-4 py-2"
						onclick={() => onDeclareTrump(suit)}
					>
						<span class={getSuitColor(suit)}>{getSuitSymbol(suit)}</span>
					</button>
				{/each}
			</div>
		</div>
	{:else if phase === 'declaration'}
		<div class="text-center text-white/50 text-sm">Waiting for trump declaration…</div>

	{:else if phase === 'kitty' && isPlayerBanker && !kittyTaken}
		<div class="flex justify-center">
			<button type="button" class={btnPrimary} onclick={onTakeKitty}>
				Take Kitty (8 cards)
			</button>
		</div>
	{:else if phase === 'kitty' && isPlayerBanker && kittyTaken}
		<div class="flex gap-2 justify-center items-center">
			<span class="text-white/70 text-sm">{selectedCount}/8 selected</span>
			<button type="button" class={btnPrimary} disabled={!canBury} onclick={onBuryCards}>
				Bury 8 Cards
			</button>
			{#if selectedCount > 0}
				<button type="button" class={btnSecondary} onclick={onClear}>Clear</button>
			{/if}
		</div>
	{:else if phase === 'kitty'}
		<div class="text-center text-white/50 text-sm">Waiting for banker to set kitty…</div>

	{:else if phase === 'play' && isPlayerTurn && trickLedCount === 0}
		<!-- Leading a trick -->
		<div class="flex gap-2 justify-center items-center">
			<span class="text-white/70 text-sm">{selectedCount} selected</span>
			<button type="button" class={btnPrimary} disabled={!canLead} onclick={onLeadTrick}>
				Lead Trick
			</button>
			{#if selectedCount > 0}
				<button type="button" class={btnSecondary} onclick={onClear}>Clear</button>
			{/if}
		</div>
	{:else if phase === 'play' && isPlayerTurn && trickLedCount > 0}
		<!-- Following a trick -->
		<div class="flex gap-2 justify-center items-center">
			<span class="text-white/70 text-sm">{selectedCount}/{trickLedCount} selected</span>
			<button type="button" class={btnPrimary} disabled={!canFollow} onclick={onFollowTrick}>
				Follow Trick
			</button>
			{#if selectedCount > 0}
				<button type="button" class={btnSecondary} onclick={onClear}>Clear</button>
			{/if}
		</div>
	{:else if phase === 'play'}
		<div class="text-center text-white/50 text-sm">Waiting for other players…</div>
	{/if}
</div>
