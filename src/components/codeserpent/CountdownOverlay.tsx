"use client";

import { motion, AnimatePresence } from "framer-motion";

interface CountdownOverlayProps {
  secondsLeft: number;
  scenarioText: string;
  category: string;
  round: number;
  totalRounds: number;
  isPlayer?: boolean;
}

export default function CountdownOverlay({
  secondsLeft,
  scenarioText,
  category,
  round,
  totalRounds,
  isPlayer = false,
}: CountdownOverlayProps) {
  const displayText = secondsLeft > 0 ? String(secondsLeft) : "GO!";
  const isGo = secondsLeft <= 0;

  if (isPlayer) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-gradient-to-b from-jeopardy-navy via-jeopardy-dark to-jeopardy-blue">
        {/* Top: Round indicator (fixed) */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-4 shrink-0"
        >
          <p className="text-blue-200 text-base uppercase tracking-wider">
            Round {round} of {totalRounds}
          </p>
          <p className="text-jeopardy-gold text-sm mt-1">{category}</p>
        </motion.div>

        {/* Middle: Scenario text (scrollable) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex-1 overflow-y-auto px-5 pb-4"
        >
          <p className="text-white text-center text-xl leading-relaxed">
            {scenarioText}
          </p>
        </motion.div>

        {/* Bottom: Countdown number (fixed) */}
        <div className="shrink-0 pb-8 pt-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={displayText}
              initial={{ opacity: 0, scale: 2 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ type: "spring", damping: 12, stiffness: 200 }}
              className="text-center"
            >
              <span
                className={`font-display font-bold ${
                  isGo
                    ? "text-7xl text-green-400 drop-shadow-[0_0_40px_rgba(34,197,94,0.5)]"
                    : "text-7xl gold-text"
                }`}
              >
                {displayText}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-jeopardy-navy via-jeopardy-dark to-jeopardy-blue">
      {/* Round indicator */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <p className="text-blue-200 text-sm uppercase tracking-wider">
          Round {round} of {totalRounds}
        </p>
        <p className="text-jeopardy-gold text-xs mt-1">{category}</p>
      </motion.div>

      {/* Scenario text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="max-w-2xl mx-auto px-6 mb-12"
      >
        <p className="text-white text-center text-lg md:text-xl leading-relaxed">
          {scenarioText}
        </p>
      </motion.div>

      {/* Countdown number */}
      <AnimatePresence mode="wait">
        <motion.div
          key={displayText}
          initial={{ opacity: 0, scale: 2 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ type: "spring", damping: 12, stiffness: 200 }}
          className="text-center"
        >
          <span
            className={`font-display font-bold ${
              isGo
                ? "text-8xl md:text-[12rem] text-green-400 drop-shadow-[0_0_40px_rgba(34,197,94,0.5)]"
                : "text-8xl md:text-[10rem] gold-text"
            }`}
          >
            {displayText}
          </span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
