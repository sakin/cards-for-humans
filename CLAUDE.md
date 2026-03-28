# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Cards for Humans is a SvelteKit application for playing card games using boardgame.io. The project implements multiple card games (Big 2, Tractor) with a shared game architecture and uses Svelte 5's runes for reactive state management.

## Development Commands

### Running the Application
```bash
npm run dev              # Start development server
npm run dev -- --open    # Start dev server and open browser
npm run build            # Create production build
npm run preview          # Preview production build
```

### Testing
```bash
npm run test             # Run all tests (unit + e2e)
npm run test:unit        # Run unit tests with Vitest
npm run test:e2e         # Run Playwright e2e tests
npm run check            # Type check with svelte-check
npm run check:watch      # Type check in watch mode
```

### Code Quality
```bash
npm run lint             # Run Prettier and ESLint checks
npm run format           # Auto-format with Prettier
```

## Architecture

### Multi-Game System

The project uses a registry pattern to support multiple card games:

- **Game Registry** (`src/lib/games/registry.ts`): Central registry mapping game IDs to boardgame.io Game objects
- **Game Implementations**: Each game (Big 2, Tractor) is in its own directory under `src/lib/games/[gameId]/`
- **Shared Utilities** (`src/lib/shared/cards.ts`): Common card types (StandardCard, Joker) and deck creation functions

Each game follows this structure:
```
src/lib/games/[gameId]/
  ├── [GameId].ts         # Main Game object (boardgame.io)
  ├── [GameId].spec.ts    # Unit tests
  └── types.ts            # Game-specific state types
```

### boardgame.io Integration

- Games are defined as boardgame.io `Game` objects with `setup`, `moves`, `turn`, and `endIf` properties
- The `createGameClient` utility (`src/lib/stores/gameClient.svelte.ts`) wraps boardgame.io's Client with Svelte 5 runes (`$state`, `$effect`)
- Client state is reactive and automatically updates components when game state changes

### Testing Strategy

The project uses a dual-testing approach configured in `vite.config.ts`:

1. **Server/Node Tests**: Regular `.spec.ts` and `.test.ts` files run in Node environment (game logic, utilities)
2. **Client/Browser Tests**: `.svelte.spec.ts` and `.svelte.test.ts` files run in Playwright browser (Svelte components)
3. **E2E Tests**: `.e2e.ts` files run with Playwright against built preview server

All unit tests enforce assertions with `expect.requireAssertions: true`.

### Routing

- `/game` - Legacy/demo game page
- `/games/[gameId]` - Dynamic route for playing specific games from registry
- Game pages load via `+page.ts` using `games` registry and pass game to `createGameClient`

## Key Patterns

### Card Types

Two deck types are supported:
- `createStandardDeck()`: 52-card deck for games like Big 2
- `createTractorDeck()`: Double deck (108 cards) with jokers for Tractor

Cards have unique IDs for tracking in game state (e.g., `"diamonds-A"`, `"spades-3-1"`).

### Game State Management

Games use boardgame.io's immutable state updates:
- State is in `G` object
- Moves receive `{ G, ctx, events }` and mutate `G` directly
- Return `INVALID_MOVE` from moves to reject invalid plays
- Use `events.endTurn()` to progress turns

### Adding a New Game

1. Create `src/lib/games/[gameId]/[GameId].ts` with boardgame.io Game object
2. Define state types in `types.ts`
3. Add tests in `[GameId].spec.ts`
4. Register in `src/lib/games/registry.ts`
5. Game will be accessible at `/games/[gameId]`

## Technology Stack

- **Framework**: SvelteKit with Svelte 5 (runes)
- **Game Engine**: boardgame.io
- **Testing**: Vitest (unit), Playwright (e2e, browser tests)
- **Styling**: Tailwind CSS 4
- **Type Checking**: TypeScript with strict mode
- **Linting**: ESLint with typescript-eslint and eslint-plugin-svelte
