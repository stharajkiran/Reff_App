import { useState } from 'react'
import type { ParsedFixture } from '../types'
import { STORAGE_KEY } from '../config'
import { storage } from '../storage'

function loadFromStorage(): ParsedFixture[] {
  try {
    const raw = storage.get(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as ParsedFixture[]) : []
  } catch {
    return []
  }
}

function saveToStorage(fixtures: ParsedFixture[]): void {
  storage.set(STORAGE_KEY, JSON.stringify(fixtures))
}

// useShiftFixtures manages the current shift's fixture list.
// Priority: if navFixtures are provided (fresh navigation), they win and are
// persisted immediately. On cold start (no navFixtures), localStorage is used.
export function useShiftFixtures(navFixtures: ParsedFixture[] | undefined) {
  const [fixtures] = useState<ParsedFixture[]>(() => {
    if (navFixtures && navFixtures.length > 0) {
      // Fresh shift — persist immediately so cold starts can recover.
      saveToStorage(navFixtures)
      return navFixtures
    }
    // Cold start or refresh — recover from storage.
    return loadFromStorage()
  })

  // Look up a single fixture by id — used by GamePage.
  function getFixture(fixtureId: string): ParsedFixture | null {
    return fixtures.find((f) => f.id === fixtureId) ?? null
  }

  return { fixtures, getFixture }
}
