<script lang="ts">
	interface Props {
		playerID: string;
		cardCount: number;
		position: 'top' | 'left' | 'right';
		isCurrentTurn: boolean;
	}

	let { playerID, cardCount, position, isCurrentTurn }: Props = $props();

	const playerName = $derived(`Player ${parseInt(playerID) + 1}`);
</script>

<div
	class="
		flex
		flex-col
		items-center
		gap-2
		p-3
		bg-white/10
		backdrop-blur-sm
		rounded-lg
		border-2
		{isCurrentTurn ? 'border-yellow-400 ring-4 ring-yellow-400/50 animate-pulse' : 'border-white/20'}
		transition-all
		duration-300
	"
>
	<div class="text-white font-semibold text-sm md:text-base">
		{playerName}
	</div>
	<div class="text-white/80 text-xs md:text-sm">
		{cardCount} {cardCount === 1 ? 'card' : 'cards'}
	</div>
</div>
