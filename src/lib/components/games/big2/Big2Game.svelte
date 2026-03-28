<script lang="ts">
	import type { Big2State } from '$lib/games/big2/types.js';
	import type { StandardCard } from '$lib/shared/cards.js';
	import PlayerHand from './PlayerHand.svelte';
	import PlayArea from './PlayArea.svelte';
	import OpponentIndicator from './OpponentIndicator.svelte';
	import ActionBar from './ActionBar.svelte';
	import GameEndDialog from './GameEndDialog.svelte';
	import { validateSelection, canBeatLastPlay } from './utils.js';
	import { makeAIMove } from './ai.js';

	interface Props {
		gameState: { G: Big2State; ctx: any } | null;
		moves: { playCards: (cardIds: string[]) => void; pass: () => void };
		onReset?: () => void;
	}

	let { gameState, moves, onReset }: Props = $props();

	// Local reactive state
	let selectedCardIds: Set<string> = $state(new Set());
	let validationMessage: string = $state('');

	// Derived gameState
	const playerHand = $derived<StandardCard[]>(
		gameState?.G.hands['0'] ?? []
	);
	const isPlayerTurn = $derived(gameState?.ctx.currentPlayer === '0');
	const gameEnded = $derived(gameState?.ctx.gameover !== undefined);
	const winner = $derived<string | undefined>(gameState?.ctx.gameover?.winner);
	const canPass = $derived(
		isPlayerTurn &&
		gameState?.G.lastPlay !== null &&
		gameState?.G.lastPlay.playerID !== '0'
	);

	// AI effect - watch for AI turns
	$effect(() => {
		if (!gameState || gameEnded) return;

		const currentPlayer = gameState.ctx.currentPlayer;
		if (currentPlayer !== '0') {
			// AI turn - make move after 1 second
			const timeoutId = setTimeout(() => {
				const aiHand = gameState.G.hands[currentPlayer];
				const move = makeAIMove(currentPlayer, aiHand, gameState.G.lastPlay);

				if (move === 'pass') {
					moves.pass();
				} else {
					moves.playCards(move);
				}
			}, 1000);

			return () => clearTimeout(timeoutId);
		}
	});

	// Handlers
	function handleSelect(cardId: string) {
		if (!isPlayerTurn) return;

		const newSelected = new Set(selectedCardIds);
		if (newSelected.has(cardId)) {
			newSelected.delete(cardId);
		} else {
			newSelected.add(cardId);
		}
		selectedCardIds = newSelected;
		validationMessage = '';
	}

	function handlePlay() {
		if (!isPlayerTurn || selectedCardIds.size === 0) return;

		const selectedCards = playerHand.filter((c) => selectedCardIds.has(c.id));
		const validation = validateSelection(selectedCards);

		if (!validation.valid) {
			validationMessage = validation.message;
			return;
		}

		const beatCheck = canBeatLastPlay(selectedCards, gameState?.G.lastPlay ?? null);
		if (!beatCheck.can) {
			validationMessage = beatCheck.message;
			return;
		}

		// Valid play - submit move
		moves.playCards(Array.from(selectedCardIds));
		selectedCardIds = new Set();
		validationMessage = '';
	}

	function handlePass() {
		if (!canPass) return;
		moves.pass();
		selectedCardIds = new Set();
		validationMessage = '';
	}

	function handleClear() {
		selectedCardIds = new Set();
		validationMessage = '';
	}

	function handleNewGame() {
		onReset?.();
		selectedCardIds = new Set();
		validationMessage = '';
	}

	// Get opponent data
	const opponents = $derived(() => {
		if (!gameState) return [];
		const playOrder = gameState.ctx.playOrder;
		return playOrder
			.filter((id: string) => id !== '0')
			.map((id: string) => ({
				playerID: id,
				cardCount: gameState.G.hands[id].length,
				isCurrentTurn: gameState.ctx.currentPlayer === id
			}));
	});
</script>

<div class="min-h-screen bg-gradient-to-br from-green-800 to-green-600 pb-24 lg:pb-0">
	{#if gameState}
		<!-- Mobile layout -->
		<div class="lg:hidden flex flex-col gap-4 p-4">
			<!-- Opponents -->
			<div class="flex gap-2 justify-around">
				{#each opponents() as opponent}
					<OpponentIndicator
						playerID={opponent.playerID}
						cardCount={opponent.cardCount}
						position="top"
						isCurrentTurn={opponent.isCurrentTurn}
					/>
				{/each}
			</div>

			<!-- Play Area -->
			<PlayArea lastPlay={gameState.G.lastPlay} />

			<!-- Validation Message -->
			{#if validationMessage}
				<div class="bg-red-500/90 text-white px-4 py-2 rounded-lg text-center text-sm">
					{validationMessage}
				</div>
			{/if}

			<!-- Player Hand -->
			<PlayerHand
				cards={playerHand}
				selectedIds={selectedCardIds}
				onSelect={handleSelect}
				disabled={!isPlayerTurn}
			/>
		</div>

		<!-- Desktop layout -->
		<div class="hidden lg:grid lg:grid-cols-3 lg:gap-6 lg:p-8 lg:max-w-7xl lg:mx-auto">
			<!-- Left opponent -->
			<div class="flex items-center justify-center">
				{#if opponents()[0]}
					<OpponentIndicator
						playerID={opponents()[0].playerID}
						cardCount={opponents()[0].cardCount}
						position="left"
						isCurrentTurn={opponents()[0].isCurrentTurn}
					/>
				{/if}
			</div>

			<!-- Center: Top opponent + Play Area -->
			<div class="flex flex-col gap-6">
				{#if opponents()[1]}
					<div class="flex justify-center">
						<OpponentIndicator
							playerID={opponents()[1].playerID}
							cardCount={opponents()[1].cardCount}
							position="top"
							isCurrentTurn={opponents()[1].isCurrentTurn}
						/>
					</div>
				{/if}

				<PlayArea lastPlay={gameState.G.lastPlay} />

				{#if validationMessage}
					<div class="bg-red-500/90 text-white px-4 py-3 rounded-lg text-center">
						{validationMessage}
					</div>
				{/if}
			</div>

			<!-- Right opponent -->
			<div class="flex items-center justify-center">
				{#if opponents()[2]}
					<OpponentIndicator
						playerID={opponents()[2].playerID}
						cardCount={opponents()[2].cardCount}
						position="right"
						isCurrentTurn={opponents()[2].isCurrentTurn}
					/>
				{/if}
			</div>

			<!-- Player Hand - spans all columns -->
			<div class="col-span-3">
				<PlayerHand
					cards={playerHand}
					selectedIds={selectedCardIds}
					onSelect={handleSelect}
					disabled={!isPlayerTurn}
				/>
			</div>
		</div>

		<!-- Action Bar -->
		<ActionBar
			canPlay={isPlayerTurn}
			{canPass}
			hasSelection={selectedCardIds.size > 0}
			onPlay={handlePlay}
			onPass={handlePass}
			onClear={handleClear}
		/>

		<!-- Game End Dialog -->
		{#if gameEnded && winner}
			<GameEndDialog
				open={true}
				{winner}
				onNewGame={handleNewGame}
			/>
		{/if}
	{:else}
		<div class="flex items-center justify-center min-h-screen text-white text-xl">
			Loading game...
		</div>
	{/if}
</div>
