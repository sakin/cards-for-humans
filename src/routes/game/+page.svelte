<script lang="ts">
	import { createGameClient } from '$lib/stores/gameClient.svelte.js';

	const { state, moves } = createGameClient();
</script>

{#if state === null}
	<p>Loading game...</p>
{:else}
	<p>Count: {state.G.count}</p>
	<button onclick={() => moves.increment()}>Increment</button>
	<p>Turn: {state.ctx.turn} | Player: {state.ctx.currentPlayer}</p>
{/if}
