import type { GameRecord } from './scores'
import type { Settings } from '../types'

const KEY = 'checkmates'
const SCORES_KEY = 'checkmates-scores'

export interface Saved {
  settings: Settings
  /** Moves so far; empty or missing when no game is in progress. */
  pgn?: string
  /** Identifies the game in progress in the scores, so finishing it twice counts once. */
  id?: string
}

// Storage can be blocked by privacy settings, so every access is guarded.
function read<T>(key: string): T | null {
  try {
    return JSON.parse(localStorage.getItem(key) ?? 'null')
  } catch {
    return null
  }
}

function write(key: string, data: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch {
    /* nothing to do: the game still plays, it just will not survive a reload */
  }
}

export const load = () => read<Saved>(KEY)
export const save = (data: Saved) => write(KEY, data)

export function loadScores(): GameRecord[] {
  const games = read<GameRecord[]>(SCORES_KEY)
  return Array.isArray(games) ? games : []
}
export const saveScores = (games: GameRecord[]) => write(SCORES_KEY, games)
