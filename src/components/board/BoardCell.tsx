"use client";

import { CellState } from "@/data/types";
import { motion } from "framer-motion";

interface BoardCellProps {
  cell: CellState;
  onClick: () => void;
}

export default function BoardCell({ cell, onClick }: BoardCellProps) {
  return (
    <motion.div
      whileHover={!cell.isRevealed ? { scale: 1.03 } : {}}
      whileTap={!cell.isRevealed ? { scale: 0.97 } : {}}
      onClick={!cell.isRevealed ? onClick : undefined}
      className={`board-cell min-h-[50px] md:min-h-[70px] lg:min-h-[90px] ${
        cell.isRevealed ? "revealed" : ""
      }`}
    >
      {!cell.isRevealed && (
        <span className="gold-text text-lg md:text-2xl lg:text-3xl font-bold font-display">
          ${cell.pointValue}
        </span>
      )}
    </motion.div>
  );
}
