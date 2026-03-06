# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Multiplayer Jeopardy-style game for medical faculty/fellows to practice CPT codes and ICD-10 diagnosis codes (pain management focus). One host projects the game board; up to 20 players join on their own devices to buzz in and answer.

## Commands

```bash
npm run dev      # Start dev server with hot reload (uses tsx to run server.ts directly)
npm run build    # Build for production (next build + compile server.ts)
npm run start    # Run production server
npm run lint     # ESLint
```

The dev server runs on `http://localhost:3000`. Players connect via the host's LAN IP (printed on startup).

## Architecture

**Next.js 14 (App Router) + custom Node.js server + Socket.IO** for real-time multiplayer.

- `server.ts` — Custom Node.js entry point wrapping Next.js with Socket.IO
- `tsconfig.server.json` — Separate tsconfig for compiling server.ts to CommonJS for production

### Server-side (src/server/)
- `GameManager.ts` — Manages game rooms (Map<gameCode, GameRoom>)
- `GameRoom.ts` — State machine per game: lobby → board → question → buzz_open → buzz_locked → answer_reveal → game_over
- `socketHandlers.ts` — All Socket.IO event handlers implementing the host/player/server protocol

### Client-side
- `src/stores/` — Zustand stores (`hostStore.ts`, `playerStore.ts`)
- `src/hooks/` — `useSocket` (Socket.IO connection), `useSound` (Web Audio API), `useAnimatedScore`
- `src/lib/socket.ts` — Socket.IO client singleton
- `src/lib/sounds.ts` — Synthesized sound effects via Web Audio API (no audio files)

### Routes
- `/` — Player join page (enter game code + name)
- `/host` — Host creates a new game
- `/host/[gameId]` — Host game board (projected on screen)
- `/play/[gameId]` — Player view on their device

### Data
- `src/data/questions.ts` — Question bank (CPT/ICD-10 codes with mnemonics and facts)
- `src/data/types.ts` — Shared TypeScript types for game state, questions, socket events

## Socket.IO Event Protocol

Host → Server: `host:create-game`, `host:start-game`, `host:select-cell`, `host:judge-answer`, `host:reveal-answer`, `host:return-to-board`, `host:skip-question`, `host:end-game`

Player → Server: `player:join`, `player:buzz`, `player:daily-double-wager`

Server → All: `game:phase-change`, `game:scores-updated`, `game:buzz-open`, `room:cell-revealed`

## Adding Questions

Edit `src/data/questions.ts`. Each question needs: `id`, `clue`, `correctResponse`, `code`, `codeType` ("CPT" | "ICD-10"), `category` (must match a category in the `categories` array), `difficulty` (1-5), and optionally `mnemonic` and `fact`.

## Key Constraints

- Node.js v24 has compatibility issues with the `next` CLI binary — use `node node_modules/next/dist/bin/next` directly or `tsx` for TypeScript execution
- Game state is in-memory (no database) — restarting the server resets all games
- Sound effects are generated via Web Audio API — no external audio files needed
