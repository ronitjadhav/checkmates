import { describe, expect, it } from 'vitest'
import { Chess } from 'chess.js'
import { legalTargets, material, squareAt, statusText } from './chess'

const names = { w: 'Ann', b: 'Bob' }

describe('squareAt', () => {
  it('maps display cells to squares in both orientations', () => {
    expect(squareAt(0, 0, false)).toBe('a8')
    expect(squareAt(7, 7, false)).toBe('h1')
    expect(squareAt(0, 0, true)).toBe('h1')
    expect(squareAt(7, 7, true)).toBe('a8')
  })
})

describe('legalTargets', () => {
  it('lists destinations for the side to move only', () => {
    const c = new Chess()
    expect([...legalTargets(c, 'g1').keys()].sort()).toEqual(['f3', 'h3'])
    expect(legalTargets(c, 'e4').size).toBe(0)
    expect(legalTargets(c, 'e7').size).toBe(0)
  })
  it('flags promotions, captures and en passant', () => {
    expect(legalTargets(new Chess('4k3/1P6/8/8/8/8/8/4K3 w - - 0 1'), 'b7').get('b8')).toEqual({ capture: false, promotion: true })
    expect(legalTargets(new Chess('4k3/8/8/3pP3/8/8/8/4K3 w - d6 0 1'), 'e5').get('d6')?.capture).toBe(true)
  })
  it('includes castling', () => {
    const t = legalTargets(new Chess('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1'), 'e1')
    expect(t.has('g1') && t.has('c1')).toBe(true)
  })
})

describe('statusText', () => {
  it('names the mover, check and every game end', () => {
    const c = new Chess()
    expect(statusText(c, names)).toBe('Ann to move')
    for (const m of ['e4', 'e5', 'Qh5', 'Nc6', 'Bc4', 'Nf6', 'Qxf7#']) c.move(m)
    expect(statusText(c, names)).toBe('Checkmate · Ann wins')
    expect(statusText(new Chess('7k/5Q2/6K1/8/8/8/8/8 b - - 0 1'), names)).toBe('Stalemate · draw')
    expect(statusText(new Chess('4k3/8/8/8/8/8/8/4K3 w - - 0 1'), names)).toBe('Draw · insufficient material')
    expect(statusText(new Chess('4k3/4R3/8/8/8/8/8/4K3 b - - 0 1'), names)).toBe('Bob is in check')
  })
})

describe('material', () => {
  it('lists captures and scores the lead from the board', () => {
    const c = new Chess()
    for (const m of ['e4', 'd5', 'exd5', 'Qxd5']) c.move(m)
    const { captured, lead } = material(c)
    expect(captured).toEqual({ w: ['p'], b: ['p'] })
    expect(lead).toBe(0)
    c.move('Nc3')
    c.move('Qxg2')
    expect(material(c).lead).toBe(-1)
  })
})
