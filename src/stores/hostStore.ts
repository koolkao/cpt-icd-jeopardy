"use client";

import { create } from "zustand";
import {
  GamePhase,
  GameMode,
  Player,
  CellState,
  PlayerScore,
  QuestionRevealData,
  BoardData,
  LockAndKeyCellState,
  LockAndKeyBoardData,
  LockAndKeyRound,
  RevealStep,
  LockAndKeyPlayerResult,
  ArenaRoundResult,
} from "@/data/types";

interface HostState {
  gameId: string | null;
  gameTitle: string;
  gameSubtitle: string;
  gameMode: GameMode;
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

  // Lock & Key state
  lkBoard: LockAndKeyCellState[][];
  lkCurrentRound: LockAndKeyRound | null;
  lkTimerRemaining: number;
  lkRevealedOptions: RevealStep[];
  lkSubmissionCount: { submitted: number; total: number };
  lkRoundResults: LockAndKeyPlayerResult[];
  lkRevealNote: string;

  // Code Serpent state (round-level, NOT tick data)
  csRound: number;
  csTotalRounds: number;
  csScenarioText: string;
  csCategory: string;
  csCountdown: number;
  csRoundResults: ArenaRoundResult[];
  csTeachingNote: string;
  csCorrectCodes: { code: string; description: string }[];
  csScores: { playerId: string; playerName: string; score: number }[];

  // Actions
  setGameId: (id: string) => void;
  setGameMeta: (title: string, subtitle: string, gameMode: GameMode) => void;
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
  // Lock & Key actions
  setLkBoard: (data: LockAndKeyBoardData) => void;
  revealLkCell: (cat: number, val: number) => void;
  setLkCurrentRound: (round: LockAndKeyRound | null) => void;
  setLkTimer: (remaining: number) => void;
  addLkRevealStep: (step: RevealStep) => void;
  setLkSubmissionCount: (count: { submitted: number; total: number }) => void;
  setLkRoundResults: (results: LockAndKeyPlayerResult[], revealNote: string) => void;
  clearLkRoundState: () => void;
  // Code Serpent actions
  setCsRound: (round: number, totalRounds: number, scenarioText: string, category: string) => void;
  setCsCountdown: (secondsLeft: number) => void;
  setCsRoundResults: (results: ArenaRoundResult[], teachingNote: string, correctCodes: { code: string; description: string }[], scores: { playerId: string; playerName: string; score: number }[]) => void;
  clearCsState: () => void;
  reset: () => void;
}

const initialState = {
  gameId: null as string | null,
  gameTitle: "JEOPARDY!",
  gameSubtitle: "",
  gameMode: "jeopardy" as GameMode,
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
  // Lock & Key
  lkBoard: [] as LockAndKeyCellState[][],
  lkCurrentRound: null as LockAndKeyRound | null,
  lkTimerRemaining: 0,
  lkRevealedOptions: [] as RevealStep[],
  lkSubmissionCount: { submitted: 0, total: 0 },
  lkRoundResults: [] as LockAndKeyPlayerResult[],
  lkRevealNote: "",
  // Code Serpent
  csRound: 0,
  csTotalRounds: 0,
  csScenarioText: "",
  csCategory: "",
  csCountdown: 0,
  csRoundResults: [] as ArenaRoundResult[],
  csTeachingNote: "",
  csCorrectCodes: [] as { code: string; description: string }[],
  csScores: [] as { playerId: string; playerName: string; score: number }[],
};

export const useHostStore = create<HostState>((set) => ({
  ...initialState,

  setGameId: (id) => set({ gameId: id }),
  setGameMeta: (title, subtitle, gameMode) => set({ gameTitle: title, gameSubtitle: subtitle, gameMode }),
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

  // Lock & Key actions
  setLkBoard: (data) =>
    set({ lkBoard: data.cells, categories: data.categories }),
  revealLkCell: (cat, val) =>
    set((s) => {
      const newBoard = s.lkBoard.map((col) => col.map((cell) => ({ ...cell })));
      if (newBoard[cat]?.[val]) {
        newBoard[cat][val].isRevealed = true;
      }
      return { lkBoard: newBoard };
    }),
  setLkCurrentRound: (round) => set({ lkCurrentRound: round }),
  setLkTimer: (remaining) => set({ lkTimerRemaining: remaining }),
  addLkRevealStep: (step) =>
    set((s) => ({ lkRevealedOptions: [...s.lkRevealedOptions, step] })),
  setLkSubmissionCount: (count) => set({ lkSubmissionCount: count }),
  setLkRoundResults: (results, revealNote) =>
    set({ lkRoundResults: results, lkRevealNote: revealNote }),
  clearLkRoundState: () =>
    set({
      lkCurrentRound: null,
      lkTimerRemaining: 0,
      lkRevealedOptions: [],
      lkSubmissionCount: { submitted: 0, total: 0 },
      lkRoundResults: [],
      lkRevealNote: "",
    }),
  // Code Serpent actions
  setCsRound: (round, totalRounds, scenarioText, category) =>
    set({ csRound: round, csTotalRounds: totalRounds, csScenarioText: scenarioText, csCategory: category }),
  setCsCountdown: (secondsLeft) => set({ csCountdown: secondsLeft }),
  setCsRoundResults: (results, teachingNote, correctCodes, scores) =>
    set({ csRoundResults: results, csTeachingNote: teachingNote, csCorrectCodes: correctCodes, csScores: scores }),
  clearCsState: () =>
    set({
      csRound: 0,
      csTotalRounds: 0,
      csScenarioText: "",
      csCategory: "",
      csCountdown: 0,
      csRoundResults: [],
      csTeachingNote: "",
      csCorrectCodes: [],
      csScores: [],
    }),
  reset: () => set(initialState),
}));
