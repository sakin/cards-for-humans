<script lang="ts">
	import { createGameClient } from '$lib/stores/gameClient.svelte.js';
	import Big2Game from '$lib/components/games/big2/Big2Game.svelte';
	import type { PageData } from './$types.js';

	let { data }: { data: PageData } = $props();

	const client = $derived(createGameClient(data.game as any));
	const state = $derived(client.state);
	const moves = $derived(client.moves);
	const reset = $derived(client.reset);
</script>

{#if data.gameId === 'big2'}
	<Big2Game gameState={state as any} moves={moves as any} onReset={reset} />
{:else if state === null}
	<p>Loading {data.gameId}…</p>
{:else}
	<header>
		<h1>{data.gameId}</h1>
		<dl>
			<dt>Turn</dt><dd>{state.ctx.turn}</dd>
			<dt>Phase</dt><dd>{state.ctx.phase ?? '—'}</dd>
			<dt>Current player</dt><dd>{state.ctx.currentPlayer}</dd>
		</dl>
	</header>

	<section>
		<h2>Game state</h2>
		<pre>{JSON.stringify(state.G, null, 2)}</pre>
	</section>
{/if}
