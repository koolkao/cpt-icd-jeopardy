"use client";

import { CellState } from "@/data/types";
import BoardCell from "./BoardCell";
import CategoryHeader from "./CategoryHeader";
interface JeopardyBoardProps {
  board: CellState[][];
  categories: string[];
  onSelectCell: (cat: number, val: number) => void;
}

export default function JeopardyBoard({
  board,
  categories,
  onSelectCell,
}: JeopardyBoardProps) {
  if (!board.length || !categories.length) return null;

  return (
    <div className="w-full h-full grid grid-cols-6 gap-[3px] bg-black/40 rounded-lg overflow-hidden">
      {/* Category headers */}
      {categories.map((cat, i) => (
        <CategoryHeader key={i} name={cat} index={i} />
      ))}

      {/* Value rows: iterate by value index (row), then by category (column) */}
      {[0, 1, 2, 3, 4].map((valIdx) =>
        board.map((catCells, catIdx) => {
          const cell = catCells[valIdx];
          if (!cell) return <div key={`${catIdx}-${valIdx}`} />;
          return (
            <BoardCell
              key={`${catIdx}-${valIdx}`}
              cell={cell}
              onClick={() => onSelectCell(catIdx, valIdx)}
            />
          );
        })
      )}
    </div>
  );
}
