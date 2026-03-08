"use client";

import { useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { socket } from "@/lib/socket";
import { useHostStore } from "@/stores/hostStore";
import { useSocket } from "@/hooks/useSocket";
import { useSound } from "@/hooks/useSound";
import type { Player } from "@/data/types";
import JeopardyBoard from "@/components/board/JeopardyBoard";
import QuestionReveal from "@/components/board/QuestionReveal";
import Leaderboard from "@/components/leaderboard/Leaderboard";
import ConfettiEffect from "@/components/effects/ConfettiEffect";
import { QRCodeSVG } from "qrcode.react";
import { motion, AnimatePresence } from "framer-motion";

export default function HostGamePage() {
  const params = useParams();
  const gameId = params.gameId as string;
  const store = useHostStore();
  const sound = useSound();

  useEffect(() => {
    store.setGameId(gameId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId]);

  useSocket({
    "game:player-joined": ({ player }: { player: Player; playerCount: number }) => {
      store.addPlayer(player);
      sound.playBuzzIn();
    },
    "game:player-disconnected": ({ playerId }: { playerId: string }) => {
      store.removePlayer(playerId);
    },
    "game:player-reconnected": () => {
      // Player reconnected — state sync handles the rest
    },
    "game:phase-change": (data) => {
      store.setPhase(data.phase);
      if (data.board) store.setBoard(data.board);
      if (data.scores) store.setScores(data.scores);
      if (data.clue) {
        store.setQuestion(data.clue, data.category, data.pointValue, data.cell);
      }
      if (data.phase === "answer_reveal") {
        store.setRevealData(data);
      }
      if (data.phase === "daily_double") {
        sound.playDailyDouble();
        store.setQuestion(data.clue, data.category, data.pointValue, data.cell);
      }
      if (data.phase === "game_over") {
        sound.playVictory();
      }
    },
    "game:buzz-in": ({ playerId, playerName }) => {
      store.setBuzzedPlayer({ id: playerId, name: playerName });
      sound.playBuzzIn();
    },
    "game:scores-updated": ({ scores }) => {
      store.setScores(scores);
    },
    "game:no-more-buzzers": () => {
      store.setNoMoreBuzzers(true);
    },
    "room:cell-revealed": ({ cat, val }) => {
      store.revealCell(cat, val);
    },
  });

  const handleStartGame = useCallback(() => {
    socket.emit("host:start-game", { gameId });
  }, [gameId]);

  const handleSelectCell = useCallback(
    (cat: number, val: number) => {
      socket.emit("host:select-cell", { gameId, cat, val });
    },
    [gameId]
  );

  const handleJudge = useCallback(
    (correct: boolean) => {
      socket.emit("host:judge-answer", { gameId, correct });
      if (correct) {
        sound.playCorrect();
      } else {
        sound.playWrong();
      }
    },
    [gameId, sound]
  );

  const handleRevealAnswer = useCallback(() => {
    socket.emit("host:reveal-answer", { gameId });
  }, [gameId]);

  const handleReturnToBoard = useCallback(() => {
    socket.emit("host:return-to-board", { gameId });
    store.setBuzzedPlayer(null);
    store.setNoMoreBuzzers(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId]);

  const handleSkip = useCallback(() => {
    socket.emit("host:skip-question", { gameId });
  }, [gameId]);

  const handleEndGame = useCallback(() => {
    socket.emit("host:end-game", { gameId });
  }, [gameId]);

  // ─── LOBBY PHASE ───
  if (store.phase === "lobby") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-b from-jeopardy-navy via-jeopardy-dark to-jeopardy-blue">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-4xl md:text-6xl font-display font-bold gold-text mb-2">
            CPT & ICD-10 JEOPARDY!
          </h1>
          <p className="text-blue-200 text-lg mb-8">
            Pain Management Edition
          </p>

          <div className="mb-8 flex flex-col items-center">
            <p className="text-blue-200 text-sm mb-2">GAME CODE</p>
            <div className="text-6xl md:text-8xl font-mono font-bold gold-text tracking-[0.3em] bg-black/20 rounded-xl px-8 py-4 inline-block">
              {gameId}
            </div>
            <p className="text-blue-200/60 text-sm mt-4 mb-3">
              Scan to join
            </p>
            <div className="bg-white rounded-xl p-3 inline-block">
              <QRCodeSVG
                value={`https://cpt-icd-jeopardy-production.up.railway.app/?code=${gameId}`}
                size={180}
                level="M"
                bgColor="#ffffff"
                fgColor="#0a1628"
              />
            </div>
          </div>

          <div className="mb-8 bg-white/5 rounded-xl p-6 max-w-md mx-auto">
            <h3 className="text-white font-semibold mb-3">
              Players ({store.players.length}/20)
            </h3>
            {store.players.length === 0 ? (
              <p className="text-blue-200/50 text-sm">
                Waiting for players to join...
              </p>
            ) : (
              <div className="flex flex-wrap gap-2 justify-center">
                <AnimatePresence>
                  {store.players.map((p) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="px-3 py-1.5 bg-jeopardy-gold/20 border border-jeopardy-gold/40 rounded-full text-sm text-jeopardy-gold font-medium"
                    >
                      {p.name}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {store.players.length > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={handleStartGame}
              className="px-10 py-4 rounded-xl bg-jeopardy-gold text-jeopardy-navy font-bold text-xl hover:bg-jeopardy-gold-light hover:scale-105 transition-all shadow-lg"
            >
              START GAME
            </motion.button>
          )}

          <a
            href={`/host/${gameId}/control`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-block text-blue-200/60 text-sm underline hover:text-blue-200 transition-colors"
          >
            Open Host Control (see answers)
          </a>
        </motion.div>
      </div>
    );
  }

  // ─── GAME OVER ───
  if (store.phase === "game_over") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-b from-jeopardy-navy via-jeopardy-dark to-jeopardy-blue">
        <ConfettiEffect trigger={true} />
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", damping: 15 }}
          className="text-center mb-8"
        >
          <div className="text-6xl mb-4">👑</div>
          <h1 className="text-5xl md:text-7xl font-display font-bold gold-text mb-2">
            GAME OVER!
          </h1>
          {store.scores[0] && (
            <p className="text-2xl md:text-4xl text-white mt-4">
              Winner:{" "}
              <span className="gold-text font-bold">
                {store.scores[0].name}
              </span>
              <span className="text-jeopardy-gold/70 ml-3">
                ${store.scores[0].score.toLocaleString()}
              </span>
            </p>
          )}
        </motion.div>
        <Leaderboard scores={store.scores} isGameOver />
      </div>
    );
  }

  // ─── ANSWER REVEAL ───
  if (store.phase === "answer_reveal" && store.revealData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-b from-jeopardy-navy via-jeopardy-dark to-jeopardy-blue">
        <QuestionReveal
          data={store.revealData}
          answeredBy={store.answeredBy}
          wasCorrect={store.wasCorrect}
          onReturnToBoard={handleReturnToBoard}
        />
      </div>
    );
  }

  // ─── QUESTION / BUZZ PHASE ───
  if (
    store.phase === "question" ||
    store.phase === "buzz_open" ||
    store.phase === "buzz_locked" ||
    store.phase === "daily_double"
  ) {
    return (
      <div className="min-h-screen flex flex-col p-6 bg-gradient-to-b from-jeopardy-navy via-jeopardy-dark to-jeopardy-blue">
        {/* Category and value */}
        <div className="text-center mb-6">
          <p className="text-blue-200 text-sm uppercase tracking-wider">
            {store.currentCategory}
          </p>
          <p className="gold-text text-2xl font-bold">
            ${store.currentPointValue}
          </p>
        </div>

        {/* Clue */}
        <div className="flex-1 flex items-center justify-center px-4">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-2xl md:text-4xl lg:text-5xl text-white text-center font-display leading-relaxed max-w-4xl"
          >
            {store.currentClue}
          </motion.p>
        </div>

        {/* Buzz / Judge controls */}
        <div className="text-center mt-6 space-y-4">
          {store.buzzedPlayer && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-xl text-blue-200 mb-2">Buzzed in:</p>
              <p className="text-3xl md:text-5xl font-bold gold-text mb-4">
                {store.buzzedPlayer.name}
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => handleJudge(true)}
                  className="px-8 py-3 rounded-lg bg-correct text-white font-bold text-lg hover:bg-green-400 transition-colors"
                >
                  ✓ Correct
                </button>
                <button
                  onClick={() => handleJudge(false)}
                  className="px-8 py-3 rounded-lg bg-incorrect text-white font-bold text-lg hover:bg-red-400 transition-colors"
                >
                  ✗ Incorrect
                </button>
              </div>
            </motion.div>
          )}

          {!store.buzzedPlayer && store.noMoreBuzzers && (
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleRevealAnswer}
                className="px-8 py-3 rounded-lg bg-jeopardy-gold text-jeopardy-navy font-bold text-lg hover:bg-jeopardy-gold-light transition-colors"
              >
                Reveal Answer
              </button>
              <button
                onClick={handleSkip}
                className="px-6 py-3 rounded-lg bg-white/10 border border-white/20 text-white font-medium hover:bg-white/20 transition-colors"
              >
                Skip
              </button>
            </div>
          )}

          {!store.buzzedPlayer && !store.noMoreBuzzers && (
            <div className="space-y-3">
              <p className="text-blue-200/60 text-lg animate-pulse">
                Waiting for buzz-ins...
              </p>
              <button
                onClick={handleRevealAnswer}
                className="px-6 py-2 rounded-lg bg-white/10 border border-white/20 text-white/60 font-medium text-sm hover:bg-white/20 hover:text-white transition-colors"
              >
                Give Up (Reveal Answer)
              </button>
            </div>
          )}
        </div>

        {/* Mini scoreboard at bottom */}
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          {store.scores.slice(0, 5).map((s) => (
            <div
              key={s.id}
              className={`px-3 py-1 rounded-full text-sm ${
                s.id === store.buzzedPlayer?.id
                  ? "bg-jeopardy-gold text-jeopardy-navy font-bold"
                  : "bg-white/10 text-white/70"
              }`}
            >
              {s.name}: ${s.score}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ─── BOARD PHASE ───
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-jeopardy-navy to-jeopardy-dark">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2">
        <h1 className="text-lg font-display gold-text">
          CPT & ICD-10 JEOPARDY!
        </h1>
        <div className="flex items-center gap-4">
          <span className="text-blue-200/60 text-sm">
            Code: <span className="font-mono text-white">{gameId}</span>
          </span>
          <button
            onClick={handleEndGame}
            className="text-xs px-3 py-1 rounded bg-white/10 text-white/60 hover:text-white hover:bg-white/20 transition-colors"
          >
            End Game
          </button>
        </div>
      </div>

      {/* Board */}
      <div className="flex-1 p-2 md:p-4">
        <JeopardyBoard
          board={store.board}
          categories={store.categories}
          onSelectCell={handleSelectCell}
        />
      </div>

      {/* Scores bar */}
      <div className="px-4 py-2 bg-black/30 flex flex-wrap justify-center gap-3">
        {store.scores.map((s, i) => {
          const isLeader = i === 0 && s.score > 0 && (store.scores.length === 1 || s.score > store.scores[1].score);
          return (
            <div
              key={s.id}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                isLeader
                  ? "bg-jeopardy-gold/20 text-jeopardy-gold border border-jeopardy-gold/30"
                  : "bg-white/5 text-white/70"
              }`}
            >
              {isLeader && "👑 "}
              {s.name}: ${s.score.toLocaleString()}
              {s.streak >= 3 && " 🔥"}
            </div>
          );
        })}
      </div>
    </div>
  );
}
