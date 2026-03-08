"use client";

import { PlayerScore } from "@/data/types";
import { motion, AnimatePresence } from "framer-motion";

interface MiniLeaderboardProps {
  scores: PlayerScore[];
  myName: string;
}

export default function MiniLeaderboard({
  scores,
  myName,
}: MiniLeaderboardProps) {
  if (!scores.length) return null;

  return (
    <div className="bg-white/5 rounded-lg p-3 space-y-1.5">
      <p className="text-xs text-blue-200/60 uppercase tracking-wider mb-2">
        Leaderboard
      </p>
      <AnimatePresence>
        {scores.map((s, i) => {
          const isMe = s.name.toLowerCase() === myName.toLowerCase();
          const isLeader = i === 0 && s.score > 0 && (scores.length === 1 || s.score > scores[1].score);
          return (
            <motion.div
              key={s.id}
              layout
              className={`flex items-center justify-between py-1.5 px-2 rounded text-sm ${
                isMe
                  ? "bg-jeopardy-gold/10 border border-jeopardy-gold/20"
                  : ""
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-blue-200/50 w-5 text-right text-xs">
                  {isLeader ? "👑" : `#${i + 1}`}
                </span>
                <span
                  className={
                    isMe ? "text-jeopardy-gold font-semibold" : "text-white/70"
                  }
                >
                  {s.name}
                  {isMe && " (you)"}
                </span>
                {s.streak >= 3 && (
                  <span className="text-xs">{"🔥".repeat(Math.min(s.streak - 2, 3))}</span>
                )}
              </div>
              <span
                className={`font-mono text-xs ${
                  isMe ? "text-jeopardy-gold font-bold" : "text-white/50"
                }`}
              >
                ${s.score.toLocaleString()}
              </span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
