"use client";

import OptionTile from "./OptionTile";
import { LockAndKeyRoundClientData, RevealStep } from "@/data/types";

interface Props {
  roundData: LockAndKeyRoundClientData;
  selectedIndices: number[];
  hasSubmitted: boolean;
  revealedOptions: RevealStep[];
  onToggle: (index: number) => void;
  onSubmit: () => void;
}

export default function PlayerSelectionGrid({
  roundData,
  selectedIndices,
  hasSubmitted,
  revealedOptions,
  onToggle,
  onSubmit,
}: Props) {
  const getRevealState = (optionIndex: number): "correct" | "incorrect" | null => {
    const step = revealedOptions.find((r) => r.optionIndex === optionIndex);
    if (!step) return null;
    return step.option.isCorrect ? "correct" : "incorrect";
  };

  const getPlayerCount = (optionIndex: number): number | undefined => {
    const step = revealedOptions.find((r) => r.optionIndex === optionIndex);
    return step?.playersWhoSelected;
  };

  const getTotalPlayers = (optionIndex: number): number | undefined => {
    const step = revealedOptions.find((r) => r.optionIndex === optionIndex);
    return step?.totalPlayers;
  };

  const isRevealing = revealedOptions.length > 0;

  return (
    <div className="w-full space-y-4">
      {/* Options grid */}
      <div className="grid grid-cols-2 gap-3">
        {roundData.options.map((option) => (
          <OptionTile
            key={option.index}
            code={option.code}
            description={option.description}
            index={option.index}
            isSelected={selectedIndices.includes(option.index)}
            revealState={getRevealState(option.index)}
            playerCount={getPlayerCount(option.index)}
            totalPlayers={getTotalPlayers(option.index)}
            disabled={hasSubmitted || isRevealing}
            onToggle={() => onToggle(option.index)}
          />
        ))}
      </div>

      {/* Submit button */}
      {!isRevealing && (
        <div className="pt-2">
          {hasSubmitted ? (
            <div className="text-center py-3 rounded-lg bg-green-500/15 border border-green-500/30">
              <p className="text-green-300 font-semibold">
                Submitted! Waiting for other players...
              </p>
              <p className="text-white/50 text-sm mt-1">
                {selectedIndices.length} option{selectedIndices.length !== 1 ? "s" : ""} selected
              </p>
            </div>
          ) : (
            <button
              onClick={onSubmit}
              disabled={selectedIndices.length === 0}
              className={`w-full py-3 rounded-lg font-bold text-lg transition-all duration-200
                ${
                  selectedIndices.length > 0
                    ? "bg-jeopardy-gold text-jeopardy-navy hover:bg-jeopardy-gold-light active:scale-[0.98]"
                    : "bg-white/10 text-white/30 cursor-not-allowed"
                }`}
            >
              Lock In ({selectedIndices.length} selected)
            </button>
          )}
        </div>
      )}
    </div>
  );
}
