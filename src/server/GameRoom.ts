import { Server } from "socket.io";
import {
  GamePhase,
  GameMode,
  GameMeta,
  Player,
  CellState,
  PlayerScore,
  QuestionRevealData,
  BoardData,
  GameStateSnapshot,
  POINT_VALUES,
  Question,
  LockAndKeyCellState,
  LockAndKeyBoardData,
  LockAndKeyRound,
  LockAndKeyRoundClientData,
  PlayerSubmission,
  RevealStep,
  LockAndKeyPlayerResult,
  LK_TIMER_DURATION_S,
  LK_REVEAL_INTERVAL_MS,
  LK_CORRECT_POINTS,
  LK_INCORRECT_PENALTY,
  LK_PERFECT_BONUS,
  LK_SPEED_MULTIPLIERS,
  Direction,
} from "../data/types";
import { getGameConfig } from "../data/games";
import { ArenaEngine } from "./ArenaEngine";

export class GameRoom {
  gameId: string;
  hostSocketId: string;
  gameType: string;
  gameMode: GameMode;
  phase: GamePhase = "lobby";
  players: Map<string, Player> = new Map();
  controlSocketIds: Set<string> = new Set();
  createdAt: number = Date.now();

  // ── Jeopardy state ──
  board: CellState[][] = [];
  categories: string[] = [];
  questionGrid: (Question | null)[][] = [];
  currentQuestion: Question | null = null;
  currentCell: { cat: number; val: number } | null = null;
  buzzQueue: { playerId: string; timestamp: number }[] = [];
  activeBuzzer: string | null = null;
  failedBuzzers: Set<string> = new Set();
  dailyDoubleWager: number | null = null;
  dailyDoublePlayer: string | null = null;

  // ── Lock & Key state ──
  lkBoard: LockAndKeyCellState[][] = [];
  lkRoundGrid: (LockAndKeyRound | null)[][] = [];
  lkCurrentRound: LockAndKeyRound | null = null;
  lkSubmissions: Map<string, PlayerSubmission> = new Map();
  lkTimerRemaining: number = 0;
  lkTimerInterval: ReturnType<typeof setInterval> | null = null;
  lkRevealIndex: number = -1;
  lkRevealInterval: ReturnType<typeof setInterval> | null = null;
  lkRoundStartTime: number = 0;

  // ── Code Serpent state ──
  csEngine: ArenaEngine | null = null;

  constructor(gameId: string, hostSocketId: string, gameType: string) {
    this.gameId = gameId;
    this.hostSocketId = hostSocketId;
    this.gameType = gameType;
    const config = getGameConfig(gameType);
    this.gameMode = config?.gameMode ?? "jeopardy";
  }

  // ── Player management (shared) ──

  addPlayer(socketId: string, name: string): Player | null {
    for (const p of this.players.values()) {
      if (p.name.toLowerCase() === name.toLowerCase()) {
        return null;
      }
    }
    const maxPlayers = this.gameMode === "lock-and-key" ? 30 : this.gameMode === "code-serpent" ? 20 : 20;
    if (this.players.size >= maxPlayers) return null;

    const player: Player = {
      id: socketId,
      name,
      score: 0,
      streak: 0,
      bestStreak: 0,
      correctCount: 0,
      wrongCount: 0,
      isConnected: true,
    };
    this.players.set(socketId, player);
    return player;
  }

  removePlayer(socketId: string): void {
    const player = this.players.get(socketId);
    if (player) {
      player.isConnected = false;
    }
  }

  reconnectPlayer(oldId: string, newId: string): Player | null {
    for (const [id, player] of this.players) {
      if (!player.isConnected && player.name === oldId) {
        this.players.delete(id);
        player.id = newId;
        player.isConnected = true;
        this.players.set(newId, player);
        return player;
      }
    }
    return null;
  }

  findDisconnectedPlayer(name: string): Player | null {
    for (const player of this.players.values()) {
      if (!player.isConnected && player.name.toLowerCase() === name.toLowerCase()) {
        return player;
      }
    }
    return null;
  }

  rejoinPlayer(name: string, newSocketId: string): Player | null {
    for (const [oldId, player] of this.players) {
      if (!player.isConnected && player.name.toLowerCase() === name.toLowerCase()) {
        this.players.delete(oldId);
        player.id = newSocketId;
        player.isConnected = true;
        this.players.set(newSocketId, player);
        return player;
      }
    }
    return null;
  }

  // ── Jeopardy board generation ──

  generateBoard(): void {
    const config = getGameConfig(this.gameType);
    if (!config || config.gameMode !== "jeopardy") {
      throw new Error(`Invalid jeopardy game type: ${this.gameType}`);
    }

    this.categories = config.categories.map((c) => c.name);
    this.board = [];
    this.questionGrid = [];

    for (let catIdx = 0; catIdx < 6; catIdx++) {
      this.board[catIdx] = [];
      this.questionGrid[catIdx] = [];
      const catQuestions = config.questions.filter(
        (q) => q.category === this.categories[catIdx]
      );

      for (let valIdx = 0; valIdx < 5; valIdx++) {
        const difficulty = (valIdx + 1) as 1 | 2 | 3 | 4 | 5;
        const matching = catQuestions.filter((q) => q.difficulty === difficulty);
        const selected =
          matching.length > 0
            ? matching[Math.floor(Math.random() * matching.length)]
            : null;

        this.board[catIdx][valIdx] = {
          categoryIndex: catIdx,
          valueIndex: valIdx,
          pointValue: POINT_VALUES[valIdx],
          isRevealed: false,
          isDailyDouble: false,
        };
        this.questionGrid[catIdx][valIdx] = selected;
      }
    }

    // Place 1 daily double randomly (not on $200 questions)
    const ddCat = Math.floor(Math.random() * 6);
    const ddVal = 1 + Math.floor(Math.random() * 4);
    this.board[ddCat][ddVal].isDailyDouble = true;
  }

  // ── Lock & Key board generation ──

  generateLockAndKeyBoard(): void {
    const config = getGameConfig(this.gameType);
    if (!config || config.gameMode !== "lock-and-key") {
      throw new Error(`Invalid lock-and-key game type: ${this.gameType}`);
    }

    this.categories = config.categories.map((c) => c.name);
    this.lkBoard = [];
    this.lkRoundGrid = [];

    for (let catIdx = 0; catIdx < 6; catIdx++) {
      this.lkBoard[catIdx] = [];
      this.lkRoundGrid[catIdx] = [];
      const catRounds = config.rounds.filter(
        (r) => r.category === this.categories[catIdx]
      );

      // Sort by difficulty for predictable board layout
      catRounds.sort((a, b) => a.difficulty - b.difficulty);

      for (let roundIdx = 0; roundIdx < 4; roundIdx++) {
        const selected = catRounds[roundIdx] || null;

        this.lkBoard[catIdx][roundIdx] = {
          categoryIndex: catIdx,
          roundIndex: roundIdx,
          cptCode: selected?.cptCode ?? "???",
          subcategory: selected?.subcategory ?? "",
          isRevealed: false,
        };
        this.lkRoundGrid[catIdx][roundIdx] = selected;
      }
    }
  }

  // ── Jeopardy cell selection ──

  selectCell(cat: number, val: number): Question | null {
    if (cat < 0 || cat >= 6 || val < 0 || val >= 5) return null;
    if (this.board[cat]?.[val]?.isRevealed) return null;

    this.board[cat][val].isRevealed = true;
    this.currentCell = { cat, val };
    this.currentQuestion = this.questionGrid[cat]?.[val] ?? null;
    this.buzzQueue = [];
    this.activeBuzzer = null;
    this.failedBuzzers.clear();

    return this.currentQuestion;
  }

  // ── Lock & Key cell selection ──

  selectLockAndKeyCell(cat: number, roundIdx: number): LockAndKeyRound | null {
    if (cat < 0 || cat >= 6 || roundIdx < 0 || roundIdx >= 4) return null;
    if (this.lkBoard[cat]?.[roundIdx]?.isRevealed) return null;

    this.lkBoard[cat][roundIdx].isRevealed = true;
    this.currentCell = { cat, val: roundIdx };
    this.lkCurrentRound = this.lkRoundGrid[cat]?.[roundIdx] ?? null;
    this.lkSubmissions.clear();
    this.lkRoundStartTime = Date.now();
    this.lkTimerRemaining = LK_TIMER_DURATION_S;
    this.lkRevealIndex = -1;

    return this.lkCurrentRound;
  }

  // ── Lock & Key submissions ──

  submitSelection(playerId: string, selectedIndices: number[]): { submitted: number; total: number } {
    if (this.lkSubmissions.has(playerId)) {
      // Already submitted — ignore
      return this.getSubmissionCount();
    }
    this.lkSubmissions.set(playerId, {
      playerId,
      selectedIndices,
      submittedAt: Date.now(),
    });
    return this.getSubmissionCount();
  }

  getSubmissionCount(): { submitted: number; total: number } {
    const connected = Array.from(this.players.values()).filter((p) => p.isConnected);
    return {
      submitted: this.lkSubmissions.size,
      total: connected.length,
    };
  }

  allSubmitted(): boolean {
    const connected = Array.from(this.players.values()).filter((p) => p.isConnected);
    return connected.every((p) => this.lkSubmissions.has(p.id));
  }

  // ── Lock & Key timer ──

  startTimer(io: Server, gameId: string): void {
    this.clearTimer();
    this.lkTimerInterval = setInterval(() => {
      this.lkTimerRemaining--;
      io.to(gameId).emit("lk:timer-tick", { remaining: this.lkTimerRemaining });
      if (this.lkTimerRemaining <= 0) {
        this.clearTimer();
        this.autoSubmitRemaining();
        this.phase = "lk_revealing";
        io.to(gameId).emit("game:phase-change", { phase: "lk_revealing" });
        this.startRevealSequence(io, gameId);
      }
    }, 1000);
  }

  clearTimer(): void {
    if (this.lkTimerInterval) {
      clearInterval(this.lkTimerInterval);
      this.lkTimerInterval = null;
    }
  }

  autoSubmitRemaining(): void {
    for (const player of this.players.values()) {
      if (player.isConnected && !this.lkSubmissions.has(player.id)) {
        this.lkSubmissions.set(player.id, {
          playerId: player.id,
          selectedIndices: [],
          submittedAt: Date.now(),
        });
      }
    }
  }

  // ── Lock & Key reveal sequence ──

  startRevealSequence(io: Server, gameId: string): void {
    this.lkRevealIndex = -1;
    const totalOptions = this.lkCurrentRound?.options.length ?? 0;

    if (this.lkRevealInterval) {
      clearInterval(this.lkRevealInterval);
    }

    this.lkRevealInterval = setInterval(() => {
      this.lkRevealIndex++;
      if (this.lkRevealIndex >= totalOptions) {
        clearInterval(this.lkRevealInterval!);
        this.lkRevealInterval = null;

        // Score and broadcast results
        const results = this.scoreLockAndKeyRound();
        const scores = this.getScores();
        this.phase = "lk_round_results";

        io.to(gameId).emit("lk:round-complete", {
          results,
          revealNote: this.lkCurrentRound?.revealNote ?? "",
          scores,
        });
        io.to(gameId).emit("game:phase-change", {
          phase: "lk_round_results",
          scores,
        });
      } else {
        const step = this.getRevealStep(this.lkRevealIndex);
        io.to(gameId).emit("lk:reveal-step", {
          step,
          stepIndex: this.lkRevealIndex,
          totalSteps: totalOptions,
        });
      }
    }, LK_REVEAL_INTERVAL_MS);
  }

  getRevealStep(index: number): RevealStep {
    const option = this.lkCurrentRound!.options[index];
    let playersWhoSelected = 0;
    for (const sub of this.lkSubmissions.values()) {
      if (sub.selectedIndices.includes(index)) {
        playersWhoSelected++;
      }
    }
    const connected = Array.from(this.players.values()).filter((p) => p.isConnected);
    return {
      optionIndex: index,
      option,
      playersWhoSelected,
      totalPlayers: connected.length,
    };
  }

  // ── Lock & Key scoring ──

  scoreLockAndKeyRound(): LockAndKeyPlayerResult[] {
    if (!this.lkCurrentRound) return [];

    const options = this.lkCurrentRound.options;
    const totalCorrect = options.filter((o) => o.isCorrect).length;
    const results: LockAndKeyPlayerResult[] = [];

    for (const [playerId, submission] of this.lkSubmissions) {
      const player = this.players.get(playerId);
      if (!player) continue;

      let correctSelections = 0;
      let incorrectSelections = 0;

      for (const idx of submission.selectedIndices) {
        if (idx >= 0 && idx < options.length) {
          if (options[idx].isCorrect) {
            correctSelections++;
          } else {
            incorrectSelections++;
          }
        }
      }

      const basePoints = (correctSelections * LK_CORRECT_POINTS) - (incorrectSelections * LK_INCORRECT_PENALTY);
      const isPerfect = correctSelections === totalCorrect && incorrectSelections === 0;
      const perfectBonus = isPerfect ? LK_PERFECT_BONUS : 0;

      // Speed multiplier
      const elapsedMs = submission.submittedAt - this.lkRoundStartTime;
      const elapsedS = elapsedMs / 1000;
      let speedMultiplier = LK_SPEED_MULTIPLIERS[LK_SPEED_MULTIPLIERS.length - 1].multiplier;
      for (const tier of LK_SPEED_MULTIPLIERS) {
        if (elapsedS <= tier.maxSeconds) {
          speedMultiplier = tier.multiplier;
          break;
        }
      }

      const totalDelta = Math.round((basePoints + perfectBonus) * speedMultiplier);

      // Update player stats
      player.score += totalDelta;
      if (correctSelections > 0 && incorrectSelections === 0) {
        player.streak++;
        player.correctCount++;
        if (player.streak > player.bestStreak) {
          player.bestStreak = player.streak;
        }
      } else if (incorrectSelections > 0) {
        player.streak = 0;
        player.wrongCount++;
      }

      results.push({
        playerId,
        playerName: player.name,
        correctSelections,
        incorrectSelections,
        basePoints,
        speedMultiplier,
        perfectBonus,
        totalDelta,
      });
    }

    return results;
  }

  // ── Lock & Key data accessors ──

  getLockAndKeyBoardData(): LockAndKeyBoardData {
    return {
      categories: this.categories,
      cells: this.lkBoard,
    };
  }

  getLockAndKeyRoundClientData(): LockAndKeyRoundClientData | null {
    if (!this.lkCurrentRound) return null;
    return {
      id: this.lkCurrentRound.id,
      cptCode: this.lkCurrentRound.cptCode,
      cptDescription: this.lkCurrentRound.cptDescription,
      category: this.lkCurrentRound.category,
      subcategory: this.lkCurrentRound.subcategory,
      scenario: this.lkCurrentRound.scenario,
      options: this.lkCurrentRound.options.map((o, i) => ({
        code: o.code,
        description: o.description,
        index: i,
      })),
    };
  }

  isAllLkRevealed(): boolean {
    for (const catCells of this.lkBoard) {
      for (const cell of catCells) {
        if (!cell.isRevealed) return false;
      }
    }
    return true;
  }

  cleanupLkRound(): void {
    this.lkCurrentRound = null;
    this.currentCell = null;
    this.lkSubmissions.clear();
    this.lkRevealIndex = -1;
    this.clearTimer();
    if (this.lkRevealInterval) {
      clearInterval(this.lkRevealInterval);
      this.lkRevealInterval = null;
    }
  }

  // ── Code Serpent ──

  initCodeSerpent(io: Server): void {
    const config = getGameConfig(this.gameType);
    if (!config || config.gameMode !== "code-serpent") return;

    this.csEngine = new ArenaEngine(
      config.scenarios,
      {
        onTick: (delta) => {
          io.to(this.gameId).volatile.emit("cs:tick", delta);
        },
        onSync: (sync) => {
          io.to(this.gameId).emit("cs:sync", sync);
        },
        onPillFeedback: (playerId, pill, correct, points) => {
          io.to(playerId).emit("cs:pill-feedback", { pill, correct, points });
        },
        onRoundEnd: (results, scenario, scores) => {
          io.to(this.gameId).emit("cs:round-end", {
            results,
            teachingNote: scenario.teachingNote,
            correctCodes: scenario.correctCodes,
            scores,
          });
        },
        onCountdownTick: (secondsLeft) => {
          io.to(this.gameId).emit("cs:countdown", { secondsLeft });
        },
        onPhaseChange: (phase, data) => {
          this.phase = phase === "game_over" ? "game_over" : phase;
          io.to(this.gameId).emit("game:phase-change", {
            phase: this.phase,
            scores: this.getScores(),
            ...(data || {}),
          });
        },
      },
      config.arenaConfig
    );

    // Add all connected players to the engine
    for (const [, player] of this.players) {
      if (player.isConnected) {
        this.csEngine.addPlayer(player.id, player.name);
      }
    }
  }

  cleanupCodeSerpent(): void {
    if (this.csEngine) {
      this.csEngine.destroy();
      this.csEngine = null;
    }
  }

  csSetDirection(playerId: string, direction: Direction): void {
    this.csEngine?.setDirection(playerId, direction);
  }

  csStartNextRound(): void {
    this.csEngine?.startNextRound();
  }

  csSkipRound(): void {
    this.csEngine?.skipRound();
  }

  // ── Jeopardy buzz/judge ──

  buzz(playerId: string): number {
    if (this.buzzQueue.some((b) => b.playerId === playerId)) return -1;
    if (this.failedBuzzers.has(playerId)) return -1;
    this.buzzQueue.push({ playerId, timestamp: Date.now() });
    return this.buzzQueue.length - 1;
  }

  getFirstBuzzer(): { playerId: string; timestamp: number } | null {
    return this.buzzQueue[0] ?? null;
  }

  lockBuzzer(playerId: string): void {
    this.activeBuzzer = playerId;
    this.phase = "buzz_locked";
  }

  judgeAnswer(correct: boolean): { player: Player; delta: number } | null {
    if (!this.activeBuzzer) return null;
    const player = this.players.get(this.activeBuzzer);
    if (!player || !this.currentCell) return null;

    const pointValue = POINT_VALUES[this.currentCell.val];
    let delta: number;

    if (this.phase === "daily_double" && this.dailyDoubleWager !== null) {
      delta = correct ? this.dailyDoubleWager : -this.dailyDoubleWager;
    } else {
      delta = correct ? pointValue : -pointValue;
    }

    player.score += delta;

    if (correct) {
      player.streak += 1;
      player.correctCount += 1;
      if (player.streak > player.bestStreak) {
        player.bestStreak = player.streak;
      }
    } else {
      player.streak = 0;
      player.wrongCount += 1;
    }

    return { player, delta };
  }

  nextBuzzer(): { playerId: string; playerName: string } | null {
    if (this.activeBuzzer) {
      this.buzzQueue = this.buzzQueue.filter(
        (b) => b.playerId !== this.activeBuzzer
      );
    }
    this.activeBuzzer = null;

    const next = this.buzzQueue[0];
    if (!next) return null;

    const player = this.players.get(next.playerId);
    if (!player) return null;

    this.activeBuzzer = next.playerId;
    return { playerId: next.playerId, playerName: player.name };
  }

  // ── Shared scoring ──

  getScores(): PlayerScore[] {
    const scores = Array.from(this.players.values())
      .map((p) => ({
        id: p.id,
        name: p.name,
        score: p.score,
        streak: p.streak,
        bestStreak: p.bestStreak,
        correctCount: p.correctCount,
        wrongCount: p.wrongCount,
        rank: 0,
      }))
      .sort((a, b) => b.score - a.score);

    scores.forEach((s, i) => {
      s.rank = i + 1;
    });

    return scores;
  }

  // ── Jeopardy reveal data ──

  getQuestionRevealData(): QuestionRevealData | null {
    if (!this.currentQuestion || !this.currentCell) return null;
    return {
      clue: this.currentQuestion.clue,
      correctResponse: this.currentQuestion.correctResponse,
      code: this.currentQuestion.code,
      codeType: this.currentQuestion.codeType,
      category: this.currentQuestion.category,
      pointValue: POINT_VALUES[this.currentCell.val],
      mnemonic: this.currentQuestion.mnemonic,
      fact: this.currentQuestion.fact,
    };
  }

  getBoardData(): BoardData {
    return {
      categories: this.categories,
      cells: this.board,
    };
  }

  isAllRevealed(): boolean {
    for (const catCells of this.board) {
      for (const cell of catCells) {
        if (!cell.isRevealed) return false;
      }
    }
    return true;
  }

  // ── Shared state ──

  getGameMeta(): GameMeta {
    const config = getGameConfig(this.gameType);
    return {
      title: config?.title ?? "CPT Games",
      subtitle: config?.subtitle ?? "",
      gameMode: this.gameMode,
    };
  }

  getSnapshot(): GameStateSnapshot {
    return {
      gameId: this.gameId,
      phase: this.phase,
      players: Array.from(this.players.values()),
      board: this.board.length > 0 ? this.getBoardData() : null,
      currentQuestion:
        this.phase === "answer_reveal" ? this.getQuestionRevealData() : null,
      currentCell: this.currentCell,
      buzzedPlayer: this.activeBuzzer
        ? {
            id: this.activeBuzzer,
            name: this.players.get(this.activeBuzzer)?.name ?? "",
          }
        : null,
      scores: this.getScores(),
      gameMeta: this.getGameMeta(),
      lkBoard: this.lkBoard.length > 0 ? this.getLockAndKeyBoardData() : null,
      lkCurrentRound: this.lkCurrentRound ? this.getLockAndKeyRoundClientData() : null,
      lkTimerRemaining: this.lkTimerRemaining > 0 ? this.lkTimerRemaining : null,
      csRound: this.csEngine ? this.csEngine.getCurrentRound() : null,
      csTotalRounds: this.csEngine ? this.csEngine.getTotalRounds() : null,
      csScenarioText: this.csEngine ? this.csEngine.getCurrentScenarioText() : null,
    };
  }

  allPlayersFailed(): boolean {
    for (const player of this.players.values()) {
      if (player.isConnected && !this.failedBuzzers.has(player.id)) {
        return false;
      }
    }
    return true;
  }

  isHost(socketId: string): boolean {
    return socketId === this.hostSocketId || this.controlSocketIds.has(socketId);
  }

  addControlSocket(socketId: string): void {
    this.controlSocketIds.add(socketId);
  }

  removeControlSocket(socketId: string): void {
    this.controlSocketIds.delete(socketId);
  }

  getCurrentAnswerData(): {
    correctResponse: string;
    code: string;
    codeType: string;
    mnemonic?: string;
    fact?: string;
  } | null {
    if (!this.currentQuestion) return null;
    return {
      correctResponse: this.currentQuestion.correctResponse,
      code: this.currentQuestion.code,
      codeType: this.currentQuestion.codeType,
      mnemonic: this.currentQuestion.mnemonic,
      fact: this.currentQuestion.fact,
    };
  }
}
