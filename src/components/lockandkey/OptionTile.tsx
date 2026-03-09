"use client";

import { motion } from "framer-motion";

interface Props {
  code: string;
  description: string;
  index: number;
  isSelected: boolean;
  revealState: "correct" | "incorrect" | null;
  playerCount?: number;
  totalPlayers?: number;
  disabled?: boolean;
  onToggle: () => void;
}

export default function OptionTile({
  code,
  description,
  index,
  isSelected,
  revealState,
  playerCount,
  totalPlayers,
  disabled,
  onToggle,
}: Props) {
  const getStateClasses = () => {
    if (revealState === "correct") {
      return "bg-green-500/20 border-green-500 text-green-300";
    }
    if (revealState === "incorrect") {
      return "bg-red-500/20 border-red-500 text-red-300";
    }
    if (isSelected) {
      return "bg-jeopardy-gold/15 border-jeopardy-gold";
    }
    return "bg-white/5 border-white/20";
  };

  const getCodeColor = () => {
    if (revealState === "correct") return "text-green-300";
    if (revealState === "incorrect") return "text-red-300";
    if (isSelected) return "gold-text";
    return "text-white";
  };

  return (
    <motion.button
      whileTap={!disabled ? { scale: 0.96 } : {}}
      onClick={!disabled ? onToggle : undefined}
      disabled={disabled}
      className={`relative w-full text-left rounded-lg border-2 p-3 md:p-4 transition-colors duration-200
        ${getStateClasses()}
        ${disabled && !revealState ? "opacity-60 cursor-not-allowed" : ""}
        ${!disabled ? "cursor-pointer active:brightness-110" : ""}
      `}
    >
      {/* Option letter badge */}
      <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-jeopardy-navy border border-white/30 flex items-center justify-center">
        <span className="text-xs font-bold text-white/70">
          {String.fromCharCode(65 + index)}
        </span>
      </div>

      {/* Code */}
      <p className={`font-mono font-bold text-base md:text-lg leading-tight ${getCodeColor()}`}>
        {code}
      </p>

      {/* Description */}
      <p className="text-white/70 text-xs md:text-sm mt-1 leading-snug">
        {description}
      </p>

      {/* Selected indicator */}
      {isSelected && !revealState && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-jeopardy-gold flex items-center justify-center"
        >
          <svg
            className="w-3 h-3 text-jeopardy-navy"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>
      )}

      {/* Reveal state icon */}
      {revealState && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={`absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center
            ${revealState === "correct" ? "bg-green-500" : "bg-red-500"}`}
        >
          {revealState === "correct" ? (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </motion.div>
      )}

      {/* Player count badge (shown during reveal) */}
      {revealState && playerCount !== undefined && totalPlayers !== undefined && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-2 text-xs text-white/50"
        >
          {playerCount}/{totalPlayers} players selected
        </motion.div>
      )}
    </motion.button>
  );
}
