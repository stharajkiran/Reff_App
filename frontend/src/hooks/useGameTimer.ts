import { useState, useEffect } from "react";
import { GameResult, GameStatus } from "../types";
import { useSettings } from "./useSettings";

export function useGameTimer(
  result: GameResult | null,
  status: GameStatus,
  id: string,
  updateResult: (id: string, update: Partial<GameResult>) => void,
): { timerDisplay: string; isPastLimit: boolean } {
  // time
  const [now, setNow] = useState(Date.now());

  const { settings } = useSettings();
  const alertSound = new Audio("/alert.mp3");
  const isActive = ["first_half", "half_time", "second_half"].includes(status);
  // Determine which start time to use based on status
  const startedAt =
    status === "first_half"
      ? result?.firstHalfStartedAt
      : status === "second_half"
        ? result?.secondHalfStartedAt
        : status === "half_time"
          ? result?.halfTimeStartedAt
          : null;

  // Time limit is based on the current phase's duration setting.
  // Fallbacks match config defaults in case result hasn't initialized yet.
  const limitSeconds =
    status === "half_time"
      ? (result?.breakDurationSeconds ?? settings.breakDurationSeconds)
      : (result?.halfDurationMinutes ?? settings.halfDurationMinutes) * 60;

  // 2. Calculate elapsed seconds based on the active period.
  const elapsedSeconds = startedAt ? Math.floor((now - startedAt) / 1000) : 0;
  // Visual indicator: are we past the expected duration?
  const isPastLimit = elapsedSeconds > limitSeconds;

  const mins = Math.floor(elapsedSeconds / 60);
  const secs = elapsedSeconds % 60;
  const timerDisplay = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

  // Timer: ticks every second during first_half, auto-transitions when time is up.
  useEffect(() => {
    // Guard: Make sure result exists and we are in a running state
    if (!result || !id) return;

    if (isActive && startedAt) {
      const interval = setInterval(() => {
        const currentTime = Date.now();
        setNow(currentTime);
        // Time in seconds since the current phase started
        const elapsed = Math.floor((currentTime - startedAt) / 1000);
        // ONLY auto-transition if we are in a LIVE half
        if (status === "first_half" || status === "second_half") {
          if (elapsed >= limitSeconds) {
            const nextStatus = status === "first_half" ? "half_time" : "final";
            updateResult(id, {
              status: nextStatus,
              halfTimeStartedAt:
                status === "first_half" ? currentTime : undefined,
            });
          }
        }
        if (status === "half_time" && elapsed === limitSeconds) {
          alertSound.play().catch((e) => console.log("Audio play blocked", e));
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [status, result]);

  return { timerDisplay, isPastLimit };
}
