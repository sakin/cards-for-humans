<script lang="ts">
	import { createGameClient } from '$lib/stores/gameClient.svelte.js';
	import type { PageData } from './$types.js';

	let { data }: { data: PageData } = $props();

	const { state, moves } = createGameClient(data.game);

	const _ = moves; // moves will be used by game-specific UI components
</script>

{#if state === null}
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
