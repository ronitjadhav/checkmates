import { describe, expect, it } from 'vitest'
import { useGame } from './useGame'
import { useScores } from './useScores'
import type { Settings } from '../types'

const settings: Settings = { p1: 'Ann', p2: 'Bob', colour: 'p1black', rotate: false, hints: true, white: 'p2' }
const never = () => Promise.resolve(null)

describe('useGame', () => {
  it('assigns colours from the settings and plays a move by tapping', async () => {
    const g = useGame()
    g.start(settings)
    expect(g.names).toEqual({ w: 'Bob', b: 'Ann' })
    expect(g.status).toBe('Bob to move')
    await g.tap('e2', never)
    expect(g.selected).toBe('e2')
    expect([...g.targets.keys()].sort()).toEqual(['e3', 'e4'])
    await g.tap('e4', never)
    expect(g.selected).toBeNull()
    expect(g.turn).toBe('b')
    expect(g.pieces.get('e4')?.type).toBe('p')
    expect(g.lastMove?.san).toBe('e4')
    g.undo()
    expect(g.hasHistory).toBe(false)
    expect(g.turn).toBe('w')
  })

  it('ignores taps on the opponent pieces and toggles selection', async () => {
    const g = useGame()
    g.start(settings)
    await g.tap('e7', never)
    expect(g.selected).toBeNull()
    await g.tap('g1', never)
    await g.tap('g1', never)
    expect(g.selected).toBeNull()
  })

  it('asks for the promotion piece and cancels cleanly', async () => {
    const g = useGame()
    g.start(settings, '1. a4 b5 2. axb5 a6 3. bxa6 Nc6 4. a7 Nb8')
    await g.tap('a7', never)
    expect(g.targets.get('b8')).toEqual({ capture: true, promotion: true })
    await g.tap('b8', never)
    expect(g.selected).toBeNull()
    expect(g.pieces.get('a7')?.type).toBe('p')
    await g.tap('a7', never)
    await g.tap('b8', () => Promise.resolve('q'))
    expect(g.pieces.get('b8')).toMatchObject({ type: 'q', color: 'w' })
    expect(g.checkedKing).toBeUndefined()
  })

  it('reports checkmate and stops taking moves', async () => {
    const g = useGame()
    g.start(settings, '1. e4 e5 2. Qh5 Nc6 3. Bc4 Nf6')
    await g.tap('h5', never)
    await g.tap('f7', never)
    expect(g.gameOver).toBe(true)
    expect(g.status).toBe('Checkmate · Bob wins')
    expect(g.checkedKing).toBe('e8')
    await g.tap('e8', never)
    expect(g.selected).toBeNull()
  })

  it('scores a finished game once and takes it back on undo', async () => {
    const scores = useScores()
    scores.reset()
    const g = useGame()
    g.start(settings) // Bob has white
    for (const sq of ['f2', 'f3', 'e7', 'e5', 'g2', 'g4', 'd8', 'h4']) await g.tap(sq as never, never)
    expect(g.status).toBe('Checkmate · Ann wins')
    expect(scores.games.value).toMatchObject([{ white: 'Bob', black: 'Ann', result: 'b' }])
    g.undo()
    expect(scores.games.value).toEqual([])
    await g.tap('d8', never)
    await g.tap('h4', never)
    expect(scores.games.value).toHaveLength(1)
  })

  it('lets a player resign, scores it and takes it back on undo', async () => {
    const scores = useScores()
    scores.reset()
    const g = useGame()
    g.start(settings) // Bob has white
    g.resign('b')
    expect(g.gameOver).toBe(false) // nothing to resign before the first move
    await g.tap('e2', never)
    await g.tap('e4', never)
    g.resign('b')
    expect(g.gameOver).toBe(true)
    expect(g.outcome).toBe('w')
    expect(g.status).toBe('Ann resigned · Bob wins')
    expect(g.fallenKing).toBe('e8')
    expect(scores.games.value).toMatchObject([{ white: 'Bob', black: 'Ann', result: 'w' }])
    await g.tap('e7', never)
    expect(g.selected).toBeNull()
    g.undo() // takes back the resignation, not the move
    expect(g.gameOver).toBe(false)
    expect(g.lastMove?.san).toBe('e4')
    expect(scores.games.value).toEqual([])
  })
})
