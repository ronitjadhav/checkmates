import { describe, expect, it } from 'vitest'
import { formatPoints, mergeGames, pairings, parseScores, standings, toJson, type GameRecord } from './scores'

const game = (id: string, white: string, black: string, result: GameRecord['result']): GameRecord =>
  ({ id, date: `2026-11-0${id}T10:00:00.000Z`, white, black, result })

const games = [
  game('1', 'Ann', 'Bob', 'w'),
  game('2', 'Bob', 'Ann', 'd'),
  game('3', 'ann ', 'Cy', 'b'), // same Ann, typed differently
  game('4', 'Bob', 'Cy', 'w'),
]

describe('standings', () => {
  it('adds up each player across all opponents, win 1 and draw ½', () => {
    expect(standings(games)).toEqual([
      { name: 'ann', played: 3, won: 1, drawn: 1, lost: 1, points: 1.5 },
      { name: 'Bob', played: 3, won: 1, drawn: 1, lost: 1, points: 1.5 },
      { name: 'Cy', played: 2, won: 1, drawn: 0, lost: 1, points: 1 },
    ])
  })
})

describe('pairings', () => {
  it('keeps each pair apart, whoever had white, newest pair first', () => {
    const [bobCy, annCy, annBob] = pairings(games)
    expect([bobCy.a, bobCy.b, annCy.a, annCy.b]).toEqual(['Bob', 'Cy', 'Cy', 'ann'])
    expect(annBob).toMatchObject({ a: 'Ann', b: 'Bob', aWins: 1, bWins: 0, draws: 1 })
    expect(annBob.games.map(g => g.id)).toEqual(['2', '1'])
  })
})

describe('export and import', () => {
  it('round-trips, and merging skips games already there', () => {
    const back = parseScores(toJson(games))
    expect(back).toEqual(games.map(g => ({ ...g, white: g.white.trim() })))
    expect(mergeGames(games.slice(0, 2), back).map(g => g.id)).toEqual(['1', '2', '3', '4'])
  })

  it('rejects anything that is not a scores file', () => {
    for (const bad of ['', 'nope', '{}', '{"games":[{"id":"1"}]}', JSON.stringify([{ ...games[0], result: 'x' }]), JSON.stringify([{ ...games[0], black: 'ANN' }])]) {
      expect(() => parseScores(bad)).toThrow('not a Checkmates scores file')
    }
  })
})

describe('formatPoints', () => {
  it('writes halves as ½', () => {
    expect([0, 0.5, 2, 2.5].map(formatPoints)).toEqual(['0', '½', '2', '2½'])
  })
})
