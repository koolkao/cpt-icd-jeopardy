"use client";

import { LockAndKeyPlayerResult, PlayerScore } from "@/data/types";
import { motion } from "framer-motion";
import Leaderboard from "../leaderboard/Leaderboard";

interface Props {
  revealNote: string;
  results: LockAndKeyPlayerResult[];
  scores: PlayerScore[];
  onReturnToBoard: () => void;
  isGameOver?: boolean;
}

export default function RoundResultsCard({
  revealNote,
  results,
  scores,
  onReturnToBoard,
  isGameOver,
}: Props) {
  // Sort results by totalDelta descending to show top performers
  const sortedResults = [...results].sort((a, b) => b.totalDelta - a.totalDelta);
  const topPerformers = sortedResults.slice(0, 3);

  const getMedalIcon = (rank: number) => {
    switch (rank) {
      case 0:
        return "1st";
      case 1:
        return "2nd";
      case 2:
        return "3rd";
      default:
        return "";
    }
  };

  const getMedalStyle = (rank: number) => {
    switch (rank) {
      case 0:
        return "bg-yellow-500/20 border-yellow-500/50 text-yellow-300";
      case 1:
        return "bg-gray-300/10 border-gray-400/30 text-gray-300";
      case 2:
        return "bg-orange-600/15 border-orange-500/30 text-orange-300";
      default:
        return "bg-white/5 border-white/10 text-white/70";
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Educational reveal note */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-lg border-2 border-jeopardy-gold/40 bg-jeopardy-gold/10 p-4 md:p-5"
      >
        <p className="text-sm font-semibold text-jeopardy-gold uppercase tracking-wider mb-2">
          Key Takeaway
        </p>
        <p className="text-white text-base md:text-lg leading-relaxed">
          {revealNote}
        </p>
      </motion.div>

      {/* Top performers */}
      {topPerformers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <h3 className="text-sm font-semibold text-blue-200 uppercase tracking-wider">
            Round Results
          </h3>
          {topPerformers.map((result, i) => (
            <motion.div
              key={result.playerId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className={`flex items-center justify-between px-4 py-3 rounded-lg border ${getMedalStyle(i)}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-wider opacity-70 w-6">
                  {getMedalIcon(i)}
                </span>
                <span className="font-semibold">{result.playerName}</span>
              </div>

              <div className="flex items-center gap-3 text-xs md:text-sm">
                {/* Breakdown */}
                <span className="text-green-400">
                  +{result.correctSelections}
                </span>
                <span className="text-red-400">
                  -{result.incorrectSelections}
                </span>
                {result.perfectBonus > 0 && (
                  <span className="text-jeopardy-gold">
                    +{result.perfectBonus} bonus
                  </span>
                )}
                {result.speedMultiplier !== 1.0 && (
                  <span className="text-blue-300">
                    x{result.speedMultiplier.toFixed(1)}
                  </span>
                )}

                {/* Total */}
                <span
                  className={`font-mono font-bold text-base ${
                    result.totalDelta >= 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {result.totalDelta >= 0 ? "+" : ""}
                  {result.totalDelta}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Game over: show full leaderboard */}
      {isGameOver && scores.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-3"
        >
          <h3 className="text-sm font-semibold text-blue-200 uppercase tracking-wider text-center">
            Final Standings
          </h3>
          <Leaderboard scores={scores} isGameOver />
        </motion.div>
      )}

      {/* Return to Board button */}
      {!isGameOver && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center pt-4"
        >
          <button
            onClick={onReturnToBoard}
            className="px-8 py-3 rounded-lg bg-jeopardy-gold text-jeopardy-navy font-bold text-lg hover:bg-jeopardy-gold-light transition-colors active:scale-[0.98]"
          >
            Return to Board
          </button>
        </motion.div>
      )}
    </div>
  );
}
