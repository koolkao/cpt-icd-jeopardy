import {
  ArenaConfig,
  ArenaScenario,
  ArenaTickDelta,
  ArenaFullSync,
  ArenaEvent,
  ArenaRoundResult,
  CodePill,
  Direction,
  SnakeState,
  CS_DEFAULT_ARENA_CONFIG,
  CS_SNAKE_COLORS,
} from "../data/types";

const OPPOSITE: Record<Direction, Direction> = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
};

const DIR_DELTA: Record<Direction, { dx: number; dy: number }> = {
  up: { dx: 0, dy: -1 },
  down: { dx: 0, dy: 1 },
  left: { dx: -1, dy: 0 },
  right: { dx: 1, dy: 0 },
};

export interface ArenaEngineCallbacks {
  onTick: (delta: ArenaTickDelta) => void;
  onSync: (sync: ArenaFullSync) => void;
  onPillFeedback: (playerId: string, pill: CodePill, correct: boolean, points: number) => void;
  onRoundEnd: (results: ArenaRoundResult[], scenario: ArenaScenario, scores: { playerId: string; playerName: string; score: number }[]) => void;
  onCountdownTick: (secondsLeft: number) => void;
  onPhaseChange: (phase: "cs_countdown" | "cs_playing" | "cs_round_results" | "game_over", data?: Record<string, unknown>) => void;
}

export class ArenaEngine {
  private config: ArenaConfig;
  private scenarios: ArenaScenario[];
  private callbacks: ArenaEngineCallbacks;

  private snakes: Map<string, SnakeState> = new Map();
  private pills: Map<string, CodePill> = new Map();
  private snakeGrid: (string | null)[][] = [];
  private pillGrid: (string | null)[][] = [];

  private currentRound: number = 0;
  private currentScenario: ArenaScenario | null = null;
  private roundTimeRemainingMs: number = 0;
  private roundStartScores: Map<string, number> = new Map();

  private tickInterval: ReturnType<typeof setInterval> | null = null;
  private syncInterval: ReturnType<typeof setInterval> | null = null;
  private countdownInterval: ReturnType<typeof setInterval> | null = null;

  private tickCount: number = 0;
  private pillIdCounter: number = 0;
  private colorIndex: number = 0;

  // Track per-round stats
  private roundStats: Map<string, { correct: number; wrong: number; collisions: number }> = new Map();

  constructor(
    scenarios: ArenaScenario[],
    callbacks: ArenaEngineCallbacks,
    configOverrides?: Partial<ArenaConfig>
  ) {
    this.config = { ...CS_DEFAULT_ARENA_CONFIG, ...configOverrides };
    this.scenarios = scenarios;
    this.callbacks = callbacks;
    this.initGrids();
  }

  private initGrids(): void {
    this.snakeGrid = Array.from({ length: this.config.gridWidth }, () =>
      Array(this.config.gridHeight).fill(null)
    );
    this.pillGrid = Array.from({ length: this.config.gridWidth }, () =>
      Array(this.config.gridHeight).fill(null)
    );
  }

  // ── Player management ──

  addPlayer(playerId: string, playerName: string): void {
    if (this.snakes.has(playerId)) return;
    const color = CS_SNAKE_COLORS[this.colorIndex % CS_SNAKE_COLORS.length];
    this.colorIndex++;

    const spawn = this.findSpawnPoint();
    const segments: { x: number; y: number }[] = [];
    for (let i = 0; i < this.config.initialSnakeLength; i++) {
      segments.push({ x: spawn.x, y: spawn.y + i });
    }

    const snake: SnakeState = {
      playerId,
      playerName,
      segments,
      direction: "up",
      color,
      alive: true,
      respawnAt: null,
      invincibleUntil: 0,
      score: 0,
    };

    this.snakes.set(playerId, snake);
    this.placeSnakeOnGrid(snake);
  }

  removePlayer(playerId: string): void {
    const snake = this.snakes.get(playerId);
    if (snake) {
      this.clearSnakeFromGrid(snake);
      this.snakes.delete(playerId);
    }
  }

  // ── Direction changes ──

  setDirection(playerId: string, direction: Direction): void {
    const snake = this.snakes.get(playerId);
    if (!snake || !snake.alive) return;
    // Prevent 180-degree turns
    if (OPPOSITE[direction] === snake.direction) return;
    snake.direction = direction;
  }

  // ── Round lifecycle ──

  startNextRound(): void {
    this.currentRound++;
    if (this.currentRound > Math.min(this.config.totalRounds, this.scenarios.length)) {
      this.endGame();
      return;
    }

    this.currentScenario = this.scenarios[this.currentRound - 1];
    this.roundStats.clear();
    for (const [id] of this.snakes) {
      this.roundStats.set(id, { correct: 0, wrong: 0, collisions: 0 });
    }

    // Record start scores
    this.roundStartScores.clear();
    for (const [id, snake] of this.snakes) {
      this.roundStartScores.set(id, snake.score);
    }

    // Start countdown
    this.startCountdown();
  }

  private startCountdown(): void {
    let secondsLeft = this.config.countdownS;

    this.callbacks.onPhaseChange("cs_countdown", {
      round: this.currentRound,
      totalRounds: Math.min(this.config.totalRounds, this.scenarios.length),
      scenarioText: this.currentScenario?.scenarioText ?? "",
      category: this.currentScenario?.category ?? "",
    });
    this.callbacks.onCountdownTick(secondsLeft);

    this.countdownInterval = setInterval(() => {
      secondsLeft--;
      this.callbacks.onCountdownTick(secondsLeft);
      if (secondsLeft <= 0) {
        if (this.countdownInterval) {
          clearInterval(this.countdownInterval);
          this.countdownInterval = null;
        }
        this.startArenaPhase();
      }
    }, 1000);
  }

  private startArenaPhase(): void {
    // Reset arena
    this.clearGrids();
    this.pills.clear();

    // Respawn all snakes
    for (const [, snake] of this.snakes) {
      const spawn = this.findSpawnPoint();
      snake.segments = [];
      for (let i = 0; i < this.config.initialSnakeLength; i++) {
        snake.segments.push({ x: spawn.x, y: spawn.y + i });
      }
      snake.direction = "up";
      snake.alive = true;
      snake.respawnAt = null;
      snake.invincibleUntil = Date.now() + this.config.invincibilityMs;
      this.placeSnakeOnGrid(snake);
    }

    // Spawn pills
    for (let i = 0; i < this.config.pillCount; i++) {
      this.spawnPill();
    }

    this.roundTimeRemainingMs = this.config.roundDurationS * 1000;
    this.tickCount = 0;

    this.callbacks.onPhaseChange("cs_playing", {
      round: this.currentRound,
      totalRounds: Math.min(this.config.totalRounds, this.scenarios.length),
      scenarioText: this.currentScenario?.scenarioText ?? "",
      category: this.currentScenario?.category ?? "",
    });

    // Send initial full sync
    this.callbacks.onSync(this.getFullSync());

    // Start tick loop at 10Hz
    this.tickInterval = setInterval(() => this.tick(), this.config.tickRateMs);

    // Start sync loop at 2Hz
    this.syncInterval = setInterval(() => {
      this.callbacks.onSync(this.getFullSync());
    }, 500);
  }

  private tick(): void {
    const now = Date.now();
    const events: ArenaEvent[] = [];

    this.roundTimeRemainingMs -= this.config.tickRateMs;
    if (this.roundTimeRemainingMs <= 0) {
      this.endRound();
      return;
    }

    // Process respawns
    for (const [, snake] of this.snakes) {
      if (!snake.alive && snake.respawnAt && now >= snake.respawnAt) {
        this.respawnSnake(snake);
        events.push({
          type: "respawn",
          playerId: snake.playerId,
          x: snake.segments[0].x,
          y: snake.segments[0].y,
        });
      }
    }

    // Move all alive snakes
    for (const [, snake] of this.snakes) {
      if (!snake.alive) continue;

      const head = snake.segments[0];
      const delta = DIR_DELTA[snake.direction];
      const newHead = { x: head.x + delta.dx, y: head.y + delta.dy };

      // Wall collision
      if (
        newHead.x < 0 ||
        newHead.x >= this.config.gridWidth ||
        newHead.y < 0 ||
        newHead.y >= this.config.gridHeight
      ) {
        this.handleWallHit(snake, events);
        continue;
      }

      // Snake-snake collision (check grid before moving)
      const occupant = this.snakeGrid[newHead.x][newHead.y];
      if (occupant && occupant !== snake.playerId) {
        this.handleSnakeCollision(snake, occupant, newHead, events, now);
        continue;
      }

      // Self-collision (head hits own body, but not the tail which is about to move)
      if (occupant === snake.playerId) {
        // Check if it's the last segment (tail about to vacate)
        const tail = snake.segments[snake.segments.length - 1];
        if (!(newHead.x === tail.x && newHead.y === tail.y)) {
          // Self-collision
          this.handleWallHit(snake, events);
          continue;
        }
      }

      // Move: add new head, remove tail
      this.clearSnakeFromGrid(snake);
      snake.segments.unshift(newHead);
      snake.segments.pop();
      this.placeSnakeOnGrid(snake);

      // Pill collection
      const pillId = this.pillGrid[newHead.x][newHead.y];
      if (pillId) {
        const pill = this.pills.get(pillId);
        if (pill) {
          this.collectPill(snake, pill, events);
        }
      }
    }

    this.tickCount++;

    // Emit tick delta
    const delta: ArenaTickDelta = {
      snakes: Array.from(this.snakes.values()).map((s) => ({
        playerId: s.playerId,
        headX: s.segments[0]?.x ?? 0,
        headY: s.segments[0]?.y ?? 0,
        direction: s.direction,
        length: s.segments.length,
        alive: s.alive,
        score: s.score,
      })),
      pills: Array.from(this.pills.values()),
      events,
      timeRemainingS: Math.ceil(this.roundTimeRemainingMs / 1000),
    };
    this.callbacks.onTick(delta);
  }

  // ── Collision handlers ──

  private handleWallHit(snake: SnakeState, events: ArenaEvent[]): void {
    const now = Date.now();
    if (now < snake.invincibleUntil) return;

    events.push({
      type: "wall_hit",
      playerId: snake.playerId,
      x: snake.segments[0].x,
      y: snake.segments[0].y,
    });

    this.shrinkSnake(snake, 1);
    // Bounce back: reverse direction
    snake.direction = OPPOSITE[snake.direction];

    if (snake.segments.length < 1) {
      this.killSnake(snake, now);
    }
  }

  private handleSnakeCollision(
    attacker: SnakeState,
    victimId: string,
    _hitPos: { x: number; y: number },
    events: ArenaEvent[],
    now: number
  ): void {
    if (now < attacker.invincibleUntil) return;

    const victim = this.snakes.get(victimId);

    events.push({
      type: "collision",
      playerId: attacker.playerId,
      x: attacker.segments[0].x,
      y: attacker.segments[0].y,
      otherPlayerId: victimId,
    });

    // Head-to-head check
    if (victim && victim.segments[0] && attacker.segments[0]) {
      const vHead = victim.segments[0];
      const aHead = attacker.segments[0];
      const aDelta = DIR_DELTA[attacker.direction];
      const newAHead = { x: aHead.x + aDelta.dx, y: aHead.y + aDelta.dy };

      if (victim.alive && newAHead.x === vHead.x && newAHead.y === vHead.y) {
        // Head-to-head: both lose 2 segments
        this.shrinkSnake(attacker, 2);
        this.shrinkSnake(victim, 2);
        attacker.score += this.config.collisionPoints;
        victim.score += this.config.collisionPoints;
        attacker.direction = OPPOSITE[attacker.direction];
        victim.direction = OPPOSITE[victim.direction];
        attacker.invincibleUntil = now + this.config.invincibilityMs;
        victim.invincibleUntil = now + this.config.invincibilityMs;

        const aStats = this.roundStats.get(attacker.playerId);
        if (aStats) aStats.collisions++;
        const vStats = this.roundStats.get(victimId);
        if (vStats) vStats.collisions++;

        if (attacker.segments.length < 1) this.killSnake(attacker, now);
        if (victim.segments.length < 1) this.killSnake(victim, now);
        return;
      }
    }

    // Head-to-body: attacker loses 2 segments
    this.shrinkSnake(attacker, 2);
    attacker.score += this.config.collisionPoints;
    attacker.direction = OPPOSITE[attacker.direction];
    attacker.invincibleUntil = now + this.config.invincibilityMs;

    const stats = this.roundStats.get(attacker.playerId);
    if (stats) stats.collisions++;

    if (attacker.segments.length < 1) {
      this.killSnake(attacker, now);
    }
  }

  private shrinkSnake(snake: SnakeState, amount: number): void {
    this.clearSnakeFromGrid(snake);
    for (let i = 0; i < amount && snake.segments.length > 1; i++) {
      snake.segments.pop();
    }
    this.placeSnakeOnGrid(snake);
  }

  private killSnake(snake: SnakeState, now: number): void {
    this.clearSnakeFromGrid(snake);
    snake.alive = false;
    snake.segments = [];
    snake.respawnAt = now + this.config.respawnDelayMs;
  }

  private respawnSnake(snake: SnakeState): void {
    const spawn = this.findSpawnPoint();
    snake.segments = [];
    for (let i = 0; i < this.config.initialSnakeLength; i++) {
      snake.segments.push({ x: spawn.x, y: spawn.y + i });
    }
    snake.direction = "up";
    snake.alive = true;
    snake.respawnAt = null;
    snake.invincibleUntil = Date.now() + this.config.invincibilityMs;
    this.placeSnakeOnGrid(snake);
  }

  // ── Pill system ──

  private collectPill(snake: SnakeState, pill: CodePill, events: ArenaEvent[]): void {
    const correct = pill.isCorrect;
    const points = correct ? this.config.correctPoints : this.config.wrongPoints;
    snake.score += points;

    events.push({
      type: correct ? "collect_correct" : "collect_wrong",
      playerId: snake.playerId,
      x: pill.x,
      y: pill.y,
      pillCode: pill.code,
    });

    const stats = this.roundStats.get(snake.playerId);
    if (stats) {
      if (correct) stats.correct++;
      else stats.wrong++;
    }

    // Grow or shrink
    if (correct) {
      // Add segment at tail
      const tail = snake.segments[snake.segments.length - 1];
      this.clearSnakeFromGrid(snake);
      snake.segments.push({ x: tail.x, y: tail.y });
      this.placeSnakeOnGrid(snake);
    } else {
      if (snake.segments.length > 1) {
        this.shrinkSnake(snake, 1);
      }
    }

    // Remove pill and spawn replacement
    this.pillGrid[pill.x][pill.y] = null;
    this.pills.delete(pill.id);
    this.spawnPill();

    this.callbacks.onPillFeedback(snake.playerId, pill, correct, points);
  }

  private spawnPill(): void {
    if (!this.currentScenario) return;

    const isCorrect = Math.random() < this.config.correctPillRatio;
    const pool = isCorrect
      ? this.currentScenario.correctCodes
      : this.currentScenario.incorrectCodes;

    if (pool.length === 0) return;

    const codeEntry = pool[Math.floor(Math.random() * pool.length)];
    const pos = this.findEmptyCell();
    if (!pos) return;

    const id = `pill-${this.pillIdCounter++}`;
    const pill: CodePill = {
      id,
      x: pos.x,
      y: pos.y,
      code: codeEntry.code,
      description: codeEntry.description,
      isCorrect,
    };

    this.pills.set(id, pill);
    this.pillGrid[pos.x][pos.y] = id;
  }

  // ── Grid helpers ──

  private clearGrids(): void {
    for (let x = 0; x < this.config.gridWidth; x++) {
      for (let y = 0; y < this.config.gridHeight; y++) {
        this.snakeGrid[x][y] = null;
        this.pillGrid[x][y] = null;
      }
    }
  }

  private placeSnakeOnGrid(snake: SnakeState): void {
    for (const seg of snake.segments) {
      if (seg.x >= 0 && seg.x < this.config.gridWidth && seg.y >= 0 && seg.y < this.config.gridHeight) {
        this.snakeGrid[seg.x][seg.y] = snake.playerId;
      }
    }
  }

  private clearSnakeFromGrid(snake: SnakeState): void {
    for (const seg of snake.segments) {
      if (seg.x >= 0 && seg.x < this.config.gridWidth && seg.y >= 0 && seg.y < this.config.gridHeight) {
        if (this.snakeGrid[seg.x][seg.y] === snake.playerId) {
          this.snakeGrid[seg.x][seg.y] = null;
        }
      }
    }
  }

  private findEmptyCell(): { x: number; y: number } | null {
    // Try random positions (up to 100 attempts)
    for (let i = 0; i < 100; i++) {
      const x = Math.floor(Math.random() * this.config.gridWidth);
      const y = Math.floor(Math.random() * this.config.gridHeight);
      if (!this.snakeGrid[x][y] && !this.pillGrid[x][y]) {
        return { x, y };
      }
    }
    return null;
  }

  private findSpawnPoint(): { x: number; y: number } {
    // Find a position at least 5 cells from other snakes
    for (let attempt = 0; attempt < 200; attempt++) {
      const x = 5 + Math.floor(Math.random() * (this.config.gridWidth - 10));
      const y = 5 + Math.floor(Math.random() * (this.config.gridHeight - 10));

      let tooClose = false;
      for (const [, other] of this.snakes) {
        if (!other.alive || other.segments.length === 0) continue;
        const head = other.segments[0];
        const dist = Math.abs(head.x - x) + Math.abs(head.y - y);
        if (dist < 5) {
          tooClose = true;
          break;
        }
      }

      if (!tooClose && !this.snakeGrid[x][y] && !this.pillGrid[x][y]) {
        return { x, y };
      }
    }

    // Fallback: center-ish
    return {
      x: Math.floor(this.config.gridWidth / 2),
      y: Math.floor(this.config.gridHeight / 2),
    };
  }

  // ── Round end ──

  private endRound(): void {
    this.stopTickLoops();

    const results: ArenaRoundResult[] = [];
    for (const [id, snake] of this.snakes) {
      const startScore = this.roundStartScores.get(id) ?? 0;
      const stats = this.roundStats.get(id) ?? { correct: 0, wrong: 0, collisions: 0 };
      results.push({
        playerId: id,
        playerName: snake.playerName,
        score: snake.score,
        correctCollections: stats.correct,
        wrongCollections: stats.wrong,
        collisions: stats.collisions,
        roundDelta: snake.score - startScore,
      });
    }

    results.sort((a, b) => b.score - a.score);

    const scores = Array.from(this.snakes.values()).map((s) => ({
      playerId: s.playerId,
      playerName: s.playerName,
      score: s.score,
    }));

    this.callbacks.onPhaseChange("cs_round_results", {
      round: this.currentRound,
      totalRounds: Math.min(this.config.totalRounds, this.scenarios.length),
    });

    this.callbacks.onRoundEnd(results, this.currentScenario!, scores);
  }

  private endGame(): void {
    this.stopTickLoops();
    this.callbacks.onPhaseChange("game_over");
  }

  skipRound(): void {
    this.stopTickLoops();
    this.endRound();
  }

  // ── Cleanup ──

  private stopTickLoops(): void {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
  }

  destroy(): void {
    this.stopTickLoops();
    this.snakes.clear();
    this.pills.clear();
  }

  // ── State accessors ──

  getFullSync(): ArenaFullSync {
    return {
      snakes: Array.from(this.snakes.values()),
      pills: Array.from(this.pills.values()),
      timeRemainingS: Math.ceil(this.roundTimeRemainingMs / 1000),
      round: this.currentRound,
    };
  }

  getCurrentRound(): number {
    return this.currentRound;
  }

  getTotalRounds(): number {
    return Math.min(this.config.totalRounds, this.scenarios.length);
  }

  getCurrentScenarioText(): string {
    return this.currentScenario?.scenarioText ?? "";
  }

  getScores(): { playerId: string; playerName: string; score: number }[] {
    return Array.from(this.snakes.values())
      .map((s) => ({
        playerId: s.playerId,
        playerName: s.playerName,
        score: s.score,
      }))
      .sort((a, b) => b.score - a.score);
  }
}
