import { ref } from 'vue'
import { inPairing, mergeGames, parseScores, playerKey, toJson, type GameRecord } from '../lib/scores'
import { loadScores, saveScores } from '../lib/storage'

// One list for the whole app, kept on this device.
const games = ref<GameRecord[]>(loadScores())

function set(next: GameRecord[]) {
  games.value = next
  saveScores(next)
}

/** Finished games on this device: recorded by the game, managed from the scores screen. */
export function useScores() {
  return {
    games,
    /** Store a finished game. Recording the same game again replaces it and keeps its date. */
    record(game: Omit<GameRecord, 'date'>) {
      if (playerKey(game.white) === playerKey(game.black)) return // one name on both sides is nobody's win
      const date = games.value.find(g => g.id === game.id)?.date ?? new Date().toISOString()
      set([...games.value.filter(g => g.id !== game.id), { ...game, date }])
    },
    remove(id: string) {
      if (games.value.some(g => g.id === id)) set(games.value.filter(g => g.id !== id))
    },
    removePairing: (key: string) => set(games.value.filter(g => !inPairing(g, key))),
    reset: () => set([]),
    exportJson: () => toJson(games.value),
    /** Merge an exported file in. Returns how many games were new; throws on a file that is not ours. */
    importJson(text: string): number {
      const merged = mergeGames(games.value, parseScores(text))
      const added = merged.length - games.value.length
      set(merged)
      return added
    },
  }
}
