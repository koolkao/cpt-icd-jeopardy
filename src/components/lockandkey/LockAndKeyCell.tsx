"use client";

import { LockAndKeyCellState } from "@/data/types";
import { motion } from "framer-motion";

interface Props {
  cell: LockAndKeyCellState;
  onClick: () => void;
}

export default function LockAndKeyCell({ cell, onClick }: Props) {
  const isRevealed = cell.isRevealed;

  return (
    <motion.div
      whileHover={!isRevealed ? { scale: 1.03 } : {}}
      whileTap={!isRevealed ? { scale: 0.97 } : {}}
      onClick={!isRevealed ? onClick : undefined}
      className={`relative flex flex-col items-center justify-center cursor-pointer select-none
        border-2 border-black/30 transition-all duration-200
        min-h-[50px] md:min-h-[70px] lg:min-h-[90px] p-1
        ${
          isRevealed
            ? "opacity-30 cursor-default bg-[#1a1a2e]"
            : "bg-gradient-to-b from-[#1a10d1] via-[#060CE9] to-[#0008b8] hover:brightness-125"
        }`}
    >
      {!isRevealed ? (
        <>
          <span className="gold-text text-sm md:text-lg lg:text-xl font-bold font-mono leading-tight">
            {cell.cptCode}
          </span>
          <span className="text-blue-200 text-[9px] md:text-xs lg:text-sm leading-tight text-center mt-0.5 line-clamp-2">
            {cell.subcategory}
          </span>
        </>
      ) : (
        <span className="text-white/30 text-xs md:text-sm font-mono">
          {cell.cptCode}
        </span>
      )}
    </motion.div>
  );
}
