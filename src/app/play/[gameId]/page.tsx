"use client";

import { useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { socket } from "@/lib/socket";
import { usePlayerStore } from "@/stores/playerStore";
import { useSocket } from "@/hooks/useSocket";
import { useSound } from "@/hooks/useSound";
import BuzzButton from "@/components/game/BuzzButton";
import MiniLeaderboard from "@/components/leaderboard/MiniLeaderboard";
import ConfettiEffect from "@/components/effects/ConfettiEffect";
import { motion, AnimatePresence } from "framer-motion";

export default function PlayerGamePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const gameId = params.gameId as string;
  const name = searchParams.get("name") || "";
  const store = usePlayerStore();
  const sound = useSound();

  useEffect(() => {
    if (gameId && name) {
      store.setJoined(gameId, socket.id || "", name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId, name]);

  useSocket({
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
      if (data.phase === "daily_double") {
        store.setClue(data.clue, data.category, data.pointValue);
      }
      if (data.phase === "game_over") {
        sound.playVictory();
      }
    },
    "game:buzz-open": () => {
      store.setBuzzable(true);
      store.setHasBuzzed(false);
      store.setMyTurn(false);
      store.setBuzzedPlayerName(null);
    },
    "game:buzz-result": ({ position, isFirst }) => {
      store.setBuzzResult(position, isFirst);
      if (isFirst) sound.playBuzzIn();
    },
    "game:your-turn": () => {
      store.setMyTurn(true);
    },
    "game:answer-result": ({ correct, pointsDelta, newScore }) => {
      store.setAnswerResult(correct, pointsDelta, newScore);
      if (correct) {
        sound.playCorrect();
      } else {
        sound.playWrong();
      }
    },
    "game:scores-updated": ({ scores }) => {
      store.setScores(scores);
    },
    "game:buzz-in": ({ playerName }) => {
      store.setBuzzedPlayerName(playerName);
      store.setBuzzable(false);
    },
    "game:no-more-buzzers": () => {
      store.setBuzzable(false);
    },
    "game:state-sync": (snapshot) => {
      store.setPhase(snapshot.phase);
      if (snapshot.scores) store.setScores(snapshot.scores);
      if (snapshot.gameMeta) store.setGameMeta(snapshot.gameMeta.title, snapshot.gameMeta.subtitle);
    },
  });

  const handleBuzz = () => {
    if (!store.canBuzz || store.hasBuzzed) return;
    store.setHasBuzzed(true);
    socket.emit("player:buzz", { gameId });
    // Haptic feedback
    if (navigator.vibrate) navigator.vibrate(50);
  };

  // ─── LOBBY ───
  if (store.phase === "lobby") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-jeopardy-navy via-jeopardy-dark to-jeopardy-blue">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <h1 className="text-3xl font-display font-bold gold-text mb-2">
            {store.gameTitle || "JEOPARDY!"}
          </h1>
          <p className="text-xl text-white mb-8">
            Welcome, <span className="gold-text font-bold">{name}</span>!
          </p>
          <div className="bg-white/5 rounded-xl p-6 mb-4">
            <div className="animate-pulse text-blue-200">
              Waiting for host to start the game...
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── GAME OVER ───
  if (store.phase === "game_over") {
    const myRank = store.scores.findIndex(
      (s) => s.name.toLowerCase() === name.toLowerCase()
    ) + 1;
    const isWinner = myRank === 1;

    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-jeopardy-navy via-jeopardy-dark to-jeopardy-blue">
        {isWinner && <ConfettiEffect trigger={true} />}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", damping: 15 }}
          className="text-center"
        >
          {isWinner && <div className="text-6xl mb-4">👑</div>}
          <h1 className="text-4xl font-display font-bold gold-text mb-2">
            GAME OVER!
          </h1>
          <p className="text-2xl text-white mt-4">
            You finished{" "}
            <span className="gold-text font-bold">#{myRank}</span>
          </p>
          <p className="text-xl text-blue-200 mt-2">
            Score: ${store.score.toLocaleString()}
          </p>
        </motion.div>
        <div className="mt-8 w-full max-w-sm">
          <MiniLeaderboard scores={store.scores} myName={name} />
        </div>
      </div>
    );
  }

  // ─── ANSWER REVEAL ───
  if (store.phase === "answer_reveal" && store.revealData) {
    return (
      <div className="min-h-screen flex flex-col p-4 bg-gradient-to-b from-jeopardy-navy via-jeopardy-dark to-jeopardy-blue">
        {/* Result banner */}
        {store.lastResult && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-center py-3 rounded-lg mb-4 ${
              store.lastResult.correct
                ? "bg-correct/20 border border-correct/40"
                : "bg-incorrect/20 border border-incorrect/40"
            }`}
          >
            <p className={`text-lg font-bold ${store.lastResult.correct ? "text-correct" : "text-incorrect"}`}>
              {store.lastResult.correct ? "CORRECT!" : "INCORRECT"}
              {" "}
              {store.lastResult.delta > 0 ? "+" : ""}${store.lastResult.delta}
            </p>
          </motion.div>
        )}

        {/* Answer */}
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-blue-200 text-sm uppercase tracking-wider">
              Correct Response
            </p>
            <p className="text-2xl font-display font-bold text-white mt-1">
              {store.revealData.correctResponse}
            </p>
            <p className="text-lg gold-text font-mono mt-1">
              {store.revealData.codeType} {store.revealData.code}
            </p>
          </motion.div>

          {store.revealData.mnemonic && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mnemonic-card w-full max-w-sm"
            >
              <p className="text-sm font-semibold text-jeopardy-gold mb-1">
                💡 Mnemonic
              </p>
              <p className="text-white/90 text-sm">
                {store.revealData.mnemonic}
              </p>
            </motion.div>
          )}

          {store.revealData.fact && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="fact-card w-full max-w-sm"
            >
              <p className="text-sm font-semibold text-blue-400 mb-1">
                📚 Did You Know?
              </p>
              <p className="text-white/90 text-sm">
                {store.revealData.fact}
              </p>
            </motion.div>
          )}
        </div>

        {/* Score */}
        <div className="text-center mt-4 py-3 bg-white/5 rounded-lg">
          <p className="text-sm text-blue-200">Your Score</p>
          <p className="text-2xl font-bold gold-text">
            ${store.score.toLocaleString()}
          </p>
          <p className="text-xs text-blue-200/50">Rank: #{store.rank}</p>
        </div>
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
      <div className="min-h-screen flex flex-col p-4 bg-gradient-to-b from-jeopardy-navy via-jeopardy-dark to-jeopardy-blue">
        {/* Category/Value */}
        <div className="text-center mb-4">
          <p className="text-blue-200 text-xs uppercase tracking-wider">
            {store.currentCategory}
          </p>
          <p className="gold-text text-lg font-bold">
            ${store.currentPointValue}
          </p>
        </div>

        {/* Clue */}
        <div className="flex-1 flex items-center justify-center px-2">
          <p className="text-lg md:text-xl text-white text-center font-display leading-relaxed">
            {store.currentClue}
          </p>
        </div>

        {/* Buzz area */}
        <div className="flex flex-col items-center py-6">
          <AnimatePresence mode="wait">
            {store.isMyTurn ? (
              <motion.div
                key="your-turn"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <p className="text-2xl font-bold text-jeopardy-gold mb-2">
                  YOU&apos;RE UP!
                </p>
                <p className="text-blue-200 text-sm">
                  Say your answer out loud!
                </p>
              </motion.div>
            ) : store.failedThisQuestion ? (
              <motion.div
                key="failed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center"
              >
                <p className="text-lg text-red-400 font-semibold mb-1">
                  Not quite!
                </p>
                <p className="text-blue-200/60 text-sm">
                  Waiting for other players...
                </p>
              </motion.div>
            ) : store.hasBuzzed ? (
              <motion.div
                key="buzzed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center"
              >
                <p className="text-lg text-blue-200">
                  Buzzed! #{(store.buzzPosition ?? 0) + 1} in queue
                </p>
                {store.buzzedPlayerName && (
                  <p className="text-sm text-white/50 mt-1">
                    {store.buzzedPlayerName} is answering...
                  </p>
                )}
              </motion.div>
            ) : store.canBuzz ? (
              <BuzzButton key="buzz" onBuzz={handleBuzz} />
            ) : store.buzzedPlayerName ? (
              <motion.div
                key="waiting-answer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center"
              >
                <p className="text-lg text-blue-200">
                  <span className="gold-text font-bold">
                    {store.buzzedPlayerName}
                  </span>{" "}
                  is answering...
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="waiting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-blue-200/50 text-sm"
              >
                Waiting...
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mini score */}
        <div className="text-center py-2 bg-white/5 rounded-lg">
          <p className="text-xs text-blue-200">
            Score: <span className="gold-text font-bold">${store.score}</span>
            {store.streak >= 3 && <span className="ml-2">🔥 {store.streak} streak!</span>}
          </p>
        </div>
      </div>
    );
  }

  // ─── BOARD PHASE (Player just sees waiting + scoreboard) ───
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-jeopardy-navy via-jeopardy-dark to-jeopardy-blue">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-display gold-text mb-1">{store.gameTitle || "JEOPARDY!"}</h2>
        <p className="text-blue-200/60 text-sm">
          Host is selecting a question...
        </p>
      </div>

      <div className="w-full max-w-sm bg-white/5 rounded-xl p-4 mb-4">
        <div className="text-center mb-3">
          <p className="text-sm text-blue-200">Your Score</p>
          <p className="text-3xl font-bold gold-text">
            ${store.score.toLocaleString()}
          </p>
          {store.rank > 0 && (
            <p className="text-xs text-blue-200/50">Rank: #{store.rank}</p>
          )}
        </div>
      </div>

      <div className="w-full max-w-sm">
        <MiniLeaderboard scores={store.scores} myName={name} />
      </div>
    </div>
  );
}
