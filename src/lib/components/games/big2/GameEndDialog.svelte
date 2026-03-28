<script lang="ts">
	import { Dialog } from 'bits-ui';

	interface Props {
		open: boolean;
		winner: string;
		onNewGame: () => void;
	}

	let { open, winner, onNewGame }: Props = $props();

	const isPlayerWinner = $derived(winner === '0');
	const winnerName = $derived(`Player ${parseInt(winner) + 1}`);
</script>

<Dialog.Root {open}>
	<Dialog.Portal>
		<Dialog.Overlay class="fixed inset-0 bg-black/50 z-50" />
		<Dialog.Content
			class="
				fixed
				left-1/2
				top-1/2
				z-50
				-translate-x-1/2
				-translate-y-1/2
				w-full
				max-w-md
				bg-white
				p-6
				rounded-2xl
				shadow-2xl
			"
		>
			<Dialog.Title class="text-2xl md:text-3xl font-bold text-center mb-4">
				{isPlayerWinner ? '🎉 You Win! 🎉' : 'Game Over'}
			</Dialog.Title>

			<Dialog.Description class="text-center text-gray-700 mb-6 text-lg">
				{isPlayerWinner ? 'Congratulations!' : `${winnerName} wins!`}
			</Dialog.Description>

			<div class="flex justify-center">
				<button
					type="button"
					class="
						px-8
						py-3
						bg-blue-600
						text-white
						font-semibold
						rounded-lg
						shadow-md
						hover:bg-blue-700
						active:scale-95
						transition-all
					"
					onclick={onNewGame}
				>
					New Game
				</button>
			</div>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
