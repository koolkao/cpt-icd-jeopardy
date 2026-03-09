// ============================================
// Shared types used by both server and client
// ============================================

// ── Game Mode ──
export type GameMode = "jeopardy" | "lock-and-key" | "code-serpent";

// ── Jeopardy Question ──
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

// ── Lock & Key Types ──
export interface LockAndKeyOption {
  code: string;
  description: string;
  isCorrect: boolean;
  explanation?: string;
}

export interface LockAndKeyRound {
  id: string;
  cptCode: string;
  cptDescription: string;
  category: string;
  subcategory: string;
  scenario: string;
  options: LockAndKeyOption[];
  revealNote: string;
  difficulty: 1 | 2 | 3;
}

export interface LockAndKeyCellState {
  categoryIndex: number;
  roundIndex: number;
  cptCode: string;
  subcategory: string;
  isRevealed: boolean;
}

export interface LockAndKeyBoardData {
  categories: string[];
  cells: LockAndKeyCellState[][];
}

export interface PlayerSubmission {
  playerId: string;
  selectedIndices: number[];
  submittedAt: number;
}

export interface RevealStep {
  optionIndex: number;
  option: LockAndKeyOption;
  playersWhoSelected: number;
  totalPlayers: number;
}

export interface LockAndKeyPlayerResult {
  playerId: string;
  playerName: string;
  correctSelections: number;
  incorrectSelections: number;
  basePoints: number;
  speedMultiplier: number;
  perfectBonus: number;
  totalDelta: number;
}

/** Client-safe round data (no isCorrect) */
export interface LockAndKeyRoundClientData {
  id: string;
  cptCode: string;
  cptDescription: string;
  category: string;
  subcategory: string;
  scenario: string;
  options: { code: string; description: string; index: number }[];
}

// ── Category ──
export interface CategoryDef {
  name: string;
  shortName: string;
}

// ── Game Config (discriminated union) ──
interface BaseGameConfig {
  id: string;
  title: string;
  subtitle: string;
  password: string;
  categories: CategoryDef[];
}

export interface JeopardyGameConfig extends BaseGameConfig {
  gameMode: "jeopardy";
  questions: Question[];
}

export interface LockAndKeyGameConfig extends BaseGameConfig {
  gameMode: "lock-and-key";
  rounds: LockAndKeyRound[];
}

// ── Code Serpent Types ──

export type Direction = "up" | "down" | "left" | "right";

export interface ArenaConfig {
  gridWidth: number;
  gridHeight: number;
  tickRateMs: number;
  roundDurationS: number;
  countdownS: number;
  resultsDurationS: number;
  totalRounds: number;
  pillCount: number;
  correctPillRatio: number;
  initialSnakeLength: number;
  respawnDelayMs: number;
  invincibilityMs: number;
  correctPoints: number;
  wrongPoints: number;
  collisionPoints: number;
}

export interface SnakeState {
  playerId: string;
  playerName: string;
  segments: { x: number; y: number }[];
  direction: Direction;
  color: string;
  alive: boolean;
  respawnAt: number | null;
  invincibleUntil: number;
  score: number;
}

export interface CodePill {
  id: string;
  x: number;
  y: number;
  code: string;
  description: string;
  isCorrect: boolean;
}

export interface ArenaScenario {
  id: string;
  scenarioText: string;
  category: string;
  correctCodes: { code: string; description: string }[];
  incorrectCodes: { code: string; description: string }[];
  teachingNote: string;
}

export interface ArenaTickDelta {
  snakes: {
    playerId: string;
    headX: number;
    headY: number;
    direction: Direction;
    length: number;
    alive: boolean;
    score: number;
  }[];
  pills: CodePill[];
  events: ArenaEvent[];
  timeRemainingS: number;
}

export interface ArenaEvent {
  type: "collect_correct" | "collect_wrong" | "collision" | "wall_hit" | "respawn";
  playerId: string;
  x: number;
  y: number;
  pillCode?: string;
  otherPlayerId?: string;
}

export interface ArenaFullSync {
  snakes: SnakeState[];
  pills: CodePill[];
  timeRemainingS: number;
  round: number;
}

export interface ArenaRoundResult {
  playerId: string;
  playerName: string;
  score: number;
  correctCollections: number;
  wrongCollections: number;
  collisions: number;
  roundDelta: number;
}

export interface CodeSerpentGameConfig extends BaseGameConfig {
  gameMode: "code-serpent";
  scenarios: ArenaScenario[];
  arenaConfig?: Partial<ArenaConfig>;
}

export type GameConfig = JeopardyGameConfig | LockAndKeyGameConfig | CodeSerpentGameConfig;

// ── Game Meta ──
export interface GameMeta {
  title: string;
  subtitle: string;
  gameMode: GameMode;
}

// ── Game Phases ──
export type GamePhase =
  | "lobby"
  | "board"
  // Jeopardy phases
  | "question"
  | "buzz_open"
  | "buzz_locked"
  | "answer_reveal"
  | "daily_double"
  // Lock & Key phases
  | "lk_playing"
  | "lk_revealing"
  | "lk_round_results"
  // Code Serpent phases
  | "cs_countdown"
  | "cs_playing"
  | "cs_round_results"
  // Shared
  | "game_over";

// ── Player ──
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

// ── Jeopardy Cell State ──
export interface CellState {
  categoryIndex: number;
  valueIndex: number;
  pointValue: number;
  isRevealed: boolean;
  isDailyDouble: boolean;
}

// ── Player Score ──
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

// ── Jeopardy Reveal Data ──
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

// ── Board Data ──
export interface BoardData {
  categories: string[];
  cells: CellState[][];
}

// ── Game State Snapshot ──
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
  // Lock & Key specific
  lkBoard: LockAndKeyBoardData | null;
  lkCurrentRound: LockAndKeyRoundClientData | null;
  lkTimerRemaining: number | null;
  // Code Serpent specific
  csRound: number | null;
  csTotalRounds: number | null;
  csScenarioText: string | null;
}

// ── Constants ──
// Jeopardy
export const POINT_VALUES = [200, 400, 600, 800, 1000] as const;
export const TIMER_DURATION_MS = 30000; // 30 seconds for buzzing
export const ANSWER_TIMER_MS = 15000;   // 15 seconds to answer after buzzing

// Lock & Key
export const LK_TIMER_DURATION_S = 30;
export const LK_REVEAL_INTERVAL_MS = 1500;
export const LK_CORRECT_POINTS = 100;
export const LK_INCORRECT_PENALTY = 75;
export const LK_PERFECT_BONUS = 50;
export const LK_SPEED_MULTIPLIERS = [
  { maxSeconds: 10, multiplier: 1.5 },
  { maxSeconds: 20, multiplier: 1.0 },
  { maxSeconds: 30, multiplier: 0.8 },
] as const;

// Code Serpent defaults
export const CS_DEFAULT_ARENA_CONFIG: ArenaConfig = {
  gridWidth: 60,
  gridHeight: 40,
  tickRateMs: 100,
  roundDurationS: 60,
  countdownS: 5,
  resultsDurationS: 15,
  totalRounds: 8,
  pillCount: 15,
  correctPillRatio: 0.4,
  initialSnakeLength: 3,
  respawnDelayMs: 2000,
  invincibilityMs: 2000,
  correctPoints: 100,
  wrongPoints: -75,
  collisionPoints: -50,
};

export const CS_SNAKE_COLORS = [
  "#22c55e", "#3b82f6", "#ef4444", "#f59e0b",
  "#8b5cf6", "#ec4899", "#06b6d4", "#f97316",
  "#10b981", "#6366f1", "#e11d48", "#84cc16",
  "#14b8a6", "#a855f7", "#fb923c", "#0ea5e9",
  "#d946ef", "#facc15", "#4ade80", "#f43f5e",
] as const;
