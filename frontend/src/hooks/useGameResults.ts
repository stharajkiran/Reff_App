import { useState } from 'react'
import type { GameResult } from '../types'
import { HALF_DURATION_MINUTES, BREAK_DURATION_SECONDS } from '../config'

// Storage key — all game results are stored under this single key.
const STORAGE_KEY = 'gameResults'

// Read persisted results from localStorage, or return an empty record.
// Record<string, GameResult> means: an object where keys are fixtureIds
// and values are GameResult. Example: { "fixture-1": { homeScore: 2, ... } }
function loadFromStorage(): Record<string, GameResult> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Record<string, GameResult>) : {}
  } catch {
    // If storage is corrupted, start fresh rather than crashing.
    return {}
  }
}

// Write the full results map back to localStorage.
function saveToStorage(results: Record<string, GameResult>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(results))
}

// Creates a fresh GameResult for a fixture that is opening for the first time.
function createDefaultResult(fixtureId: string): GameResult {
  return {
    fixtureId,
    homeScore: 0,
    awayScore: 0,
    status: 'not_started',
    firstHalfStartedAt: null,
    halfTimeStartedAt: null,
    secondHalfStartedAt: null,
    halfDurationMinutes: HALF_DURATION_MINUTES,
    breakDurationSeconds: BREAK_DURATION_SECONDS,
    incidents: [],
  }
}

// useGameResults is the single source of truth for game state.
// Both ShiftPage and GamePage call this hook to read and write results.
// When Phase 4 arrives, only loadFromStorage and saveToStorage change —
// the hook's returned API stays identical, so pages need no changes.
export function useGameResults() {
  // In-memory state of all game results for this session, keyed by fixtureId.
  // results format is dictionary: { [fixtureId]: GameResult } 
  const [results, setResults] = useState<Record<string, GameResult>>(loadFromStorage)
   
  // Update one game result and immediately persist the change.
  function updateResult(fixtureId: string, update: Partial<GameResult>): void {
    setResults((prev) => {
      const existing = prev[fixtureId]
      const updated = { //spread operator (...)
        ...existing,
        ...update,
        fixtureId, // fixtureId explicitly included for first time initialization
      }
      const next = { ...prev, [fixtureId]: updated }
      saveToStorage(next)
      return next
    })
  }

  // Get the result for a single fixture, or null if it hasn't started.
  function getResult(fixtureId: string): GameResult | null {
    return results[fixtureId] ?? null
  }

  return { results, getResult, updateResult, createDefaultResult }
}
