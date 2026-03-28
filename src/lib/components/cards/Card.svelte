<script lang="ts">
	import type { StandardCard } from '$lib/shared/cards.js';
	import { getSuitSymbol, getSuitColor, getRankDisplay } from '$lib/utils/cardDisplay.js';

	interface Props {
		card: StandardCard;
		selected?: boolean;
		disabled?: boolean;
		size?: 'sm' | 'md' | 'lg';
		onclick?: () => void;
	}

	let { card, selected = false, disabled = false, size = 'md', onclick }: Props = $props();

	const suitSymbol = $derived(getSuitSymbol(card.suit));
	const suitColor = $derived(getSuitColor(card.suit));
	const rankDisplay = $derived(getRankDisplay(card.rank));

	const sizeClasses = $derived(
		size === 'sm'
			? 'w-[50px] h-[70px] text-xs'
			: size === 'lg'
				? 'w-[80px] h-[112px] text-lg'
				: 'w-[60px] h-[84px] md:w-[70px] md:h-[98px] lg:w-[80px] lg:h-[112px] text-sm md:text-base'
	);
</script>

<button
	type="button"
	class="
		{sizeClasses}
		relative
		rounded-lg
		bg-white
		border-2
		border-gray-300
		shadow-md
		transition-all
		duration-200
		{selected ? 'ring-4 ring-blue-500 -translate-y-2 shadow-xl border-blue-400' : ''}
		{disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg cursor-pointer'}
	"
	{disabled}
	{onclick}
>
	<div class="absolute top-1 left-1 {suitColor} font-bold leading-none">
		<div>{rankDisplay}</div>
		<div class="text-lg md:text-xl lg:text-2xl">{suitSymbol}</div>
	</div>

	<div class="flex items-center justify-center h-full {suitColor} font-bold text-xl md:text-2xl lg:text-3xl">
		{suitSymbol}
	</div>

	<div class="absolute bottom-1 right-1 {suitColor} font-bold leading-none rotate-180">
		<div>{rankDisplay}</div>
		<div class="text-lg md:text-xl lg:text-2xl">{suitSymbol}</div>
	</div>
</button>
