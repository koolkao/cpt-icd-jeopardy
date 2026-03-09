"use client";

import { create } from "zustand";
import {
  GamePhase,
  GameMode,
  PlayerScore,
  QuestionRevealData,
  LockAndKeyRoundClientData,
  RevealStep,
  LockAndKeyPlayerResult,
  ArenaRoundResult,
} from "@/data/types";

interface PlayerState {
  gameId: string | null;
  gameTitle: string;
  gameSubtitle: string;
  gameMode: GameMode;
  playerId: string | null;
  playerName: string;
  phase: GamePhase;
  score: number;
  rank: number;
  streak: number;
  currentClue: string | null;
  currentCategory: string | null;
  currentPointValue: number | null;
  canBuzz: boolean;
  hasBuzzed: boolean;
  buzzPosition: number | null;
  isMyTurn: boolean;
  lastResult: { correct: boolean; delta: number } | null;
  failedThisQuestion: boolean;
  revealData: QuestionRevealData | null;
  scores: PlayerScore[];
  buzzedPlayerName: string | null;

  // Lock & Key state
  lkRoundData: LockAndKeyRoundClientData | null;
  lkSelectedIndices: number[];
  lkHasSubmitted: boolean;
  lkTimerRemaining: number;
  lkRevealedOptions: RevealStep[];
  lkSubmissionCount: { submitted: number; total: number };
  lkMyResult: LockAndKeyPlayerResult | null;
  lkRevealNote: string;

  // Code Serpent state
  csRound: number;
  csTotalRounds: number;
  csScenarioText: string;
  csCategory: string;
  csCountdown: number;
  csMyResult: ArenaRoundResult | null;
  csTeachingNote: string;
  csCorrectCodes: { code: string; description: string }[];
  csScores: { playerId: string; playerName: string; score: number }[];
  csLastCollection: { code: string; correct: boolean; points: number } | null;

  // Actions
  setGameMeta: (title: string, subtitle: string, gameMode: GameMode) => void;
  setJoined: (gameId: string, playerId: string, name: string) => void;
  setPhase: (phase: GamePhase) => void;
  setClue: (clue: string, category: string, value: number) => void;
  setBuzzable: (canBuzz: boolean) => void;
  setHasBuzzed: (hasBuzzed: boolean) => void;
  setBuzzResult: (position: number, isFirst: boolean) => void;
  setMyTurn: (isMyTurn: boolean) => void;
  setAnswerResult: (correct: boolean, delta: number, newScore: number) => void;
  setRevealData: (data: QuestionRevealData) => void;
  setScores: (scores: PlayerScore[]) => void;
  setBuzzedPlayerName: (name: string | null) => void;
  // Lock & Key actions
  setLkRoundData: (data: LockAndKeyRoundClientData) => void;
  toggleLkSelection: (index: number) => void;
  setLkSubmitted: () => void;
  setLkTimer: (remaining: number) => void;
  addLkRevealStep: (step: RevealStep) => void;
  setLkSubmissionCount: (count: { submitted: number; total: number }) => void;
  setLkResult: (result: LockAndKeyPlayerResult | null, revealNote: string) => void;
  clearLkRoundState: () => void;
  // Code Serpent actions
  setCsRound: (round: number, totalRounds: number, scenarioText: string, category: string) => void;
  setCsCountdown: (secondsLeft: number) => void;
  setCsRoundResults: (myResult: ArenaRoundResult | null, teachingNote: string, correctCodes: { code: string; description: string }[], scores: { playerId: string; playerName: string; score: number }[]) => void;
  setCsLastCollection: (data: { code: string; correct: boolean; points: number } | null) => void;
  clearCsState: () => void;
  reset: () => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  gameId: null,
  gameTitle: "JEOPARDY!",
  gameSubtitle: "",
  gameMode: "jeopardy",
  playerId: null,
  playerName: "",
  phase: "lobby",
  score: 0,
  rank: 0,
  streak: 0,
  currentClue: null,
  currentCategory: null,
  currentPointValue: null,
  canBuzz: false,
  hasBuzzed: false,
  buzzPosition: null,
  isMyTurn: false,
  lastResult: null,
  failedThisQuestion: false,
  revealData: null,
  scores: [],
  buzzedPlayerName: null,
  // Lock & Key
  lkRoundData: null,
  lkSelectedIndices: [],
  lkHasSubmitted: false,
  lkTimerRemaining: 0,
  lkRevealedOptions: [],
  lkSubmissionCount: { submitted: 0, total: 0 },
  lkMyResult: null,
  lkRevealNote: "",
  // Code Serpent
  csRound: 0,
  csTotalRounds: 0,
  csScenarioText: "",
  csCategory: "",
  csCountdown: 0,
  csMyResult: null,
  csTeachingNote: "",
  csCorrectCodes: [],
  csScores: [],
  csLastCollection: null,

  setGameMeta: (title, subtitle, gameMode) => set({ gameTitle: title, gameSubtitle: subtitle, gameMode }),
  setJoined: (gameId, playerId, name) =>
    set({ gameId, playerId, playerName: name }),
  setPhase: (phase) =>
    set({
      phase,
      canBuzz: false,
      hasBuzzed: false,
      buzzPosition: null,
      isMyTurn: false,
      lastResult: null,
      failedThisQuestion: false,
      revealData: null,
      buzzedPlayerName: null,
    }),
  setClue: (clue, category, value) =>
    set({
      currentClue: clue,
      currentCategory: category,
      currentPointValue: value,
      lastResult: null,
    }),
  setBuzzable: (canBuzz) => set({ canBuzz }),
  setHasBuzzed: (hasBuzzed) => set({ hasBuzzed }),
  setBuzzResult: (position, isFirst) =>
    set({ buzzPosition: position, isMyTurn: isFirst }),
  setMyTurn: (isMyTurn) => set({ isMyTurn }),
  setAnswerResult: (correct, delta, newScore) =>
    set({
      lastResult: { correct, delta },
      score: newScore,
      isMyTurn: false,
      failedThisQuestion: !correct,
    }),
  setRevealData: (data) => set({ revealData: data }),
  setScores: (scores) => {
    const state = get();
    const myScore = scores.find((s) => s.id === state.playerId);
    set({
      scores,
      score: myScore?.score ?? state.score,
      rank: myScore?.rank ?? state.rank,
      streak: myScore?.streak ?? state.streak,
    });
  },
  setBuzzedPlayerName: (name) => set({ buzzedPlayerName: name }),

  // Lock & Key actions
  setLkRoundData: (data) => set({
    lkRoundData: data,
    lkSelectedIndices: [],
    lkHasSubmitted: false,
    lkRevealedOptions: [],
    lkMyResult: null,
    lkRevealNote: "",
  }),
  toggleLkSelection: (index) =>
    set((s) => {
      if (s.lkHasSubmitted) return s;
      const indices = [...s.lkSelectedIndices];
      const pos = indices.indexOf(index);
      if (pos >= 0) {
        indices.splice(pos, 1);
      } else {
        indices.push(index);
      }
      return { lkSelectedIndices: indices };
    }),
  setLkSubmitted: () => set({ lkHasSubmitted: true }),
  setLkTimer: (remaining) => set({ lkTimerRemaining: remaining }),
  addLkRevealStep: (step) =>
    set((s) => ({ lkRevealedOptions: [...s.lkRevealedOptions, step] })),
  setLkSubmissionCount: (count) => set({ lkSubmissionCount: count }),
  setLkResult: (result, revealNote) => set({ lkMyResult: result, lkRevealNote: revealNote }),
  clearLkRoundState: () =>
    set({
      lkRoundData: null,
      lkSelectedIndices: [],
      lkHasSubmitted: false,
      lkTimerRemaining: 0,
      lkRevealedOptions: [],
      lkSubmissionCount: { submitted: 0, total: 0 },
      lkMyResult: null,
      lkRevealNote: "",
    }),
  // Code Serpent actions
  setCsRound: (round, totalRounds, scenarioText, category) =>
    set({ csRound: round, csTotalRounds: totalRounds, csScenarioText: scenarioText, csCategory: category }),
  setCsCountdown: (secondsLeft) => set({ csCountdown: secondsLeft }),
  setCsRoundResults: (myResult, teachingNote, correctCodes, scores) =>
    set({ csMyResult: myResult, csTeachingNote: teachingNote, csCorrectCodes: correctCodes, csScores: scores }),
  setCsLastCollection: (data) => set({ csLastCollection: data }),
  clearCsState: () =>
    set({
      csRound: 0,
      csTotalRounds: 0,
      csScenarioText: "",
      csCategory: "",
      csCountdown: 0,
      csMyResult: null,
      csTeachingNote: "",
      csCorrectCodes: [],
      csScores: [],
      csLastCollection: null,
    }),
  reset: () =>
    set({
      gameId: null,
      gameTitle: "JEOPARDY!",
      gameSubtitle: "",
      gameMode: "jeopardy",
      playerId: null,
      playerName: "",
      phase: "lobby",
      score: 0,
      rank: 0,
      streak: 0,
      currentClue: null,
      currentCategory: null,
      currentPointValue: null,
      canBuzz: false,
      hasBuzzed: false,
      buzzPosition: null,
      isMyTurn: false,
      lastResult: null,
      failedThisQuestion: false,
      revealData: null,
      scores: [],
      buzzedPlayerName: null,
      lkRoundData: null,
      lkSelectedIndices: [],
      lkHasSubmitted: false,
      lkTimerRemaining: 0,
      lkRevealedOptions: [],
      lkSubmissionCount: { submitted: 0, total: 0 },
      lkMyResult: null,
      lkRevealNote: "",
      csRound: 0,
      csTotalRounds: 0,
      csScenarioText: "",
      csCategory: "",
      csCountdown: 0,
      csMyResult: null,
      csTeachingNote: "",
      csCorrectCodes: [],
      csScores: [],
      csLastCollection: null,
    }),
}));
