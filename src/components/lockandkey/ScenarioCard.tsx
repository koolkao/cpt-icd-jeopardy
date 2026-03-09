"use client";

import { motion } from "framer-motion";

interface Props {
  cptCode: string;
  cptDescription: string;
  scenario: string;
  category?: string;
  subcategory?: string;
  compact?: boolean;
}

export default function ScenarioCard({
  cptCode,
  cptDescription,
  scenario,
  category,
  subcategory,
  compact,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`w-full rounded-lg border border-white/10 bg-white/5 ${
        compact ? "p-3" : "p-5 md:p-6"
      }`}
    >
      {/* Category / subcategory tags */}
      {(category || subcategory) && (
        <div className="flex flex-wrap gap-2 mb-3">
          {category && (
            <span className="text-[10px] md:text-xs uppercase tracking-wider px-2 py-0.5 rounded-full bg-jeopardy-blue/40 border border-jeopardy-blue/60 text-blue-200">
              {category}
            </span>
          )}
          {subcategory && (
            <span className="text-[10px] md:text-xs uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 border border-white/20 text-white/60">
              {subcategory}
            </span>
          )}
        </div>
      )}

      {/* CPT Code */}
      <div className={compact ? "mb-2" : "mb-3"}>
        <p
          className={`font-mono font-bold gold-text ${
            compact ? "text-xl" : "text-2xl md:text-4xl"
          }`}
        >
          {cptCode}
        </p>
        <p
          className={`text-blue-200 mt-1 ${
            compact ? "text-xs" : "text-sm md:text-base"
          }`}
        >
          {cptDescription}
        </p>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-white/10 mb-3" />

      {/* Scenario */}
      <div>
        <p
          className={`text-white/50 uppercase tracking-wider mb-1 ${
            compact ? "text-[10px]" : "text-xs"
          }`}
        >
          Clinical Scenario
        </p>
        <p
          className={`text-white leading-relaxed ${
            compact ? "text-sm" : "text-base md:text-lg"
          }`}
        >
          {scenario}
        </p>
      </div>
    </motion.div>
  );
}
