"use client";

import { useCallback, useState } from "react";
import { useParams } from "next/navigation";
import { socket } from "@/lib/socket";
import { useControlStore } from "@/stores/controlStore";
import { useSocket } from "@/hooks/useSocket";
import type { Player } from "@/data/types";
import { motion, AnimatePresence } from "framer-motion";

export default function HostControlPage() {
  const params = useParams();
  const gameId = params.gameId as string;
  const store = useControlStore();
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [judgeFeedback, setJudgeFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [lastJudgedName, setLastJudgedName] = useState("");

  const handleLogin = useCallback(() => {
    if (!socket.connected) {
      socket.connect();
    }

    const joinControl = () => {
      socket.emit(
        "host:join-control",
        { gameId, password },
        (res: { success: boolean; error?: string }) => {
          if (res.success) {
            setAuthenticated(true);
            store.setGameId(gameId);
          } else {
            setError(res.error || "Failed to join.");
          }
        }
      );
    };

    if (socket.connected) {
      joinControl();
    } else {
      socket.once("connect", joinControl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId, password]);

  useSocket({
    "game:state-sync": (snapshot) => {
      store.setPhase(snapshot.phase);
      if (snapshot.scores) store.setScores(snapshot.scores);
      if (snapshot.players) store.setPlayers(snapshot.players);
      if (snapshot.gameMeta) store.setGameMeta(snapshot.gameMeta.title, snapshot.gameMeta.subtitle);
    },
    "game:phase-change": (data) => {
      store.setPhase(data.phase);
      if (data.scores) store.setScores(data.scores);
      if (data.gameMeta) store.setGameMeta(data.gameMeta.title, data.gameMeta.subtitle);
      if (data.clue) {
        store.setClue(data.clue, data.category, data.pointValue);
      }
      if (data.phase === "answer_reveal") {
        store.setRevealData(data);
      }
      if (data.phase === "board" || data.phase === "lobby") {
        store.setAnswerData(null);
      }
    },
    "game:host-clue-data": (data) => {
      store.setAnswerData(data);
    },
    "game:player-joined": ({ player }: { player: Player }) => {
      store.addPlayer(player);
    },
    "game:player-disconnected": ({ playerId }: { playerId: string }) => {
      store.removePlayer(playerId);
    },
    "game:buzz-in": ({ playerId, playerName }) => {
      store.setBuzzedPlayer({ id: playerId, name: playerName });
    },
    "game:scores-updated": ({ scores }) => {
      store.setScores(scores);
    },
    "game:judge-result": ({ correct, playerName }: { correct: boolean; playerName: string }) => {
      setJudgeFeedback(correct ? "correct" : "incorrect");
      setLastJudgedName(playerName);
      setTimeout(() => setJudgeFeedback(null), 1500);
    },
    "game:buzz-open": () => {
      store.setBuzzedPlayer(null);
      store.setNoMoreBuzzers(false);
    },
    "game:no-more-buzzers": () => {
      store.setBuzzedPlayer(null);
      store.setNoMoreBuzzers(true);
    },
  });

  const handleStartGame = useCallback(() => {
    socket.emit("host:start-game", { gameId });
  }, [gameId]);

  const handleJudge = useCallback(
    (correct: boolean) => {
      socket.emit("host:judge-answer", { gameId, correct });
    },
    [gameId]
  );

  const handleRevealAnswer = useCallback(() => {
    socket.emit("host:reveal-answer", { gameId });
  }, [gameId]);

  const handleReturnToBoard = useCallback(() => {
    socket.emit("host:return-to-board", { gameId });
    store.setBuzzedPlayer(null);
    store.setNoMoreBuzzers(false);
    store.setAnswerData(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId]);

  const handleSkip = useCallback(() => {
    socket.emit("host:skip-question", { gameId });
  }, [gameId]);

  const handleEndGame = useCallback(() => {
    socket.emit("host:end-game", { gameId });
  }, [gameId]);

  // ─── PASSWORD GATE ───
  if (!authenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-b from-jeopardy-navy via-jeopardy-dark to-jeopardy-blue">
        <div className="w-full max-w-sm space-y-4">
          <h1 className="text-2xl font-display font-bold gold-text text-center mb-2">
            HOST CONTROL
          </h1>
          <p className="text-blue-200/60 text-sm text-center mb-4">
            Enter password to view answers
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
            className="space-y-3"
          >
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              placeholder="Password"
              autoFocus
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-jeopardy-gold/50 focus:ring-1 focus:ring-jeopardy-gold/30"
            />
            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}
            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-jeopardy-gold text-jeopardy-navy font-bold text-lg hover:bg-jeopardy-gold-light transition-colors"
            >
              Enter
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ─── ANSWER CARD (reusable) ───
  const AnswerCard = () => {
    if (!store.answerData) return null;
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-emerald-900/40 border-2 border-emerald-400/60 rounded-xl p-5 w-full"
      >
        <p className="text-emerald-300 text-xs uppercase tracking-wider font-semibold mb-2">
          Correct Answer
        </p>
        <p className="text-2xl font-bold text-white mb-1">
          {store.answerData.correctResponse}
        </p>
        <p className="text-lg text-emerald-300 font-mono">
          {store.answerData.codeType} {store.answerData.code}
        </p>
        {store.answerData.mnemonic && (
          <div className="mt-3 pt-3 border-t border-emerald-400/20">
            <p className="text-xs text-jeopardy-gold font-semibold mb-1">
              Mnemonic
            </p>
            <p className="text-sm text-white/80">{store.answerData.mnemonic}</p>
          </div>
        )}
        {store.answerData.fact && (
          <div className="mt-2 pt-2 border-t border-emerald-400/20">
            <p className="text-xs text-blue-400 font-semibold mb-1">
              Fun Fact
            </p>
            <p className="text-sm text-white/80">{store.answerData.fact}</p>
          </div>
        )}
      </motion.div>
    );
  };

  // ─── PHASE BADGE ───
  const phaseName: Record<string, string> = {
    lobby: "LOBBY",
    board: "BOARD",
    question: "QUESTION",
    buzz_open: "BUZZERS OPEN",
    buzz_locked: "ANSWERING",
    answer_reveal: "ANSWER REVEAL",
    daily_double: "DAILY DOUBLE",
    game_over: "GAME OVER",
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-jeopardy-navy via-jeopardy-dark to-jeopardy-blue">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/30">
        <div>
          <h1 className="text-sm font-display gold-text">HOST CONTROL</h1>
          <p className="text-xs text-blue-200/60">
            Code: <span className="font-mono text-white">{gameId}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 rounded text-xs font-bold bg-jeopardy-gold/20 text-jeopardy-gold border border-jeopardy-gold/30">
            {phaseName[store.phase] || store.phase}
          </span>
          {store.phase !== "lobby" && store.phase !== "game_over" && (
            <button
              onClick={handleEndGame}
              className="text-xs px-2 py-1 rounded bg-red-900/40 text-red-300 border border-red-500/30 hover:bg-red-900/60 transition-colors"
            >
              End
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        <AnimatePresence mode="wait">
          {/* ─── LOBBY ─── */}
          {store.phase === "lobby" && (
            <motion.div
              key="lobby"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="bg-white/5 rounded-xl p-4">
                <h3 className="text-white font-semibold mb-2">
                  Players ({store.players.length}/20)
                </h3>
                {store.players.length === 0 ? (
                  <p className="text-blue-200/50 text-sm">
                    Waiting for players...
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {store.players.map((p) => (
                      <span
                        key={p.id}
                        className="px-2 py-1 bg-jeopardy-gold/20 border border-jeopardy-gold/40 rounded-full text-xs text-jeopardy-gold"
                      >
                        {p.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {store.players.length > 0 && (
                <button
                  onClick={handleStartGame}
                  className="w-full py-3 rounded-xl bg-jeopardy-gold text-jeopardy-navy font-bold text-lg hover:bg-jeopardy-gold-light transition-colors"
                >
                  START GAME
                </button>
              )}
            </motion.div>
          )}

          {/* ─── BOARD (waiting for selection) ─── */}
          {store.phase === "board" && (
            <motion.div
              key="board"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="bg-white/5 rounded-xl p-6 text-center">
                <p className="text-blue-200/60 text-lg">
                  Select a question on the projected board...
                </p>
              </div>
              <ScoreList scores={store.scores} />
            </motion.div>
          )}

          {/* ─── QUESTION / BUZZ PHASE ─── */}
          {(store.phase === "question" ||
            store.phase === "buzz_open" ||
            store.phase === "buzz_locked" ||
            store.phase === "daily_double") && (
            <motion.div
              key="question"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Clue */}
              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-blue-200 text-xs uppercase tracking-wider">
                    {store.currentCategory}
                  </p>
                  <p className="gold-text text-sm font-bold">
                    ${store.currentPointValue}
                  </p>
                </div>
                <p className="text-white text-base leading-relaxed">
                  {store.currentClue}
                </p>
              </div>

              {/* ANSWER - the main reason for this view */}
              <AnswerCard />

              {/* Judge feedback banner */}
              <AnimatePresence>
                {judgeFeedback && (
                  <motion.div
                    key="judge-fb"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={`rounded-xl p-4 text-center font-bold text-lg ${
                      judgeFeedback === "correct"
                        ? "bg-green-500/20 border-2 border-green-400/50 text-green-400"
                        : "bg-red-500/20 border-2 border-red-400/50 text-red-400"
                    }`}
                  >
                    {judgeFeedback === "correct" ? "✅ " : "❌ "}
                    {lastJudgedName}:{" "}
                    {judgeFeedback === "correct" ? "CORRECT!" : "NOPE!"}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Buzz status + controls */}
              <div className="space-y-3">
                {store.buzzedPlayer && (
                  <div className="bg-white/5 rounded-xl p-4 text-center">
                    <p className="text-blue-200 text-xs mb-1">Buzzed in:</p>
                    <p className="text-xl font-bold gold-text mb-3">
                      {store.buzzedPlayer.name}
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleJudge(true)}
                        className="flex-1 py-3 rounded-lg bg-correct text-white font-bold text-lg hover:bg-green-400 transition-colors"
                      >
                        Correct
                      </button>
                      <button
                        onClick={() => handleJudge(false)}
                        className="flex-1 py-3 rounded-lg bg-incorrect text-white font-bold text-lg hover:bg-red-400 transition-colors"
                      >
                        Incorrect
                      </button>
                    </div>
                  </div>
                )}

                {!store.buzzedPlayer && store.noMoreBuzzers && (
                  <div className="flex gap-3">
                    <button
                      onClick={handleRevealAnswer}
                      className="flex-1 py-3 rounded-lg bg-jeopardy-gold text-jeopardy-navy font-bold hover:bg-jeopardy-gold-light transition-colors"
                    >
                      Reveal Answer
                    </button>
                    <button
                      onClick={handleSkip}
                      className="py-3 px-4 rounded-lg bg-white/10 border border-white/20 text-white font-medium hover:bg-white/20 transition-colors"
                    >
                      Skip
                    </button>
                  </div>
                )}

                {!store.buzzedPlayer && !store.noMoreBuzzers && (
                  <p className="text-blue-200/50 text-sm text-center animate-pulse">
                    Waiting for buzz-ins...
                  </p>
                )}

                {/* Give Up — always available during question/buzz phases */}
                {!store.noMoreBuzzers && (
                  <div className="pt-2 border-t border-white/10">
                    <button
                      onClick={handleRevealAnswer}
                      className="w-full py-2 rounded-lg bg-white/10 border border-white/20 text-white/70 font-medium text-sm hover:bg-white/20 hover:text-white transition-colors"
                    >
                      Give Up (Reveal Answer)
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ─── ANSWER REVEAL ─── */}
          {store.phase === "answer_reveal" && (
            <motion.div
              key="reveal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {store.answeredBy && (
                <div
                  className={`text-center py-2 rounded-lg ${
                    store.wasCorrect
                      ? "bg-correct/20 border border-correct/40"
                      : "bg-incorrect/20 border border-incorrect/40"
                  }`}
                >
                  <p className="text-sm">
                    <span className="font-bold text-white">
                      {store.answeredBy}
                    </span>{" "}
                    <span
                      className={
                        store.wasCorrect ? "text-correct" : "text-incorrect"
                      }
                    >
                      {store.wasCorrect ? "got it right!" : "got it wrong"}
                    </span>
                  </p>
                </div>
              )}

              {store.revealData && (
                <div className="bg-white/5 rounded-xl p-4 space-y-2">
                  <p className="text-blue-200 text-xs uppercase">
                    {store.revealData.category} - $
                    {store.revealData.pointValue}
                  </p>
                  <p className="text-white text-sm">{store.revealData.clue}</p>
                  <p className="text-xl font-bold text-emerald-300">
                    {store.revealData.correctResponse}
                  </p>
                  <p className="text-lg gold-text font-mono">
                    {store.revealData.codeType} {store.revealData.code}
                  </p>
                </div>
              )}

              <button
                onClick={handleReturnToBoard}
                className="w-full py-3 rounded-lg bg-jeopardy-gold text-jeopardy-navy font-bold hover:bg-jeopardy-gold-light transition-colors"
              >
                Return to Board
              </button>

              <ScoreList scores={store.scores} />
            </motion.div>
          )}

          {/* ─── GAME OVER ─── */}
          {store.phase === "game_over" && (
            <motion.div
              key="gameover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="text-center py-4">
                <h2 className="text-3xl font-display font-bold gold-text">
                  GAME OVER!
                </h2>
                {store.scores[0] && (
                  <p className="text-lg text-white mt-2">
                    Winner:{" "}
                    <span className="gold-text font-bold">
                      {store.scores[0].name}
                    </span>{" "}
                    - ${store.scores[0].score.toLocaleString()}
                  </p>
                )}
              </div>
              <ScoreList scores={store.scores} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ScoreList({ scores }: { scores: { id: string; name: string; score: number; streak: number; rank: number }[] }) {
  if (scores.length === 0) return null;
  return (
    <div className="bg-white/5 rounded-xl p-3">
      <p className="text-xs text-blue-200/60 mb-2 font-semibold">SCORES</p>
      <div className="space-y-1">
        {scores.map((s) => (
          <div
            key={s.id}
            className="flex items-center justify-between px-2 py-1 rounded text-sm"
          >
            <span className="text-white/80">
              <span className="text-blue-200/50 mr-1">#{s.rank}</span>
              {s.name}
              {s.streak >= 3 && <span className="ml-1 text-orange-400">{"🔥"}</span>}
            </span>
            <span className="gold-text font-mono font-bold">
              ${s.score.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
