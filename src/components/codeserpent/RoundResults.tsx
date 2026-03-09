"use client";

import { motion } from "framer-motion";
import type { ArenaRoundResult } from "@/data/types";

interface RoundResultsProps {
  results: ArenaRoundResult[];
  teachingNote: string;
  correctCodes: { code: string; description: string }[];
  scores: { playerId: string; playerName: string; score: number }[];
  round: number;
  totalRounds: number;
  onNextRound?: () => void;
  myPlayerId?: string;
  isPlayer?: boolean;
}

export default function RoundResults({
  results,
  teachingNote,
  correctCodes,
  scores,
  round,
  totalRounds,
  onNextRound,
  myPlayerId,
  isPlayer = false,
}: RoundResultsProps) {
  const sortedScores = [...scores].sort((a, b) => b.score - a.score);
  const myResult = myPlayerId ? results.find((r) => r.playerId === myPlayerId) : null;
  const isLastRound = round >= totalRounds;

  return (
    <div className={`w-full max-w-2xl mx-auto space-y-4 ${isPlayer ? "overflow-y-auto" : ""}`}>
      {/* Round header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <p className={`text-blue-200 uppercase tracking-wider ${isPlayer ? "text-base" : "text-sm"}`}>
          Round {round} of {totalRounds} Complete
        </p>
      </motion.div>

      {/* My result (player view only) */}
      {myResult && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-center py-3 rounded-lg ${
            myResult.roundDelta >= 0
              ? "bg-green-500/20 border border-green-500/40"
              : "bg-red-500/20 border border-red-500/40"
          }`}
        >
          <p className={`font-bold ${myResult.roundDelta >= 0 ? "text-green-400" : "text-red-400"} ${isPlayer ? "text-xl" : "text-lg"}`}>
            {myResult.roundDelta >= 0 ? "+" : ""}{myResult.roundDelta} points this round
          </p>
          <p className={`text-blue-200/70 mt-1 ${isPlayer ? "text-sm" : "text-xs"}`}>
            {myResult.correctCollections} correct, {myResult.wrongCollections} wrong, {myResult.collisions} collisions
          </p>
        </motion.div>
      )}

      {/* Teaching note */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/5 rounded-xl p-4 border border-white/10"
      >
        <p className={`font-semibold text-blue-400 mb-2 ${isPlayer ? "text-base" : "text-sm"}`}>Teaching Moment</p>
        <p className={`text-white/90 leading-relaxed ${isPlayer ? "text-base" : "text-sm"}`}>{teachingNote}</p>
      </motion.div>

      {/* Correct codes */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-emerald-900/30 rounded-xl p-4 border border-emerald-400/30"
      >
        <p className={`font-semibold text-emerald-300 mb-2 uppercase tracking-wider ${isPlayer ? "text-sm" : "text-xs"}`}>Correct Codes</p>
        <div className="flex flex-wrap gap-2">
          {correctCodes.map((c, i) => (
            <span key={i} className={`px-2 py-1 rounded bg-emerald-500/20 text-emerald-200 font-mono ${isPlayer ? "text-sm" : "text-xs"}`}>
              {c.code} — {c.description}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Leaderboard */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white/5 rounded-xl p-3"
      >
        <p className={`text-blue-200/60 mb-2 font-semibold uppercase tracking-wider ${isPlayer ? "text-sm" : "text-xs"}`}>Leaderboard</p>
        <div className="space-y-1">
          {sortedScores.map((s, i) => (
            <div
              key={s.playerId}
              className={`flex items-center justify-between px-2 py-1 rounded ${isPlayer ? "text-base" : "text-sm"} ${
                s.playerId === myPlayerId ? "bg-jeopardy-gold/10 border border-jeopardy-gold/30" : ""
              }`}
            >
              <span className="text-white/80">
                <span className="text-blue-200/50 mr-1">#{i + 1}</span>
                {s.playerName}
              </span>
              <span className="gold-text font-mono font-bold">{s.score}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Next round button (host only) */}
      {onNextRound && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <button
            onClick={onNextRound}
            className="px-8 py-3 rounded-lg bg-jeopardy-gold text-jeopardy-navy font-bold text-lg hover:bg-jeopardy-gold-light transition-colors"
          >
            {isLastRound ? "Final Results" : "Next Round"}
          </button>
        </motion.div>
      )}
    </div>
  );
}
