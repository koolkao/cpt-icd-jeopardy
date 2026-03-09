"use client";

import { LockAndKeyCellState } from "@/data/types";
import LockAndKeyCell from "./LockAndKeyCell";
import CategoryHeader from "../board/CategoryHeader";

interface Props {
  board: LockAndKeyCellState[][];
  categories: string[];
  onSelectCell: (cat: number, val: number) => void;
}

export default function LockAndKeyBoard({
  board,
  categories,
  onSelectCell,
}: Props) {
  if (!board.length || !categories.length) return null;

  return (
    <div className="w-full h-full grid grid-cols-6 gap-[3px] bg-black/40 rounded-lg overflow-hidden">
      {/* Category headers */}
      {categories.map((cat, i) => (
        <CategoryHeader key={i} name={cat} index={i} />
      ))}

      {/* 4 rows of cells: iterate by row index, then by category (column) */}
      {[0, 1, 2, 3].map((rowIdx) =>
        board.map((catCells, catIdx) => {
          const cell = catCells[rowIdx];
          if (!cell) return <div key={`${catIdx}-${rowIdx}`} />;
          return (
            <LockAndKeyCell
              key={`${catIdx}-${rowIdx}`}
              cell={cell}
              onClick={() => onSelectCell(catIdx, rowIdx)}
            />
          );
        })
      )}
    </div>
  );
}
