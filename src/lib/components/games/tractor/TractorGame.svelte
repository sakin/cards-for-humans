<script lang="ts">
	import type { TractorState } from '$lib/games/tractor/types.js';
	import type { Card, Suit } from '$lib/shared/cards.js';
	import OpponentIndicator from '$lib/components/shared/OpponentIndicator.svelte';
	import GameEndDialog from '$lib/components/games/big2/GameEndDialog.svelte';
	import TractorPlayerHand from './TractorPlayerHand.svelte';
	import TrickArea from './TrickArea.svelte';
	import TractorActionBar from './TractorActionBar.svelte';
	import PhaseIndicator from './PhaseIndicator.svelte';
	import { makeAIDeclaration, makeAIBuryCards, makeAIPlayMove } from './ai.js';

	interface Props {
		gameState: { G: TractorState; ctx: any } | null;
		moves: {
			declareTrump: (suit: Suit) => void;
			takeKitty: () => void;
			buryCards: (cardIds: string[]) => void;
			leadTrick: (cardIds: string[]) => void;
			followTrick: (cardIds: string[]) => void;
		};
		onReset?: () => void;
	}

	let { gameState, moves, onReset }: Props = $props();

	const PLAYER_ID = '0';

	let selectedCardIds: Set<string> = $state(new Set());

	// Derived state
	const phase = $derived<string>(gameState?.ctx.phase ?? 'declaration');
	const currentPlayer = $derived<string>(gameState?.ctx.currentPlayer ?? PLAYER_ID);
	const isPlayerTurn = $derived(currentPlayer === PLAYER_ID);
	const playerHand = $derived<Card[]>(gameState?.G.hands[PLAYER_ID] ?? []);
	const isPlayerBanker = $derived(gameState?.G.banker === PLAYER_ID);
	const kittyTaken = $derived((gameState?.G.kitty.length ?? 0) === 0);
	const currentTrick = $derived(gameState?.G.currentTrick ?? null);
	const trickLedCount = $derived(currentTrick?.led.length ?? 0);
	const gameEnded = $derived(gameState?.ctx.gameover !== undefined);
	const winner = $derived<string | undefined>(gameState?.ctx.gameover?.winner);
	const playOrder = $derived<string[]>(gameState?.ctx.playOrder ?? []);

	const opponents = $derived(() => {
		if (!gameState) return [];
		return playOrder
			.filter((id: string) => id !== PLAYER_ID)
			.map((id: string) => ({
				playerID: id,
				cardCount: gameState.G.hands[id].length,
				isCurrentTurn: currentPlayer === id
			}));
	});

	// AI effect
	$effect(() => {
		if (!gameState || gameEnded || isPlayerTurn) return;

		if (phase === 'declaration') {
			const t = setTimeout(() => moves.declareTrump(makeAIDeclaration()), 800);
			return () => clearTimeout(t);
		}

		if (phase === 'kitty') {
			const G = gameState.G;
			if (G.kitty.length > 0) {
				// AI banker needs to take kitty first
				const t = setTimeout(() => moves.takeKitty(), 500);
				return () => clearTimeout(t);
			} else if (G.buried.length === 0) {
				// Kitty taken, now bury
				const hand = G.hands[currentPlayer] as Card[];
				const t = setTimeout(() => moves.buryCards(makeAIBuryCards(hand)), 500);
				return () => clearTimeout(t);
			}
			return;
		}

		if (phase === 'play') {
			const hand = gameState.G.hands[currentPlayer] as Card[];
			const { action, cardIds } = makeAIPlayMove(currentPlayer, hand, gameState.G);
			const t = setTimeout(() => {
				if (action === 'leadTrick') moves.leadTrick(cardIds);
				else moves.followTrick(cardIds);
			}, 1000);
			return () => clearTimeout(t);
		}
	});

	function handleSelect(cardId: string) {
		if (!isPlayerTurn && !(phase === 'kitty' && isPlayerBanker)) return;
		const next = new Set(selectedCardIds);
		if (next.has(cardId)) next.delete(cardId);
		else next.add(cardId);
		selectedCardIds = next;
	}

	function handleDeclareTrump(suit: Suit) {
		moves.declareTrump(suit);
	}

	function handleTakeKitty() {
		moves.takeKitty();
		selectedCardIds = new Set();
	}

	function handleBuryCards() {
		moves.buryCards(Array.from(selectedCardIds));
		selectedCardIds = new Set();
	}

	function handleLeadTrick() {
		if (selectedCardIds.size === 0) return;
		moves.leadTrick(Array.from(selectedCardIds));
		selectedCardIds = new Set();
	}

	function handleFollowTrick() {
		if (selectedCardIds.size !== trickLedCount) return;
		moves.followTrick(Array.from(selectedCardIds));
		selectedCardIds = new Set();
	}

	function handleClear() {
		selectedCardIds = new Set();
	}

	function handleNewGame() {
		onReset?.();
		selectedCardIds = new Set();
	}

	// Card selection is enabled for: player's turn in play phase, or banker in kitty phase
	const handDisabled = $derived(
		!(isPlayerTurn || (phase === 'kitty' && isPlayerBanker && kittyTaken))
	);

	// Kitty-phase hand label for banker (shows expanded count after taking kitty)
	const handLabel = $derived(
		phase === 'kitty' && isPlayerBanker && !kittyTaken
			? `Your Hand (${playerHand.length} cards — take kitty to see all)`
			: undefined
	);
</script>

<div class="min-h-screen bg-gradient-to-br from-green-800 to-green-600 pb-24 lg:pb-0">
	{#if gameState}
		<!-- Phase indicator -->
		<div class="p-3">
			<PhaseIndicator
				{phase}
				trumpSuit={gameState.G.trumpSuit}
				trumpRank={gameState.G.trumpRank}
				banker={gameState.G.banker}
				bankerTeam={gameState.G.bankerTeam}
				playerID={PLAYER_ID}
			/>
		</div>

		<!-- Mobile layout -->
		<div class="lg:hidden flex flex-col gap-4 p-4">
			<!-- Opponents -->
			<div class="flex gap-2 justify-around">
				{#each opponents() as opp}
					<OpponentIndicator
						playerID={opp.playerID}
						cardCount={opp.cardCount}
						position="top"
						isCurrentTurn={opp.isCurrentTurn}
					/>
				{/each}
			</div>

			<!-- Trick area (play phase only) -->
			{#if phase === 'play'}
				<TrickArea
					{currentTrick}
					{playOrder}
					tricksWon={gameState.G.tricksWon}
				/>
			{/if}

			<!-- Player hand -->
			<TractorPlayerHand
				cards={playerHand}
				selectedIds={selectedCardIds}
				onSelect={handleSelect}
				disabled={handDisabled}
				label={handLabel}
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

			<!-- Center: top opponent + trick/play area -->
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

				{#if phase === 'play'}
					<TrickArea
						{currentTrick}
						{playOrder}
						tricksWon={gameState.G.tricksWon}
					/>
				{:else}
					<div class="bg-black/20 rounded-xl p-6 text-center text-white/50 min-h-[120px] flex items-center justify-center">
						{#if phase === 'declaration'}
							Select a trump suit below
						{:else if phase === 'kitty'}
							{isPlayerBanker ? (kittyTaken ? 'Select 8 cards to bury' : 'Take the kitty') : 'Waiting for banker…'}
						{/if}
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

			<!-- Player hand - spans all columns -->
			<div class="col-span-3">
				<TractorPlayerHand
					cards={playerHand}
					selectedIds={selectedCardIds}
					onSelect={handleSelect}
					disabled={handDisabled}
					label={handLabel}
				/>
			</div>
		</div>

		<!-- Action bar -->
		<TractorActionBar
			{phase}
			{isPlayerTurn}
			{isPlayerBanker}
			{kittyTaken}
			selectedCount={selectedCardIds.size}
			{trickLedCount}
			onDeclareTrump={handleDeclareTrump}
			onTakeKitty={handleTakeKitty}
			onBuryCards={handleBuryCards}
			onLeadTrick={handleLeadTrick}
			onFollowTrick={handleFollowTrick}
			onClear={handleClear}
		/>

		<!-- Game end dialog -->
		{#if gameEnded && winner}
			<GameEndDialog open={true} {winner} onNewGame={handleNewGame} />
		{/if}
	{:else}
		<div class="flex items-center justify-center min-h-screen text-white text-xl">
			Loading game…
		</div>
	{/if}
</div>
