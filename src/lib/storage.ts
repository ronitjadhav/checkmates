import type { Settings } from '../types'

const KEY = 'checkmates'

export interface Saved {
  settings: Settings
  /** Moves so far; empty or missing when no game is in progress. */
  pgn?: string
}

// Storage can be blocked by privacy settings, so every access is guarded.
export function load(): Saved | null {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? 'null')
  } catch {
    return null
  }
}

export function save(data: Saved): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(data))
  } catch {
    /* nothing to do: the game still plays, it just will not survive a reload */
  }
}
