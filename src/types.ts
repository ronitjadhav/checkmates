import type { Color, Piece, PieceSymbol, Square } from 'chess.js'

export type { Color, Piece, PieceSymbol, Square }

export type Player = 'p1' | 'p2'
export type ColourChoice = 'p1white' | 'p1black' | 'toss'

export interface Settings {
  p1: string
  p2: string
  colour: ColourChoice
  rotate: boolean
  hints: boolean
  /** Which player got white once a toss is resolved. */
  white: Player
}

export type Names = Record<Color, string>

/** What a tap on this square would do with the current selection. */
export interface Target {
  capture: boolean
  promotion: boolean
}
