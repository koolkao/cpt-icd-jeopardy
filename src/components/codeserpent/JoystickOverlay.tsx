"use client";

import { useCallback } from "react";
import type { Direction } from "@/data/types";

interface JoystickOverlayProps {
  onDirection: (direction: Direction) => void;
}

export default function JoystickOverlay({ onDirection }: JoystickOverlayProps) {
  const handleTouch = useCallback(
    (direction: Direction) => (e: React.TouchEvent | React.MouseEvent) => {
      e.preventDefault();
      onDirection(direction);
      if (navigator.vibrate) navigator.vibrate(20);
    },
    [onDirection]
  );

  const btnBase =
    "absolute flex items-center justify-center select-none active:opacity-80 transition-opacity";
  const btnStyle =
    "w-[72px] h-[72px] rounded-xl bg-white/20 border-2 border-white/30 text-white/70 text-2xl font-bold backdrop-blur-sm";

  return (
    <div className="cs-joystick-container">
      {/* Up */}
      <button
        className={`${btnBase} ${btnStyle} cs-joystick-up`}
        onTouchStart={handleTouch("up")}
        onMouseDown={handleTouch("up")}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="18 15 12 9 6 15" />
        </svg>
      </button>

      {/* Down */}
      <button
        className={`${btnBase} ${btnStyle} cs-joystick-down`}
        onTouchStart={handleTouch("down")}
        onMouseDown={handleTouch("down")}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Left */}
      <button
        className={`${btnBase} ${btnStyle} cs-joystick-left`}
        onTouchStart={handleTouch("left")}
        onMouseDown={handleTouch("left")}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      {/* Right */}
      <button
        className={`${btnBase} ${btnStyle} cs-joystick-right`}
        onTouchStart={handleTouch("right")}
        onMouseDown={handleTouch("right")}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  );
}
