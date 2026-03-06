"use client";

import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";

interface ConfettiEffectProps {
  trigger: boolean;
}

export default function ConfettiEffect({ trigger }: ConfettiEffectProps) {
  const fired = useRef(false);

  useEffect(() => {
    if (trigger && !fired.current) {
      fired.current = true;

      // Initial burst
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#FFCC00", "#060CE9", "#FFFFFF", "#22C55E"],
      });

      // Side cannons
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.6 },
          colors: ["#FFCC00", "#060CE9"],
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.6 },
          colors: ["#FFCC00", "#060CE9"],
        });
      }, 300);
    }
  }, [trigger]);

  return null;
}
