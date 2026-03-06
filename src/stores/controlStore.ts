"use client";

import { create } from "zustand";
import {
  GamePhase,
  Player,
  PlayerScore,
  QuestionRevealData,
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

  setGameId: (id: string) => void;
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
}

export const useControlStore = create<ControlState>((set) => ({
  gameId: null,
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

  setGameId: (id) => set({ gameId: id }),
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
}));
