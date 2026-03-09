"use client";

import { useRef, useCallback } from "react";
import {
  playCorrectDing,
  playWrongBuzzer,
  playCountdownTick,
  playDailyDoubleFanfare,
  playVictoryFanfare,
  playBuzzIn,
  playTimerWarning,
  playTimerExpired,
  playRevealCorrect,
  playRevealIncorrect,
  playSubmitted,
  playPerfectRound,
  playCollectCorrect,
  playCollectWrong,
  playCollision,
  playCountdownBeep,
  playRoundStart,
  playRoundEnd,
} from "@/lib/sounds";

export function useSound() {
  const ctxRef = useRef<AudioContext | null>(null);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
    }
    if (ctxRef.current.state === "suspended") {
      ctxRef.current.resume();
    }
    return ctxRef.current;
  }, []);

  return {
    playCorrect: useCallback(() => playCorrectDing(getCtx()), [getCtx]),
    playWrong: useCallback(() => playWrongBuzzer(getCtx()), [getCtx]),
    playTick: useCallback(() => playCountdownTick(getCtx()), [getCtx]),
    playDailyDouble: useCallback(() => playDailyDoubleFanfare(getCtx()), [getCtx]),
    playVictory: useCallback(() => playVictoryFanfare(getCtx()), [getCtx]),
    playBuzzIn: useCallback(() => playBuzzIn(getCtx()), [getCtx]),
    // Lock & Key sounds
    playTimerWarning: useCallback(() => playTimerWarning(getCtx()), [getCtx]),
    playTimerExpired: useCallback(() => playTimerExpired(getCtx()), [getCtx]),
    playRevealCorrect: useCallback(() => playRevealCorrect(getCtx()), [getCtx]),
    playRevealIncorrect: useCallback(() => playRevealIncorrect(getCtx()), [getCtx]),
    playSubmitted: useCallback(() => playSubmitted(getCtx()), [getCtx]),
    playPerfectRound: useCallback(() => playPerfectRound(getCtx()), [getCtx]),
    // Code Serpent sounds
    playCollectCorrect: useCallback(() => playCollectCorrect(getCtx()), [getCtx]),
    playCollectWrong: useCallback(() => playCollectWrong(getCtx()), [getCtx]),
    playCollision: useCallback(() => playCollision(getCtx()), [getCtx]),
    playCountdownBeep: useCallback(() => playCountdownBeep(getCtx()), [getCtx]),
    playRoundStart: useCallback(() => playRoundStart(getCtx()), [getCtx]),
    playRoundEnd: useCallback(() => playRoundEnd(getCtx()), [getCtx]),
  };
}
