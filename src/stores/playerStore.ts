"use client";

import { create } from "zustand";
import { GamePhase, PlayerScore, QuestionRevealData } from "@/data/types";

interface PlayerState {
  gameId: string | null;
  gameTitle: string;
  gameSubtitle: string;
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

  // Actions
  setGameMeta: (title: string, subtitle: string) => void;
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
  reset: () => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  gameId: null,
  gameTitle: "JEOPARDY!",
  gameSubtitle: "",
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

  setGameMeta: (title, subtitle) => set({ gameTitle: title, gameSubtitle: subtitle }),
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
  reset: () =>
    set({
      gameId: null,
      gameTitle: "JEOPARDY!",
      gameSubtitle: "",
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
    }),
}));
