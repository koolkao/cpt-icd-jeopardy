"use client";

import { PlayerScore } from "@/data/types";
import { useAnimatedScore } from "@/hooks/useAnimatedScore";
import { motion, AnimatePresence } from "framer-motion";

interface LeaderboardProps {
  scores: PlayerScore[];
  isGameOver?: boolean;
}

function ScoreRow({
  player,
  rank,
  isGameOver,
}: {
  player: PlayerScore;
  rank: number;
  isGameOver?: boolean;
}) {
  const displayScore = useAnimatedScore(player.score);

  const getRankStyle = () => {
    switch (rank) {
      case 1:
        return "bg-yellow-500/20 border-yellow-500/50 text-yellow-300";
      case 2:
        return "bg-gray-300/10 border-gray-400/30 text-gray-300";
      case 3:
        return "bg-orange-600/15 border-orange-500/30 text-orange-300";
      default:
        return "bg-white/5 border-white/10 text-white/70";
    }
  };

  const getRankIcon = () => {
    if (rank === 1) return isGameOver ? "👑" : "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex items-center justify-between px-4 py-3 rounded-lg border ${getRankStyle()} ${
        rank <= 3 ? "text-lg" : "text-base"
      }`}
    >
      <div className="flex items-center gap-3">
        <span className={`text-xl ${rank <= 3 ? "text-2xl" : ""}`}>
          {getRankIcon()}
        </span>
        <span className={`font-semibold ${rank === 1 ? "text-xl" : ""}`}>
          {player.name}
        </span>
        {player.streak >= 3 && (
          <span className="streak-fire text-sm">
            {"🔥".repeat(Math.min(player.streak - 2, 3))}
          </span>
        )}
      </div>
      <span className={`font-mono font-bold ${rank === 1 ? "text-xl gold-text" : ""}`}>
        ${displayScore.toLocaleString()}
      </span>
    </motion.div>
  );
}

export default function Leaderboard({ scores, isGameOver }: LeaderboardProps) {
  return (
    <div className="w-full max-w-lg mx-auto space-y-2">
      <AnimatePresence>
        {scores.map((player, i) => (
          <ScoreRow
            key={player.id}
            player={player}
            rank={i + 1}
            isGameOver={isGameOver}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
