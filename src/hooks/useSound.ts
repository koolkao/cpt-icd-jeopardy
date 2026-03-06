"use client";

import { useRef, useCallback } from "react";
import {
  playCorrectDing,
  playWrongBuzzer,
  playCountdownTick,
  playDailyDoubleFanfare,
  playVictoryFanfare,
  playBuzzIn,
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
  };
}
