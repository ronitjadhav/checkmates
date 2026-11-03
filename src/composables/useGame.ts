import { computed, reactive, ref, shallowRef } from 'vue'
import { Chess } from 'chess.js'
import { legalTargets, material, statusText } from '../lib/chess'
import { load, save } from '../lib/storage'
import type { Color, Names, Piece, PieceSymbol, Settings, Square, Target } from '../types'

export type AskPromotion = (color: Color) => Promise<PieceSymbol | null>

/** One game of chess plus the setup it was started with. Persists itself after every move. */
export function useGame() {
  const chess = new Chess()
  // chess.js is not reactive; bump `version` after each mutation and derive everything from it.
  const version = ref(0)
  const derived = <T>(fn: () => T) => computed(() => { void version.value; return fn() })

  const settings = ref<Settings | null>(null)
  const names = ref<Names>({ w: 'White', b: 'Black' })
  const selected = ref<Square | null>(null)
  const targets = shallowRef(new Map<Square, Target>())
  const note = ref('')

  const turn = derived(() => chess.turn())
  const pieces = derived(() => {
    const map = new Map<Square, Piece>()
    for (const row of chess.board()) for (const p of row) if (p) map.set(p.square, p)
    return map
  })
  const lastMove = derived(() => chess.history({ verbose: true }).at(-1))
  const mat = derived(() => material(chess))
  const checkedKing = derived(() => (chess.inCheck() ? chess.findPiece({ type: 'k', color: chess.turn() })[0] : undefined))
  const gameOver = derived(() => chess.isGameOver())
  const status = computed(() => { void version.value; return note.value + statusText(chess, names.value) })
  const hasHistory = computed(() => lastMove.value !== undefined)

  function select(sq: Square | null) {
    selected.value = sq
    targets.value = sq ? legalTargets(chess, sq) : new Map()
  }

  function changed() {
    version.value++
    if (settings.value) save({ settings: settings.value, pgn: hasHistory.value ? chess.pgn() : '' })
  }

  function start(s: Settings, pgn?: string) {
    // Load first: a corrupt save throws here and leaves the setup screen showing.
    chess.reset()
    if (pgn) chess.loadPgn(pgn)
    settings.value = s
    names.value = { w: s[s.white], b: s[s.white === 'p1' ? 'p2' : 'p1'] }
    note.value = s.colour === 'toss' && !pgn ? `Toss: ${names.value.w} plays white · ` : ''
    select(null)
    changed()
  }

  /** Resume the game saved by a previous visit. Returns false when there is none. */
  function resume(): boolean {
    const saved = load()
    if (!saved?.settings || !saved.pgn) return false
    try {
      start(saved.settings, saved.pgn)
      return true
    } catch {
      return false
    }
  }

  /** Handle a tap on a square: move there, select a piece, or clear the selection. */
  async function tap(sq: Square, askPromotion: AskPromotion) {
    if (gameOver.value) return
    const target = targets.value.get(sq)
    if (target && selected.value) {
      const promotion = target.promotion ? await askPromotion(chess.turn()) : undefined
      if (target.promotion && !promotion) return select(null)
      chess.move({ from: selected.value, to: sq, promotion: promotion ?? undefined })
      note.value = ''
      select(null)
      return changed()
    }
    const piece = chess.get(sq)
    select(piece && piece.color === chess.turn() && sq !== selected.value ? sq : null)
  }

  function undo() {
    chess.undo()
    select(null)
    changed()
  }

  function quit() {
    if (settings.value) save({ settings: settings.value })
    settings.value = null
  }

  const lastSettings = () => load()?.settings ?? null

  return reactive({ settings, names, selected, targets, turn, pieces, lastMove, checkedKing, mat, gameOver, status, hasHistory, start, resume, tap, undo, quit, lastSettings })
}

export type Game = ReturnType<typeof useGame>
