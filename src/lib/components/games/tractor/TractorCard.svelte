<script lang="ts">
	import type { Card } from '$lib/shared/cards.js';
	import { isJoker } from '$lib/shared/cards.js';
	import { getSuitSymbol, getSuitColor } from '$lib/utils/cardDisplay.js';

	interface Props {
		card: Card;
		selected?: boolean;
		disabled?: boolean;
		onclick?: () => void;
	}

	let { card, selected = false, disabled = false, onclick }: Props = $props();

	const baseClasses = `
		w-[60px] h-[84px] md:w-[70px] md:h-[98px] lg:w-[80px] lg:h-[112px]
		relative rounded-lg bg-white border-2 border-gray-300 shadow-md
		transition-all duration-200
	`;
	const selectedClasses = 'ring-4 ring-blue-500 -translate-y-2 shadow-xl border-blue-400';
	const disabledClasses = 'opacity-50 cursor-not-allowed';
	const enabledClasses = 'hover:shadow-lg cursor-pointer';
</script>

{#if isJoker(card)}
	<button
		type="button"
		class="{baseClasses} {selected ? selectedClasses : ''} {disabled ? disabledClasses : enabledClasses}"
		{disabled}
		{onclick}
	>
		<div class="absolute top-1 left-1 font-bold leading-none text-xs {card.joker === 'big' ? 'text-red-600' : 'text-gray-700'}">
			{card.joker === 'big' ? 'B' : 'S'}
		</div>
		<div class="flex flex-col items-center justify-center h-full gap-0.5">
			<div class="text-xl {card.joker === 'big' ? 'text-red-600' : 'text-gray-700'}">
				{card.joker === 'big' ? '★' : '☆'}
			</div>
			<div class="text-xs font-bold {card.joker === 'big' ? 'text-red-600' : 'text-gray-700'}">JKR</div>
		</div>
		<div class="absolute bottom-1 right-1 font-bold leading-none text-xs rotate-180 {card.joker === 'big' ? 'text-red-600' : 'text-gray-700'}">
			{card.joker === 'big' ? 'B' : 'S'}
		</div>
	</button>
{:else}
	<button
		type="button"
		class="{baseClasses} {selected ? selectedClasses : ''} {disabled ? disabledClasses : enabledClasses}"
		{disabled}
		{onclick}
	>
		<div class="absolute top-1 left-1 {getSuitColor(card.suit)} font-bold leading-none">
			<div class="text-sm md:text-base">{card.rank}</div>
			<div class="text-lg md:text-xl lg:text-2xl">{getSuitSymbol(card.suit)}</div>
		</div>
		<div class="flex items-center justify-center h-full {getSuitColor(card.suit)} font-bold text-xl md:text-2xl lg:text-3xl">
			{getSuitSymbol(card.suit)}
		</div>
		<div class="absolute bottom-1 right-1 {getSuitColor(card.suit)} font-bold leading-none rotate-180">
			<div class="text-sm md:text-base">{card.rank}</div>
			<div class="text-lg md:text-xl lg:text-2xl">{getSuitSymbol(card.suit)}</div>
		</div>
	</button>
{/if}
