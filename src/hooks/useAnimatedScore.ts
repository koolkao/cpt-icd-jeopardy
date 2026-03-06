"use client";

import { useState, useEffect, useRef } from "react";

export function useAnimatedScore(targetScore: number, duration = 800) {
  const [displayScore, setDisplayScore] = useState(targetScore);
  const animationRef = useRef<number>();
  const prevTarget = useRef(targetScore);

  useEffect(() => {
    if (prevTarget.current === targetScore) return;
    const startScore = displayScore;
    const delta = targetScore - startScore;
    if (delta === 0) {
      prevTarget.current = targetScore;
      return;
    }

    const startTime = performance.now();

    function animate(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(startScore + delta * eased));

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    }

    animationRef.current = requestAnimationFrame(animate);
    prevTarget.current = targetScore;

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetScore, duration]);

  return displayScore;
}
