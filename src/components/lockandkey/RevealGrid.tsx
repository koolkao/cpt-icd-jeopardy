"use client";

import { RevealStep } from "@/data/types";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  options: { code: string; description: string; index: number }[];
  revealedSteps: RevealStep[];
  totalPlayers: number;
}

export default function RevealGrid({
  options,
  revealedSteps,
  totalPlayers,
}: Props) {
  const getRevealStep = (optionIndex: number): RevealStep | undefined => {
    return revealedSteps.find((s) => s.optionIndex === optionIndex);
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
      {options.map((option) => {
        const step = getRevealStep(option.index);
        const isRevealed = !!step;
        const isCorrect = step?.option.isCorrect ?? false;

        return (
          <div key={option.index} className="relative">
            <AnimatePresence mode="wait">
              {isRevealed ? (
                <motion.div
                  key={`revealed-${option.index}`}
                  initial={{ opacity: 0, scale: 0.8, rotateY: 90 }}
                  animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className={`rounded-lg border-2 p-4 md:p-5 ${
                    isCorrect
                      ? "bg-green-500/20 border-green-500"
                      : "bg-red-500/20 border-red-500"
                  }`}
                >
                  {/* Icon */}
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-2xl md:text-3xl ${isCorrect ? "text-green-400" : "text-red-400"}`}>
                      {isCorrect ? (
                        // Key icon
                        <svg className="w-7 h-7 md:w-8 md:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                        </svg>
                      ) : (
                        // Lock icon
                        <svg className="w-7 h-7 md:w-8 md:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                        </svg>
                      )}
                    </span>
                    <span className="text-xs font-bold text-white/50 uppercase tracking-wider">
                      {String.fromCharCode(65 + option.index)}
                    </span>
                  </div>

                  {/* Code */}
                  <p className={`font-mono font-bold text-lg md:text-xl ${
                    isCorrect ? "text-green-300" : "text-red-300"
                  }`}>
                    {option.code}
                  </p>

                  {/* Description */}
                  <p className="text-white/70 text-xs md:text-sm mt-1 leading-snug">
                    {option.description}
                  </p>

                  {/* Player count */}
                  {step && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="mt-3 pt-2 border-t border-white/10"
                    >
                      <p className="text-white/50 text-xs">
                        {step.playersWhoSelected}/{totalPlayers} players selected
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key={`hidden-${option.index}`}
                  className="rounded-lg border-2 border-white/10 bg-white/5 p-4 md:p-5 opacity-40"
                >
                  {/* Option letter */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/30 text-lg">?</span>
                    <span className="text-xs font-bold text-white/30 uppercase tracking-wider">
                      {String.fromCharCode(65 + option.index)}
                    </span>
                  </div>

                  {/* Dimmed code */}
                  <p className="font-mono font-bold text-lg md:text-xl text-white/30">
                    {option.code}
                  </p>
                  <p className="text-white/20 text-xs md:text-sm mt-1 leading-snug">
                    {option.description}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
