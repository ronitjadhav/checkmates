import type { Chess } from 'chess.js'
import type { Color, Names, PieceSymbol, Square, Target } from '../types'

const FILES = 'abcdefgh'

/** Algebraic square drawn at display row `r` (0 = top) and column `c` (0 = left). */
export function squareAt(r: number, c: number, flipped: boolean): Square {
  return (flipped ? FILES[7 - c] + (r + 1) : FILES[c] + (8 - r)) as Square
}

export function legalTargets(chess: Chess, from: Square): Map<Square, Target> {
  const targets = new Map<Square, Target>()
  for (const m of chess.moves({ square: from, verbose: true })) {
    targets.set(m.to, { capture: !!m.captured, promotion: !!m.promotion })
  }
  return targets
}

export function statusText(chess: Chess, names: Names): string {
  const mover = names[chess.turn()]
  const other = names[chess.turn() === 'w' ? 'b' : 'w']
  if (chess.isCheckmate()) return `Checkmate · ${other} wins`
  if (chess.isStalemate()) return 'Stalemate · draw'
  if (chess.isThreefoldRepetition()) return 'Draw · threefold repetition'
  if (chess.isInsufficientMaterial()) return 'Draw · insufficient material'
  if (chess.isDrawByFiftyMoves()) return 'Draw · fifty-move rule'
  return chess.inCheck() ? `${mover} is in check` : `${mover} to move`
}

const VALUE: Record<PieceSymbol, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 }

/** Pieces each side has captured (most valuable first) and white's material lead on the board, in points. */
export function material(chess: Chess): { captured: Record<Color, PieceSymbol[]>; lead: number } {
  const captured: Record<Color, PieceSymbol[]> = { w: [], b: [] }
  for (const m of chess.history({ verbose: true })) if (m.captured) captured[m.color].push(m.captured)
  for (const list of Object.values(captured)) list.sort((a, b) => VALUE[b] - VALUE[a])
  // counted from the board, not the captures, so a promotion adds to its side's points
  let lead = 0
  for (const row of chess.board()) for (const p of row) if (p) lead += (p.color === 'w' ? 1 : -1) * VALUE[p.type]
  return { captured, lead }
}
