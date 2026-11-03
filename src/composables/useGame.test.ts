import { describe, expect, it } from 'vitest'
import { useGame } from './useGame'
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
})
