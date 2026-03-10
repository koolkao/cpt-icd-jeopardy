"use client";

import { useEffect, useRef, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { socket } from "@/lib/socket";
import { usePlayerStore } from "@/stores/playerStore";
import { useSocket } from "@/hooks/useSocket";
import { useSound } from "@/hooks/useSound";
import BuzzButton from "@/components/game/BuzzButton";
import MiniLeaderboard from "@/components/leaderboard/MiniLeaderboard";
import ConfettiEffect from "@/components/effects/ConfettiEffect";
import ScenarioCard from "@/components/lockandkey/ScenarioCard";
import TimerBar from "@/components/lockandkey/TimerBar";
import PlayerSelectionGrid from "@/components/lockandkey/PlayerSelectionGrid";
import ArenaCanvas, { type ArenaStateRef, emptySnapshot } from "@/components/codeserpent/ArenaCanvas";
import CountdownOverlay from "@/components/codeserpent/CountdownOverlay";
import RoundResults from "@/components/codeserpent/RoundResults";
import JoystickOverlay from "@/components/codeserpent/JoystickOverlay";
import {
  LK_TIMER_DURATION_S,
  type RevealStep,
  type LockAndKeyPlayerResult,
  type PlayerScore,
  type ArenaFullSync,
  type ArenaTickDelta,
  type ArenaRoundResult,
  type Direction,
  type CodePill,
} from "@/data/types";
import { motion, AnimatePresence } from "framer-motion";

export default function PlayerGamePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const gameId = params.gameId as string;
  const name = searchParams.get("name") || "";
  const store = usePlayerStore();
  const sound = useSound();

  // Code Serpent: arena state in ref (double-buffered for smooth interpolation)
  const arenaStateRef = useRef<ArenaStateRef>({
    from: emptySnapshot(),
    to: emptySnapshot(),
    interpStart: performance.now(),
    tickDuration: 120,
    round: 0,
    totalRounds: 0,
    scenarioText: "",
    events: [],
    debug: { tickIntervals: [], tAtArrival: [], tickDuration: 200, frameMs: 0 },
  });

  const handleDirection = useCallback((direction: Direction) => {
    socket.emit("player:cs-direction", { gameId, direction });
  }, [gameId]);

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
      if (data.gameMeta) store.setGameMeta(data.gameMeta.title, data.gameMeta.subtitle, data.gameMeta.gameMode);
      if (data.clue) {
        store.setClue(data.clue, data.category, data.pointValue);
      }
      if (data.phase === "answer_reveal") {
        store.setRevealData(data);
      }
      if (data.phase === "daily_double") {
        store.setClue(data.clue, data.category, data.pointValue);
      }
      if (data.phase === "lk_playing" && data.lkRound) {
        store.setLkRoundData(data.lkRound);
      }
      if (data.phase === "game_over") {
        sound.playVictory();
      }
      // Code Serpent phase data
      if (data.round && data.totalRounds) {
        store.setCsRound(data.round, data.totalRounds, data.scenarioText || "", data.category || "");
        arenaStateRef.current.round = data.round;
        arenaStateRef.current.totalRounds = data.totalRounds;
        arenaStateRef.current.scenarioText = data.scenarioText || "";
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
    "lk:timer-tick": ({ remaining }: { remaining: number }) => {
      store.setLkTimer(remaining);
    },
    "lk:submission-count": (count: { submitted: number; total: number }) => {
      store.setLkSubmissionCount(count);
    },
    "lk:reveal-step": ({ step }: { step: RevealStep }) => {
      store.addLkRevealStep(step);
    },
    "lk:round-complete": ({ results, revealNote, scores }: { results: LockAndKeyPlayerResult[]; revealNote: string; scores: PlayerScore[] }) => {
      const myResult = results.find((r) => r.playerId === socket.id) || null;
      store.setLkResult(myResult, revealNote);
      store.setScores(scores);
    },
    "game:state-sync": (snapshot) => {
      store.setPhase(snapshot.phase);
      if (snapshot.scores) store.setScores(snapshot.scores);
      if (snapshot.gameMeta) store.setGameMeta(snapshot.gameMeta.title, snapshot.gameMeta.subtitle, snapshot.gameMeta.gameMode);
    },
    // Code Serpent events
    "cs:tick": (delta: ArenaTickDelta) => {
      const ref = arenaStateRef.current;
      const now = performance.now();
      const elapsed = now - ref.interpStart;
      // Shift current to → from (clone segments so from is not mutated)
      ref.from = {
        heads: ref.to.heads,
        snakes: ref.to.snakes.map((s) => ({ ...s, segments: [...s.segments] })),
        pills: ref.to.pills,
        timeRemainingS: ref.to.timeRemainingS,
      };
      // Build new to snapshot
      const newSnakes = ref.from.snakes.map((s) => ({ ...s, segments: [...s.segments] }));
      const newHeads = new Map<string, { x: number; y: number; direction: Direction }>();
      for (const ds of delta.snakes) {
        const existing = newSnakes.find((s) => s.playerId === ds.playerId);
        if (existing) {
          if (ds.alive && existing.segments.length > 0) {
            existing.segments.unshift({ x: ds.headX, y: ds.headY });
            while (existing.segments.length > ds.length) existing.segments.pop();
          }
          existing.direction = ds.direction;
          existing.alive = ds.alive;
          existing.score = ds.score;
        }
        newHeads.set(ds.playerId, { x: ds.headX, y: ds.headY, direction: ds.direction });
      }
      ref.to = { heads: newHeads, snakes: newSnakes, pills: delta.pills, timeRemainingS: delta.timeRemainingS };
      // Adaptive tick duration (fast EMA to converge quickly)
      if (elapsed > 50 && elapsed < 500) {
        ref.tickDuration = ref.tickDuration * 0.5 + elapsed * 0.5;
      }
      // Debug stats (keep last 30 samples)
      const tAtArrival = Math.min(elapsed / ref.tickDuration, 2);
      ref.debug.tickIntervals.push(elapsed);
      ref.debug.tAtArrival.push(tAtArrival);
      if (ref.debug.tickIntervals.length > 30) ref.debug.tickIntervals.shift();
      if (ref.debug.tAtArrival.length > 30) ref.debug.tAtArrival.shift();
      ref.debug.tickDuration = ref.tickDuration;
      ref.interpStart = now;
      ref.events.push(...delta.events);
    },
    "cs:sync": (sync: ArenaFullSync) => {
      const ref = arenaStateRef.current;
      const heads = new Map<string, { x: number; y: number; direction: Direction }>();
      for (const s of sync.snakes) {
        if (s.segments.length > 0) {
          heads.set(s.playerId, { x: s.segments[0].x, y: s.segments[0].y, direction: s.direction });
        }
      }
      const snapshot = { heads, snakes: sync.snakes, pills: sync.pills, timeRemainingS: sync.timeRemainingS };
      ref.from = snapshot;
      ref.to = snapshot;
      ref.interpStart = performance.now();
      // Don't reset tickDuration — let the EMA keep its adapted value
      ref.round = sync.round;
    },
    "cs:countdown": ({ secondsLeft }: { secondsLeft: number }) => {
      store.setCsCountdown(secondsLeft);
    },
    "cs:pill-feedback": ({ pill, correct, points }: { pill: CodePill; correct: boolean; points: number }) => {
      store.setCsLastCollection({ code: pill.code, correct, points });
      if (navigator.vibrate) navigator.vibrate(correct ? [30] : [50, 30, 50]);
      setTimeout(() => store.setCsLastCollection(null), 1500);
    },
    "cs:round-end": ({ results, teachingNote, correctCodes, scores }: {
      results: ArenaRoundResult[];
      teachingNote: string;
      correctCodes: { code: string; description: string }[];
      scores: { playerId: string; playerName: string; score: number }[];
    }) => {
      const myResult = results.find((r) => r.playerId === socket.id) || null;
      store.setCsRoundResults(myResult, teachingNote, correctCodes, scores);
    },
  });

  const handleBuzz = () => {
    if (!store.canBuzz || store.hasBuzzed) return;
    store.setHasBuzzed(true);
    socket.emit("player:buzz", { gameId });
    // Haptic feedback
    if (navigator.vibrate) navigator.vibrate(50);
  };

  const handleToggleOption = (index: number) => {
    store.toggleLkSelection(index);
    if (navigator.vibrate) navigator.vibrate(30);
  };

  const handleSubmitSelections = () => {
    store.setLkSubmitted();
    socket.emit("player:lk-submit-selections", {
      gameId,
      selectedIndices: store.lkSelectedIndices,
    });
    if (navigator.vibrate) navigator.vibrate(50);
  };

  // ─── CODE SERPENT: COUNTDOWN ───
  if (store.phase === "cs_countdown") {
    return (
      <CountdownOverlay
        secondsLeft={store.csCountdown}
        scenarioText={store.csScenarioText}
        category={store.csCategory}
        round={store.csRound}
        totalRounds={store.csTotalRounds}
        isPlayer
      />
    );
  }

  // ─── CODE SERPENT: PLAYING ───
  if (store.phase === "cs_playing") {
    return (
      <div className="min-h-screen flex flex-col bg-black relative">
        {/* Collection feedback */}
        <AnimatePresence>
          {store.csLastCollection && (
            <motion.div
              key="pill-fb"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`absolute top-2 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-lg font-bold text-base ${
                store.csLastCollection.correct
                  ? "bg-green-500/90 text-white"
                  : "bg-red-500/90 text-white"
              }`}
            >
              {store.csLastCollection.code}: {store.csLastCollection.correct ? "+" : ""}{store.csLastCollection.points}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Arena canvas */}
        <div className="flex-1 relative">
          <ArenaCanvas stateRef={arenaStateRef} myPlayerId={socket.id || undefined} showHUD cameraFollow showMinimap showDebug />

          {/* Joystick overlay */}
          <JoystickOverlay onDirection={handleDirection} />
        </div>
      </div>
    );
  }

  // ─── CODE SERPENT: ROUND RESULTS ───
  if (store.phase === "cs_round_results") {
    return (
      <div className="min-h-screen flex flex-col p-4 overflow-y-auto bg-gradient-to-b from-jeopardy-navy via-jeopardy-dark to-jeopardy-blue">
        <RoundResults
          results={store.csScores.map((s) => {
            const r = store.csMyResult;
            if (r && r.playerId === s.playerId) return r;
            return {
              playerId: s.playerId,
              playerName: s.playerName,
              score: s.score,
              correctCollections: 0,
              wrongCollections: 0,
              collisions: 0,
              roundDelta: 0,
            };
          })}
          teachingNote={store.csTeachingNote}
          correctCodes={store.csCorrectCodes}
          scores={store.csScores}
          round={store.csRound}
          totalRounds={store.csTotalRounds}
          myPlayerId={socket.id || undefined}
          isPlayer
        />
      </div>
    );
  }

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
            {store.gameTitle || "CPT Games"}
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

  // ─── LOCK & KEY: PLAYING PHASE ───
  if (store.phase === "lk_playing" && store.lkRoundData) {
    return (
      <div className="min-h-screen flex flex-col p-4 bg-gradient-to-b from-jeopardy-navy via-jeopardy-dark to-jeopardy-blue">
        {/* Timer */}
        <TimerBar remaining={store.lkTimerRemaining} total={LK_TIMER_DURATION_S} />

        {/* Scenario */}
        <ScenarioCard
          cptCode={store.lkRoundData.cptCode}
          cptDescription={store.lkRoundData.cptDescription}
          scenario={store.lkRoundData.scenario}
          category={store.lkRoundData.category}
          subcategory={store.lkRoundData.subcategory}
          compact
        />

        {/* Selection grid or submitted state */}
        <div className="flex-1 mt-3">
          <PlayerSelectionGrid
            roundData={store.lkRoundData}
            selectedIndices={store.lkSelectedIndices}
            hasSubmitted={store.lkHasSubmitted}
            revealedOptions={store.lkRevealedOptions}
            onToggle={handleToggleOption}
            onSubmit={handleSubmitSelections}
          />
        </div>

        {/* Submission count */}
        {store.lkHasSubmitted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-2 text-blue-200/60 text-sm"
          >
            {store.lkSubmissionCount.submitted}/{store.lkSubmissionCount.total} submitted
          </motion.div>
        )}

        {/* Score */}
        <div className="text-center py-2 bg-white/5 rounded-lg">
          <p className="text-xs text-blue-200">
            Score: <span className="gold-text font-bold">${store.score}</span>
          </p>
        </div>
      </div>
    );
  }

  // ─── LOCK & KEY: REVEALING PHASE ───
  if (store.phase === "lk_revealing" && store.lkRoundData) {
    return (
      <div className="min-h-screen flex flex-col p-4 bg-gradient-to-b from-jeopardy-navy via-jeopardy-dark to-jeopardy-blue">
        <div className="text-center mb-3">
          <p className="text-blue-200 text-xs uppercase tracking-wider">{store.lkRoundData.category}</p>
          <p className="gold-text text-lg font-bold font-mono">CPT {store.lkRoundData.cptCode}</p>
        </div>

        {/* Show options with reveal state */}
        <div className="flex-1">
          <PlayerSelectionGrid
            roundData={store.lkRoundData}
            selectedIndices={store.lkSelectedIndices}
            hasSubmitted={true}
            revealedOptions={store.lkRevealedOptions}
            onToggle={() => {}}
            onSubmit={() => {}}
          />
        </div>

        <div className="text-center py-2 bg-white/5 rounded-lg">
          <p className="text-xs text-blue-200">
            Score: <span className="gold-text font-bold">${store.score}</span>
          </p>
        </div>
      </div>
    );
  }

  // ─── LOCK & KEY: ROUND RESULTS PHASE ───
  if (store.phase === "lk_round_results") {
    return (
      <div className="min-h-screen flex flex-col p-4 bg-gradient-to-b from-jeopardy-navy via-jeopardy-dark to-jeopardy-blue">
        {/* Personal result */}
        {store.lkMyResult && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-center py-3 rounded-lg mb-4 ${
              store.lkMyResult.totalDelta >= 0
                ? "bg-green-500/20 border border-green-500/40"
                : "bg-red-500/20 border border-red-500/40"
            }`}
          >
            <p className={`text-lg font-bold ${store.lkMyResult.totalDelta >= 0 ? "text-green-400" : "text-red-400"}`}>
              {store.lkMyResult.totalDelta >= 0 ? "+" : ""}{store.lkMyResult.totalDelta} points
            </p>
            <p className="text-blue-200/70 text-xs mt-1">
              {store.lkMyResult.correctSelections} correct, {store.lkMyResult.incorrectSelections} incorrect
              {store.lkMyResult.perfectBonus > 0 && " | Perfect!"}
              {" | "}{store.lkMyResult.speedMultiplier}x speed
            </p>
          </motion.div>
        )}

        {/* Reveal note */}
        {store.lkRevealNote && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 rounded-xl p-4 mb-4 border border-white/10"
          >
            <p className="text-sm font-semibold text-blue-400 mb-1">Billing Note</p>
            <p className="text-white/90 text-sm">{store.lkRevealNote}</p>
          </motion.div>
        )}

        {/* Score + leaderboard */}
        <div className="text-center mb-4">
          <p className="text-sm text-blue-200">Your Score</p>
          <p className="text-3xl font-bold gold-text">${store.score.toLocaleString()}</p>
        </div>

        <div className="w-full max-w-sm mx-auto">
          <MiniLeaderboard scores={store.scores} myName={name} />
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
        <h2 className="text-2xl font-display gold-text mb-1">{store.gameTitle || "CPT Games"}</h2>
        <p className="text-blue-200/60 text-sm">
          {store.gameMode === "lock-and-key"
            ? "Host is selecting a round..."
            : "Host is selecting a question..."}
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
