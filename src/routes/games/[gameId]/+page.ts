import { games } from '$lib/games/registry.js';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types.js';

export const ssr = false;

export const load: PageLoad = ({ params }) => {
	const { gameId } = params;
	if (!(gameId in games)) error(404, `Game "${gameId}" not found`);
	return { gameId, game: games[gameId] };
};
