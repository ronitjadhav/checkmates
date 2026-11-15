/** One finished game. Players are told apart by name, ignoring case and outer spaces. */
export interface GameRecord {
  id: string
  /** ISO date and time the game ended. */
  date: string
  white: string
  black: string
  /** Winner's colour, or 'd' for a draw. */
  result: 'w' | 'b' | 'd'
}

export interface Standing { name: string; played: number; won: number; drawn: number; lost: number; points: number }

/** Two players' record against each other. `a` is the one ahead on points. */
export interface Pairing { key: string; a: string; b: string; aWins: number; bWins: number; draws: number; games: GameRecord[] }

export const playerKey = (name: string) => name.trim().toLowerCase()
const pairKey = (g: GameRecord) => [playerKey(g.white), playerKey(g.black)].sort().join('\n')
const newestFirst = (a: GameRecord, b: GameRecord) => b.date.localeCompare(a.date)

/** Win 1, draw ½, loss 0. Best score first. */
export function standings(games: GameRecord[]): Standing[] {
  const table = new Map<string, Standing>()
  const row = (name: string) => {
    const key = playerKey(name)
    if (!table.has(key)) table.set(key, { name, played: 0, won: 0, drawn: 0, lost: 0, points: 0 })
    return table.get(key)!
  }
  // oldest first, so each player ends up shown with the spelling of their latest game
  for (const g of [...games].sort(newestFirst).reverse()) {
    for (const colour of ['w', 'b'] as const) {
      const s = row(colour === 'w' ? g.white : g.black)
      s.name = (colour === 'w' ? g.white : g.black).trim()
      s.played++
      if (g.result === 'd') { s.drawn++; s.points += 0.5 }
      else if (g.result === colour) { s.won++; s.points++ }
      else s.lost++
    }
  }
  return [...table.values()].sort((x, y) => y.points - x.points || y.won - x.won || x.name.localeCompare(y.name))
}

/** Every pair of players that has met, most recently played first. */
export function pairings(games: GameRecord[]): Pairing[] {
  const groups = new Map<string, GameRecord[]>()
  for (const g of [...games].sort(newestFirst)) groups.set(pairKey(g), [...(groups.get(pairKey(g)) ?? []), g])
  return [...groups].map(([key, list]) => {
    const [first, second] = standings(list)
    return { key, a: first.name, b: second.name, aWins: first.won, bWins: second.won, draws: first.drawn, games: list }
  })
}

export const inPairing = (g: GameRecord, key: string) => pairKey(g) === key

/** 2.5 → "2½" */
export const formatPoints = (p: number) => (Number.isInteger(p) ? String(p) : `${Math.floor(p) || ''}½`)

export const toJson = (games: GameRecord[]) => JSON.stringify({ app: 'checkmates', version: 1, games }, null, 2)

/** Read an exported file. Throws when it is not one, so a wrong file never overwrites anything. */
export function parseScores(text: string): GameRecord[] {
  const fail = () => new Error('That is not a Checkmates scores file.')
  let data: unknown
  try { data = JSON.parse(text) } catch { throw fail() }
  const list = Array.isArray(data) ? data : (data as { games?: unknown } | null)?.games
  if (!Array.isArray(list)) throw fail()
  return list.map(item => {
    const g = item as Partial<Record<keyof GameRecord, unknown>> | null
    const text = (v: unknown, max: number) => (typeof v === 'string' && v.trim() && v.length <= max ? v.trim() : null)
    const id = text(g?.id, 40), date = text(g?.date, 40), white = text(g?.white, 20), black = text(g?.black, 20)
    if (!id || !date || !white || !black || Number.isNaN(Date.parse(date)) || playerKey(white) === playerKey(black)) throw fail()
    if (g?.result !== 'w' && g?.result !== 'b' && g?.result !== 'd') throw fail()
    return { id, date, white, black, result: g.result }
  })
}

/** Add the games that are not already there (matched by id). */
export function mergeGames(current: GameRecord[], incoming: GameRecord[]): GameRecord[] {
  const known = new Set(current.map(g => g.id))
  return [...current, ...incoming.filter(g => !known.has(g.id) && known.add(g.id))]
}
