"use client";

import { QuestionRevealData } from "@/data/types";
import { motion } from "framer-motion";
import ConfettiEffect from "@/components/effects/ConfettiEffect";

interface QuestionRevealProps {
  data: QuestionRevealData;
  answeredBy: string | null;
  wasCorrect: boolean;
  onReturnToBoard: () => void;
}

export default function QuestionReveal({
  data,
  answeredBy,
  wasCorrect,
  onReturnToBoard,
}: QuestionRevealProps) {
  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {wasCorrect && <ConfettiEffect trigger={true} />}

      {/* Who answered */}
      {answeredBy && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-center py-2 rounded-lg ${
            wasCorrect
              ? "bg-correct/20 border border-correct/40"
              : "bg-incorrect/20 border border-incorrect/40"
          }`}
        >
          <p className={`text-lg font-bold ${wasCorrect ? "text-correct" : "text-incorrect"}`}>
            {wasCorrect ? "✓" : "✗"} {answeredBy}{" "}
            {wasCorrect ? "got it right!" : "answered incorrectly"}
          </p>
        </motion.div>
      )}

      {/* Correct Response */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center"
      >
        <p className="text-blue-200 text-sm uppercase tracking-wider mb-2">
          Correct Response
        </p>
        <p className="text-3xl md:text-5xl font-display font-bold text-white">
          {data.correctResponse}
        </p>
      </motion.div>

      {/* Code */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-center bg-white/10 rounded-lg py-3 px-6 inline-block mx-auto"
      >
        <p className="text-sm text-blue-200">{data.codeType} Code</p>
        <p className="text-2xl md:text-3xl font-mono font-bold gold-text">
          {data.code}
        </p>
        <p className="text-sm text-blue-200 mt-1">{data.category}</p>
      </motion.div>

      {/* Mnemonic */}
      {data.mnemonic && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mnemonic-card"
        >
          <p className="text-lg font-semibold text-jeopardy-gold mb-2">
            💡 Memory Trick
          </p>
          <p className="text-white text-lg leading-relaxed">
            {data.mnemonic}
          </p>
        </motion.div>
      )}

      {/* Fact */}
      {data.fact && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="fact-card"
        >
          <p className="text-lg font-semibold text-blue-400 mb-2">
            📚 Did You Know?
          </p>
          <p className="text-white text-lg leading-relaxed">{data.fact}</p>
        </motion.div>
      )}

      {/* Return button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-center pt-4"
      >
        <button
          onClick={onReturnToBoard}
          className="px-8 py-3 rounded-lg bg-jeopardy-gold text-jeopardy-navy font-bold text-lg hover:bg-jeopardy-gold-light transition-colors"
        >
          Return to Board
        </button>
      </motion.div>
    </div>
  );
}
