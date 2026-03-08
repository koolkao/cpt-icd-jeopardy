import {
  GamePhase,
  Player,
  CellState,
  PlayerScore,
  QuestionRevealData,
  BoardData,
  GameStateSnapshot,
  POINT_VALUES,
  Question,
} from "../data/types";
import { questionBank, categories } from "../data/questions";

export class GameRoom {
  gameId: string;
  hostSocketId: string;
  phase: GamePhase = "lobby";
  players: Map<string, Player> = new Map();
  board: CellState[][] = [];
  categories: string[] = [];
  questionGrid: (Question | null)[][] = []; // [categoryIdx][valueIdx]
  currentQuestion: Question | null = null;
  currentCell: { cat: number; val: number } | null = null;
  buzzQueue: { playerId: string; timestamp: number }[] = [];
  activeBuzzer: string | null = null;
  failedBuzzers: Set<string> = new Set();
  dailyDoubleWager: number | null = null;
  dailyDoublePlayer: string | null = null;
  controlSocketIds: Set<string> = new Set();
  createdAt: number = Date.now();

  constructor(gameId: string, hostSocketId: string) {
    this.gameId = gameId;
    this.hostSocketId = hostSocketId;
  }

  addPlayer(socketId: string, name: string): Player | null {
    // Check for duplicate names
    for (const p of this.players.values()) {
      if (p.name.toLowerCase() === name.toLowerCase()) {
        return null;
      }
    }
    if (this.players.size >= 20) return null;

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

  generateBoard(): void {
    this.categories = categories.map((c) => c.name);
    this.board = [];
    this.questionGrid = [];

    for (let catIdx = 0; catIdx < 6; catIdx++) {
      this.board[catIdx] = [];
      this.questionGrid[catIdx] = [];
      const catQuestions = questionBank.filter(
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
    const ddVal = 1 + Math.floor(Math.random() * 4); // indices 1-4 ($400-$1000)
    this.board[ddCat][ddVal].isDailyDouble = true;
  }

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

  buzz(playerId: string): number {
    // Don't allow double-buzzing or re-buzzing after a wrong answer
    if (this.buzzQueue.some((b) => b.playerId === playerId)) return -1;
    if (this.failedBuzzers.has(playerId)) return -1;
    this.buzzQueue.push({ playerId, timestamp: Date.now() });
    return this.buzzQueue.length - 1; // position (0 = first)
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
    // Remove current buzzer from queue
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
