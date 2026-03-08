"use client";

import { create } from "zustand";
import {
  GamePhase,
  Player,
  CellState,
  PlayerScore,
  QuestionRevealData,
  BoardData,
} from "@/data/types";

interface HostState {
  gameId: string | null;
  gameTitle: string;
  gameSubtitle: string;
  phase: GamePhase;
  players: Player[];
  board: CellState[][];
  categories: string[];
  currentClue: string | null;
  currentCategory: string | null;
  currentPointValue: number | null;
  currentCell: { cat: number; val: number } | null;
  buzzedPlayer: { id: string; name: string } | null;
  scores: PlayerScore[];
  revealData: QuestionRevealData | null;
  answeredBy: string | null;
  wasCorrect: boolean;
  noMoreBuzzers: boolean;

  // Actions
  setGameId: (id: string) => void;
  setGameMeta: (title: string, subtitle: string) => void;
  setPhase: (phase: GamePhase) => void;
  addPlayer: (player: Player) => void;
  removePlayer: (id: string) => void;
  setBoard: (data: BoardData) => void;
  revealCell: (cat: number, val: number) => void;
  setQuestion: (clue: string, category: string, pointValue: number, cell: { cat: number; val: number }) => void;
  setBuzzedPlayer: (p: { id: string; name: string } | null) => void;
  setScores: (scores: PlayerScore[]) => void;
  setRevealData: (data: QuestionRevealData & { answeredBy: string | null; wasCorrect: boolean }) => void;
  setNoMoreBuzzers: (v: boolean) => void;
  reset: () => void;
}

const initialState = {
  gameId: null as string | null,
  gameTitle: "JEOPARDY!",
  gameSubtitle: "",
  phase: "lobby" as GamePhase,
  players: [] as Player[],
  board: [] as CellState[][],
  categories: [] as string[],
  currentClue: null as string | null,
  currentCategory: null as string | null,
  currentPointValue: null as number | null,
  currentCell: null as { cat: number; val: number } | null,
  buzzedPlayer: null as { id: string; name: string } | null,
  scores: [] as PlayerScore[],
  revealData: null as QuestionRevealData | null,
  answeredBy: null as string | null,
  wasCorrect: false,
  noMoreBuzzers: false,
};

export const useHostStore = create<HostState>((set) => ({
  ...initialState,

  setGameId: (id) => set({ gameId: id }),
  setGameMeta: (title, subtitle) => set({ gameTitle: title, gameSubtitle: subtitle }),
  setPhase: (phase) => set({ phase, noMoreBuzzers: false }),
  addPlayer: (player) =>
    set((s) => ({ players: [...s.players, player] })),
  removePlayer: (id) =>
    set((s) => ({ players: s.players.filter((p) => p.id !== id) })),
  setBoard: (data) =>
    set({ board: data.cells, categories: data.categories }),
  revealCell: (cat, val) =>
    set((s) => {
      const newBoard = s.board.map((col) => col.map((cell) => ({ ...cell })));
      if (newBoard[cat]?.[val]) {
        newBoard[cat][val].isRevealed = true;
      }
      return { board: newBoard };
    }),
  setQuestion: (clue, category, pointValue, cell) =>
    set({
      currentClue: clue,
      currentCategory: category,
      currentPointValue: pointValue,
      currentCell: cell,
      buzzedPlayer: null,
      noMoreBuzzers: false,
    }),
  setBuzzedPlayer: (p) => set({ buzzedPlayer: p }),
  setScores: (scores) => set({ scores }),
  setRevealData: (data) =>
    set({
      revealData: data,
      answeredBy: data.answeredBy,
      wasCorrect: data.wasCorrect,
    }),
  setNoMoreBuzzers: (v) => set({ noMoreBuzzers: v }),
  reset: () => set(initialState),
}));
