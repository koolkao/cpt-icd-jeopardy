"use client";

import { create } from "zustand";
import {
  GamePhase,
  GameMode,
  Player,
  PlayerScore,
  QuestionRevealData,
  LockAndKeyRound,
  RevealStep,
  LockAndKeyPlayerResult,
  ArenaRoundResult,
} from "@/data/types";

interface AnswerData {
  correctResponse: string;
  code: string;
  codeType: string;
  mnemonic?: string;
  fact?: string;
}

interface ControlState {
  gameId: string | null;
  gameTitle: string;
  gameSubtitle: string;
  gameMode: GameMode;
  phase: GamePhase;
  players: Player[];
  scores: PlayerScore[];
  currentClue: string | null;
  currentCategory: string | null;
  currentPointValue: number | null;
  buzzedPlayer: { id: string; name: string } | null;
  noMoreBuzzers: boolean;
  answerData: AnswerData | null;
  revealData: QuestionRevealData | null;
  answeredBy: string | null;
  wasCorrect: boolean;

  // Lock & Key state
  lkCurrentRound: LockAndKeyRound | null;
  lkTimerRemaining: number;
  lkRevealedOptions: RevealStep[];
  lkSubmissionCount: { submitted: number; total: number };
  lkRoundResults: LockAndKeyPlayerResult[];
  lkRevealNote: string;

  // Code Serpent state
  csRound: number;
  csTotalRounds: number;
  csScenarioText: string;
  csCategory: string;
  csCountdown: number;
  csRoundResults: ArenaRoundResult[];
  csTeachingNote: string;
  csCorrectCodes: { code: string; description: string }[];
  csScores: { playerId: string; playerName: string; score: number }[];

  setGameId: (id: string) => void;
  setGameMeta: (title: string, subtitle: string, gameMode: GameMode) => void;
  setPhase: (phase: GamePhase) => void;
  setPlayers: (players: Player[]) => void;
  addPlayer: (player: Player) => void;
  removePlayer: (id: string) => void;
  setScores: (scores: PlayerScore[]) => void;
  setClue: (clue: string, category: string, pointValue: number) => void;
  setBuzzedPlayer: (p: { id: string; name: string } | null) => void;
  setNoMoreBuzzers: (v: boolean) => void;
  setAnswerData: (data: AnswerData | null) => void;
  setRevealData: (data: QuestionRevealData & { answeredBy: string | null; wasCorrect: boolean }) => void;
  // Lock & Key actions
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
}

export const useControlStore = create<ControlState>((set) => ({
  gameId: null,
  gameTitle: "JEOPARDY!",
  gameSubtitle: "",
  gameMode: "jeopardy",
  phase: "lobby",
  players: [],
  scores: [],
  currentClue: null,
  currentCategory: null,
  currentPointValue: null,
  buzzedPlayer: null,
  noMoreBuzzers: false,
  answerData: null,
  revealData: null,
  answeredBy: null,
  wasCorrect: false,
  // Lock & Key
  lkCurrentRound: null,
  lkTimerRemaining: 0,
  lkRevealedOptions: [],
  lkSubmissionCount: { submitted: 0, total: 0 },
  lkRoundResults: [],
  lkRevealNote: "",
  // Code Serpent
  csRound: 0,
  csTotalRounds: 0,
  csScenarioText: "",
  csCategory: "",
  csCountdown: 0,
  csRoundResults: [],
  csTeachingNote: "",
  csCorrectCodes: [],
  csScores: [],

  setGameId: (id) => set({ gameId: id }),
  setGameMeta: (title, subtitle, gameMode) => set({ gameTitle: title, gameSubtitle: subtitle, gameMode }),
  setPhase: (phase) => set({ phase, noMoreBuzzers: false }),
  setPlayers: (players) => set({ players }),
  addPlayer: (player) =>
    set((s) => ({ players: [...s.players, player] })),
  removePlayer: (id) =>
    set((s) => ({ players: s.players.filter((p) => p.id !== id) })),
  setScores: (scores) => set({ scores }),
  setClue: (clue, category, pointValue) =>
    set({
      currentClue: clue,
      currentCategory: category,
      currentPointValue: pointValue,
      buzzedPlayer: null,
      noMoreBuzzers: false,
    }),
  setBuzzedPlayer: (p) => set({ buzzedPlayer: p }),
  setNoMoreBuzzers: (v) => set({ noMoreBuzzers: v }),
  setAnswerData: (data) => set({ answerData: data }),
  setRevealData: (data) =>
    set({
      revealData: data,
      answeredBy: data.answeredBy,
      wasCorrect: data.wasCorrect,
    }),
  // Lock & Key actions
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
}));
