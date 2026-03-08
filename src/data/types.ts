// ============================================
// Shared types used by both server and client
// ============================================

export interface Question {
  id: string;
  /** The "answer" shown on the board (Jeopardy style: answer is the prompt) */
  clue: string;
  /** The "question" the player must give (e.g., "What is 62323?") */
  correctResponse: string;
  /** The actual CPT or ICD-10 code */
  code: string;
  codeType: "CPT" | "ICD-10";
  /** Category this belongs to (maps to board column) */
  category: string;
  /** Difficulty 1-5 (maps to $200-$1000) */
  difficulty: 1 | 2 | 3 | 4 | 5;
  /** Mnemonic or memory aid shown after answer reveal */
  mnemonic?: string;
  /** Interesting fact shown after answer reveal */
  fact?: string;
}

export interface CategoryDef {
  name: string;
  shortName: string;
}

export interface GameConfig {
  id: string;
  title: string;
  subtitle: string;
  password: string;
  categories: CategoryDef[];
  questions: Question[];
}

export interface GameMeta {
  title: string;
  subtitle: string;
}

export type GamePhase =
  | "lobby"
  | "board"
  | "question"
  | "buzz_open"
  | "buzz_locked"
  | "answer_reveal"
  | "daily_double"
  | "game_over";

export interface Player {
  id: string;
  name: string;
  score: number;
  streak: number;
  bestStreak: number;
  correctCount: number;
  wrongCount: number;
  isConnected: boolean;
}

export interface CellState {
  categoryIndex: number;
  valueIndex: number;
  pointValue: number;
  isRevealed: boolean;
  isDailyDouble: boolean;
}

export interface PlayerScore {
  id: string;
  name: string;
  score: number;
  streak: number;
  bestStreak: number;
  correctCount: number;
  wrongCount: number;
  rank: number;
}

export interface QuestionRevealData {
  clue: string;
  correctResponse: string;
  code: string;
  codeType: "CPT" | "ICD-10";
  category: string;
  pointValue: number;
  mnemonic?: string;
  fact?: string;
}

export interface BoardData {
  categories: string[];
  cells: CellState[][];
}

export interface GameStateSnapshot {
  gameId: string;
  phase: GamePhase;
  players: Player[];
  board: BoardData | null;
  currentQuestion: QuestionRevealData | null;
  currentCell: { cat: number; val: number } | null;
  buzzedPlayer: { id: string; name: string } | null;
  scores: PlayerScore[];
  gameMeta: GameMeta;
}

// Point values for each difficulty level
export const POINT_VALUES = [200, 400, 600, 800, 1000] as const;
export const TIMER_DURATION_MS = 30000; // 30 seconds for buzzing
export const ANSWER_TIMER_MS = 15000;   // 15 seconds to answer after buzzing
