import { Server, Socket } from "socket.io";
import { GameManager } from "./GameManager";
import { POINT_VALUES, TIMER_DURATION_MS, ANSWER_TIMER_MS, Direction } from "../data/types";
import { getGameConfig } from "../data/games";

export function registerSocketHandlers(
  io: Server,
  socket: Socket,
  gameManager: GameManager
) {
  // ─── HOST EVENTS ───

  socket.on("host:create-game", ({ gameType }: { gameType: string }, callback: (data: { gameId: string }) => void) => {
    const config = getGameConfig(gameType);
    if (!config) {
      console.error(`Unknown game type: ${gameType}`);
      return;
    }
    const gameId = gameManager.createRoom(socket.id, gameType);
    socket.join(gameId);
    console.log(`[Game ${gameId}] Created by host ${socket.id} (${config.title} — ${config.subtitle})`);
    callback({ gameId });
  });

  socket.on(
    "host:join-control",
    (
      { gameId, password }: { gameId: string; password: string },
      callback: (data: { success: boolean; error?: string }) => void
    ) => {
      const room = gameManager.getRoom(gameId);
      if (!room) {
        callback({ success: false, error: "Game not found." });
        return;
      }
      const config = getGameConfig(room.gameType);
      if (!config || password !== config.password) {
        callback({ success: false, error: "Incorrect password." });
        return;
      }
      room.addControlSocket(socket.id);
      socket.join(gameId);
      callback({ success: true });

      // Send current state
      socket.emit("game:state-sync", room.getSnapshot());

      // If a question is active, also send the answer
      if (room.gameMode === "jeopardy") {
        const answerData = room.getCurrentAnswerData();
        if (answerData && room.phase !== "lobby" && room.phase !== "board" && room.phase !== "game_over") {
          socket.emit("game:host-clue-data", answerData);
        }
      } else if (room.gameMode === "lock-and-key") {
        if (room.lkCurrentRound && (room.phase === "lk_playing" || room.phase === "lk_revealing" || room.phase === "lk_round_results")) {
          socket.emit("lk:host-round-data", room.lkCurrentRound);
        }
      } else if (room.gameMode === "code-serpent" && room.csEngine) {
        if (room.phase === "cs_playing") {
          socket.emit("cs:sync", room.csEngine.getFullSync());
        }
      }
      console.log(`[Game ${gameId}] Control view connected: ${socket.id}`);
    }
  );

  socket.on("host:start-game", ({ gameId }: { gameId: string }) => {
    const room = gameManager.getRoom(gameId);
    if (!room || !room.isHost(socket.id)) return;
    if (room.phase !== "lobby") return;

    if (room.gameMode === "code-serpent") {
      room.initCodeSerpent(io);
      room.csStartNextRound();
      console.log(`[Game ${gameId}] Code Serpent started with ${room.players.size} players`);
    } else if (room.gameMode === "lock-and-key") {
      room.generateLockAndKeyBoard();
      room.phase = "board";
      io.to(gameId).emit("game:phase-change", {
        phase: "board",
        lkBoard: room.getLockAndKeyBoardData(),
        scores: room.getScores(),
        gameMeta: room.getGameMeta(),
      });
    } else {
      room.generateBoard();
      room.phase = "board";
      io.to(gameId).emit("game:phase-change", {
        phase: "board",
        board: room.getBoardData(),
        scores: room.getScores(),
        gameMeta: room.getGameMeta(),
      });
    }
    console.log(`[Game ${gameId}] Started with ${room.players.size} players (${room.gameMode})`);
  });

  socket.on(
    "host:select-cell",
    ({ gameId, cat, val }: { gameId: string; cat: number; val: number }) => {
      const room = gameManager.getRoom(gameId);
      if (!room || !room.isHost(socket.id)) return;
      if (room.phase !== "board") return;

      // ── Lock & Key mode ──
      if (room.gameMode === "lock-and-key") {
        const round = room.selectLockAndKeyCell(cat, val);
        if (!round) return;

        room.phase = "lk_playing";

        // Send round data WITHOUT answers to all players
        io.to(gameId).emit("game:phase-change", {
          phase: "lk_playing",
          lkRound: room.getLockAndKeyRoundClientData(),
          timer: room.lkTimerRemaining,
          cell: { cat, val },
        });
        io.to(gameId).emit("room:cell-revealed", { cat, val });

        // Send full round data WITH answers to host + control
        const hostSockets = [room.hostSocketId, ...room.controlSocketIds];
        for (const sid of hostSockets) {
          io.to(sid).emit("lk:host-round-data", room.lkCurrentRound);
        }

        // Start server timer
        room.startTimer(io, gameId);
        console.log(`[Game ${gameId}] Lock & Key round: CPT ${round.cptCode}`);
        return;
      }

      // ── Jeopardy mode ──
      const cell = room.board[cat]?.[val];
      if (!cell || cell.isRevealed) return;

      const question = room.selectCell(cat, val);
      if (!question) return;

      // Send answer data to host + control sockets
      const answerData = room.getCurrentAnswerData();
      const hostSockets = [room.hostSocketId, ...room.controlSocketIds];
      for (const sid of hostSockets) {
        io.to(sid).emit("game:host-clue-data", answerData);
      }

      // Check for Daily Double
      if (cell.isDailyDouble) {
        room.phase = "daily_double";
        io.to(gameId).emit("game:phase-change", {
          phase: "daily_double",
          cell: { cat, val },
          clue: question.clue,
          category: question.category,
          pointValue: POINT_VALUES[val],
        });
        io.to(gameId).emit("room:cell-revealed", { cat, val });
        console.log(`[Game ${gameId}] Daily Double at ${cat},${val}`);
        return;
      }

      room.phase = "question";
      io.to(gameId).emit("game:phase-change", {
        phase: "question",
        clue: question.clue,
        category: question.category,
        pointValue: POINT_VALUES[val],
        cell: { cat, val },
      });
      io.to(gameId).emit("room:cell-revealed", { cat, val });

      // Auto-open buzzers
      room.phase = "buzz_open";
      io.to(gameId).emit("game:buzz-open", {
        duration: TIMER_DURATION_MS,
      });
      console.log(`[Game ${gameId}] Question selected: ${question.code}`);
    }
  );

  socket.on(
    "host:judge-answer",
    ({
      gameId,
      correct,
    }: {
      gameId: string;
      correct: boolean;
    }) => {
      const room = gameManager.getRoom(gameId);
      if (!room || !room.isHost(socket.id)) return;
      if (!room.activeBuzzer) return;

      const result = room.judgeAnswer(correct);
      if (!result) return;

      const scores = room.getScores();

      // Notify the specific player
      io.to(result.player.id).emit("game:answer-result", {
        correct,
        pointsDelta: result.delta,
        newScore: result.player.score,
      });

      // Broadcast scores
      io.to(gameId).emit("game:scores-updated", { scores });

      // Broadcast who answered and whether they were correct
      io.to(gameId).emit("game:judge-result", {
        playerName: result.player.name,
        correct,
        delta: result.delta,
      });

      if (correct) {
        // Correct: move to answer reveal
        room.phase = "answer_reveal";
        const revealData = room.getQuestionRevealData();
        io.to(gameId).emit("game:phase-change", {
          phase: "answer_reveal",
          ...revealData,
          scores,
          answeredBy: result.player.name,
          wasCorrect: true,
        });
      } else {
        // Incorrect: mark this player as failed and try next buzzer
        room.failedBuzzers.add(result.player.id);
        const next = room.nextBuzzer();
        if (next) {
          room.phase = "buzz_locked";
          io.to(gameId).emit("game:buzz-in", {
            playerId: next.playerId,
            playerName: next.playerName,
          });
          io.to(next.playerId).emit("game:your-turn", {
            timeLimit: ANSWER_TIMER_MS,
          });
        } else if (room.allPlayersFailed()) {
          room.activeBuzzer = null;
          room.phase = "question";
          io.to(gameId).emit("game:no-more-buzzers", {});
        } else {
          room.activeBuzzer = null;
          room.phase = "buzz_open";
          io.to(gameId).emit("game:buzz-open", {
            duration: TIMER_DURATION_MS,
          });
        }
      }
      console.log(
        `[Game ${gameId}] ${result.player.name}: ${correct ? "correct" : "incorrect"} (${result.delta > 0 ? "+" : ""}${result.delta})`
      );
    }
  );

  socket.on("host:reveal-answer", ({ gameId }: { gameId: string }) => {
    const room = gameManager.getRoom(gameId);
    if (!room || !room.isHost(socket.id)) return;

    room.phase = "answer_reveal";
    const revealData = room.getQuestionRevealData();
    const scores = room.getScores();

    io.to(gameId).emit("game:phase-change", {
      phase: "answer_reveal",
      ...revealData,
      scores,
      answeredBy: null,
      wasCorrect: false,
    });
  });

  socket.on("host:return-to-board", ({ gameId }: { gameId: string }) => {
    const room = gameManager.getRoom(gameId);
    if (!room || !room.isHost(socket.id)) return;

    if (room.gameMode === "code-serpent") {
      room.csStartNextRound();
      return;
    }

    if (room.gameMode === "lock-and-key") {
      room.cleanupLkRound();

      if (room.isAllLkRevealed()) {
        room.phase = "game_over";
        io.to(gameId).emit("game:phase-change", {
          phase: "game_over",
          scores: room.getScores(),
        });
        console.log(`[Game ${gameId}] Game over!`);
      } else {
        room.phase = "board";
        io.to(gameId).emit("game:phase-change", {
          phase: "board",
          lkBoard: room.getLockAndKeyBoardData(),
          scores: room.getScores(),
        });
      }
      return;
    }

    // Jeopardy mode
    room.currentQuestion = null;
    room.currentCell = null;
    room.buzzQueue = [];
    room.activeBuzzer = null;
    room.dailyDoubleWager = null;
    room.dailyDoublePlayer = null;

    if (room.isAllRevealed()) {
      room.phase = "game_over";
      io.to(gameId).emit("game:phase-change", {
        phase: "game_over",
        scores: room.getScores(),
      });
      console.log(`[Game ${gameId}] Game over!`);
    } else {
      room.phase = "board";
      io.to(gameId).emit("game:phase-change", {
        phase: "board",
        board: room.getBoardData(),
        scores: room.getScores(),
      });
    }
  });

  socket.on("host:skip-question", ({ gameId }: { gameId: string }) => {
    const room = gameManager.getRoom(gameId);
    if (!room || !room.isHost(socket.id)) return;

    room.phase = "answer_reveal";
    const revealData = room.getQuestionRevealData();
    io.to(gameId).emit("game:phase-change", {
      phase: "answer_reveal",
      ...revealData,
      scores: room.getScores(),
      answeredBy: null,
      wasCorrect: false,
    });
  });

  socket.on("host:end-game", ({ gameId }: { gameId: string }) => {
    const room = gameManager.getRoom(gameId);
    if (!room || !room.isHost(socket.id)) return;

    // Clean up any running timers
    room.clearTimer();
    if (room.lkRevealInterval) {
      clearInterval(room.lkRevealInterval);
      room.lkRevealInterval = null;
    }
    room.cleanupCodeSerpent();

    room.phase = "game_over";
    io.to(gameId).emit("game:phase-change", {
      phase: "game_over",
      scores: room.getScores(),
    });
    console.log(`[Game ${gameId}] Host ended game`);
  });

  // ─── LOCK & KEY HOST EVENTS ───

  socket.on("host:lk-start-reveal", ({ gameId }: { gameId: string }) => {
    const room = gameManager.getRoom(gameId);
    if (!room || !room.isHost(socket.id)) return;
    if (room.phase !== "lk_playing") return;

    room.clearTimer();
    room.autoSubmitRemaining();
    room.phase = "lk_revealing";
    io.to(gameId).emit("game:phase-change", { phase: "lk_revealing" });
    room.startRevealSequence(io, gameId);
    console.log(`[Game ${gameId}] Host started reveal`);
  });

  // ─── PLAYER EVENTS ───

  socket.on(
    "player:join",
    (
      { gameId, name }: { gameId: string; name: string },
      callback: (data: { success: boolean; error?: string; playerId?: string }) => void
    ) => {
      const room = gameManager.getRoom(gameId);
      if (!room) {
        callback({ success: false, error: "Game not found. Check the code and try again." });
        return;
      }
      if (room.phase !== "lobby") {
        // Allow rejoin if player was disconnected
        const rejoined = room.rejoinPlayer(name, socket.id);
        if (rejoined) {
          socket.join(gameId);
          callback({ success: true, playerId: socket.id });
          io.to(room.hostSocketId).emit("game:player-reconnected", {
            playerId: socket.id,
            playerName: name,
          });
          socket.emit("game:state-sync", room.getSnapshot());
          console.log(`[Game ${gameId}] ${name} reconnected`);
          return;
        }
        callback({ success: false, error: "Game already in progress." });
        return;
      }

      const player = room.addPlayer(socket.id, name);
      if (!player) {
        const maxPlayers = room.gameMode === "lock-and-key" ? 30 : 20;
        callback({
          success: false,
          error: `Name already taken or game is full (max ${maxPlayers} players).`,
        });
        return;
      }

      socket.join(gameId);
      callback({ success: true, playerId: socket.id });

      // Notify host
      io.to(room.hostSocketId).emit("game:player-joined", {
        player,
        playerCount: room.players.size,
      });
      console.log(`[Game ${gameId}] ${name} joined (${room.players.size} players)`);
    }
  );

  socket.on(
    "player:buzz",
    ({ gameId }: { gameId: string }) => {
      const room = gameManager.getRoom(gameId);
      if (!room) return;
      if (room.phase !== "buzz_open" && room.phase !== "question") return;

      const position = room.buzz(socket.id);
      if (position < 0) return;

      const player = room.players.get(socket.id);
      if (!player) return;

      socket.emit("game:buzz-result", {
        position,
        isFirst: position === 0,
      });

      if (position === 0) {
        room.lockBuzzer(socket.id);
        io.to(gameId).emit("game:buzz-in", {
          playerId: socket.id,
          playerName: player.name,
        });
        socket.emit("game:your-turn", {
          timeLimit: ANSWER_TIMER_MS,
        });
      }
    }
  );

  socket.on(
    "player:daily-double-wager",
    ({ gameId, wager }: { gameId: string; wager: number }) => {
      const room = gameManager.getRoom(gameId);
      if (!room) return;
      if (room.phase !== "daily_double") return;

      const player = room.players.get(socket.id);
      if (!player) return;

      const maxWager = Math.max(player.score, 1000);
      room.dailyDoubleWager = Math.max(5, Math.min(wager, maxWager));
      room.dailyDoublePlayer = socket.id;
      room.activeBuzzer = socket.id;
      room.phase = "buzz_locked";

      io.to(gameId).emit("game:daily-double-wager-set", {
        playerName: player.name,
        wager: room.dailyDoubleWager,
      });
      io.to(gameId).emit("game:buzz-in", {
        playerId: socket.id,
        playerName: player.name,
      });
      socket.emit("game:your-turn", {
        timeLimit: ANSWER_TIMER_MS,
      });
    }
  );

  // ─── LOCK & KEY PLAYER EVENTS ───

  socket.on(
    "player:lk-submit-selections",
    ({ gameId, selectedIndices }: { gameId: string; selectedIndices: number[] }) => {
      const room = gameManager.getRoom(gameId);
      if (!room) return;
      if (room.phase !== "lk_playing") return;
      if (!room.players.has(socket.id)) return;

      const count = room.submitSelection(socket.id, selectedIndices);
      io.to(gameId).emit("lk:submission-count", count);

      console.log(`[Game ${gameId}] ${room.players.get(socket.id)?.name} submitted (${count.submitted}/${count.total})`);

      // If all submitted, start reveal immediately
      if (room.allSubmitted()) {
        room.clearTimer();
        room.phase = "lk_revealing";
        io.to(gameId).emit("game:phase-change", { phase: "lk_revealing" });
        room.startRevealSequence(io, gameId);
        console.log(`[Game ${gameId}] All submitted, starting reveal`);
      }
    }
  );

  // ─── CODE SERPENT EVENTS ───

  socket.on(
    "player:cs-direction",
    ({ gameId, direction }: { gameId: string; direction: Direction }) => {
      const room = gameManager.getRoom(gameId);
      if (!room) return;
      if (room.phase !== "cs_playing") return;
      room.csSetDirection(socket.id, direction);
    }
  );

  socket.on("host:cs-next-round", ({ gameId }: { gameId: string }) => {
    const room = gameManager.getRoom(gameId);
    if (!room || !room.isHost(socket.id)) return;
    if (room.phase !== "cs_round_results") return;
    room.csStartNextRound();
  });

  socket.on("host:cs-skip-round", ({ gameId }: { gameId: string }) => {
    const room = gameManager.getRoom(gameId);
    if (!room || !room.isHost(socket.id)) return;
    if (room.phase !== "cs_playing") return;
    room.csSkipRound();
  });

  // ─── DISCONNECT ───

  socket.on("disconnect", () => {
    for (const [gameId, room] of gameManager.getAllRooms()) {
      if (room.controlSocketIds.has(socket.id)) {
        room.removeControlSocket(socket.id);
        console.log(`[Game ${gameId}] Control view disconnected`);
      } else if (room.hostSocketId === socket.id) {
        io.to(gameId).emit("game:host-disconnected", {});
        console.log(`[Game ${gameId}] Host disconnected`);
      } else if (room.players.has(socket.id)) {
        const player = room.players.get(socket.id)!;
        room.removePlayer(socket.id);
        io.to(room.hostSocketId).emit("game:player-disconnected", {
          playerId: socket.id,
          playerName: player.name,
        });
        console.log(`[Game ${gameId}] ${player.name} disconnected`);
      }
    }
  });
}
