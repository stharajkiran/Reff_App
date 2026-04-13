import { useMemo, useState } from "react";
import type { CompletedShift } from "../types";
import { storage } from "../storage";

const STORAGE_KEY = "shiftHistory";

// Record<string, CompletedShift> — keyed by shift id
function loadFromStorage(): Record<string, CompletedShift> {
  try {
    const raw = storage.get(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, CompletedShift>) : {};
  } catch {
    return {};
  }
}

function saveToStorage(history: Record<string, CompletedShift>): void {
  storage.set(STORAGE_KEY, JSON.stringify(history));
}

export function useShiftHistory() {
  // shiftHistory is an object keyed by shift ID for easy lookup and update.
  const [shiftHistory, setShiftHistory] = useState(loadFromStorage);

  const history = useMemo(
    () =>
      Object.values(shiftHistory).sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      ),
    [shiftHistory],
  );
  function addShiftToHistory(shift: CompletedShift): void {
    setShiftHistory((prev) => {
      const next = { ...prev, [shift.id]: shift };
      saveToStorage(next);
      return next;
    });
  }

  function markReported(shiftId: string): void {
    setShiftHistory((prev) => {
      const shift = prev[shiftId];
      if (!shift) return prev; // Shift not found, no update
      const updatedShift = {
        ...shift,
        reportSent: true,
        reportSentAt: new Date().toISOString(),
      };
      const next = { ...prev, [shiftId]: updatedShift };
      saveToStorage(next);
      return next;
    });
  }

  function deleteShift(shiftId: string): void {
    setShiftHistory((prev) => {
      if (!prev[shiftId]) return prev; // Shift not found, no update
      const next = { ...prev };
      delete next[shiftId];
      saveToStorage(next);
      return next;
    });
  }

  return {
    shiftHistory,
    history,
    addShiftToHistory,
    markReported,
    deleteShift,
  };
}
