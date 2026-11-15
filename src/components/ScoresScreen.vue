<script setup lang="ts">
import { computed, ref } from 'vue'
import { useScores } from '../composables/useScores'
import { formatPoints, pairings, standings, type GameRecord, type Pairing } from '../lib/scores'

defineEmits<{ back: [] }>()

const scores = useScores()
const table = computed(() => standings(scores.games.value))
const pairs = computed(() => pairings(scores.games.value))
const message = ref('')

const count = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`
const points = (p: Pairing, wins: number) => formatPoints(wins + p.draws / 2)
const day = (g: GameRecord) => new Date(g.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
const outcome = (g: GameRecord) =>
  g.result === 'd' ? `Draw (${g.white} had white)` : g.result === 'w' ? `${g.white} won with white` : `${g.black} won with black`

function removeGame(g: GameRecord) {
  if (confirm(`Remove this game from the scores?\n${day(g)}: ${outcome(g)}`)) scores.remove(g.id)
}
function resetPairing(p: Pairing) {
  if (confirm(`Remove all ${p.games.length} games between ${p.a} and ${p.b}?`)) scores.removePairing(p.key)
}
function resetAll() {
  if (confirm(`Remove all ${scores.games.value.length} games from the scores? This cannot be undone.`)) scores.reset()
}

function exportFile() {
  const url = URL.createObjectURL(new Blob([scores.exportJson()], { type: 'application/json' }))
  Object.assign(document.createElement('a'), { href: url, download: `checkmates-scores-${new Date().toISOString().slice(0, 10)}.json` }).click()
  URL.revokeObjectURL(url)
}

async function importFile(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = '' // so picking the same file again fires a change
  if (!file) return
  try {
    const added = scores.importJson(await file.text())
    message.value = added ? `Added ${added} ${added === 1 ? 'game' : 'games'}.` : 'Nothing new in that file.'
  } catch (err) {
    message.value = err instanceof Error ? err.message : 'That file could not be read.'
  }
}
</script>

<template>
  <section class="screen justify-start">
    <div class="flex min-h-0 w-full max-w-[520px] flex-1 flex-col gap-3">
      <header class="flex items-center gap-3">
        <button type="button" class="btn" @click="$emit('back')">Back</button>
        <h1 class="text-2xl font-bold tracking-tight">Scores</h1>
      </header>

      <div class="grid min-h-0 flex-1 content-start gap-5 overflow-y-auto">
        <p v-if="!table.length" class="rounded-[10px] bg-panel px-4 py-6 text-center text-muted">
          No finished games yet. A game is added here when it ends in checkmate or a draw.
        </p>
        <template v-else>
          <table class="w-full border-collapse text-left tabular-nums">
            <caption class="mb-1 text-left text-sm text-muted">Win 1 point, draw ½</caption>
            <thead class="text-sm text-muted">
              <tr>
                <th class="py-1.5 pr-2 font-medium">Player</th>
                <th class="w-10 px-1 text-right font-medium"><abbr title="Played" class="no-underline">P</abbr></th>
                <th class="w-10 px-1 text-right font-medium"><abbr title="Won" class="no-underline">W</abbr></th>
                <th class="w-10 px-1 text-right font-medium"><abbr title="Drawn" class="no-underline">D</abbr></th>
                <th class="w-10 px-1 text-right font-medium"><abbr title="Lost" class="no-underline">L</abbr></th>
                <th class="w-12 pl-1 text-right font-medium"><abbr title="Points" class="no-underline">Pts</abbr></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in table" :key="s.name" class="border-t border-line">
                <th scope="row" class="max-w-0 truncate py-2.5 pr-2 font-semibold">{{ s.name }}</th>
                <td class="px-1 text-right text-muted">{{ s.played }}</td>
                <td class="px-1 text-right">{{ s.won }}</td>
                <td class="px-1 text-right">{{ s.drawn }}</td>
                <td class="px-1 text-right">{{ s.lost }}</td>
                <td class="pl-1 text-right font-semibold text-accent">{{ formatPoints(s.points) }}</td>
              </tr>
            </tbody>
          </table>

          <div class="grid gap-2">
            <h2 class="text-sm text-muted">Head to head (tap a pair for its games)</h2>
            <details v-for="p in pairs" :key="p.key" class="rounded-[10px] bg-panel">
              <summary class="grid cursor-pointer grid-cols-[1fr_auto_1fr] items-center gap-3 px-3.5 py-3">
                <span class="truncate text-right font-semibold">{{ p.a }}</span>
                <span class="text-lg font-bold tabular-nums">{{ points(p, p.aWins) }} – {{ points(p, p.bWins) }}</span>
                <span class="truncate font-semibold">{{ p.b }}</span>
                <span class="text-right text-sm text-muted">{{ count(p.aWins, 'win') }}</span>
                <span class="text-center text-sm text-muted">{{ count(p.draws, 'draw') }}</span>
                <span class="text-sm text-muted">{{ count(p.bWins, 'win') }}</span>
              </summary>
              <ul class="grid gap-1 border-t border-line px-3.5 py-2 text-sm">
                <li v-for="g in p.games" :key="g.id" class="flex items-center gap-2">
                  <span class="w-24 flex-none text-muted">{{ day(g) }}</span>
                  <span class="min-w-0 flex-1 truncate">{{ outcome(g) }}</span>
                  <button type="button" class="min-h-9 flex-none rounded-lg px-2.5 text-muted hover:text-ink" :aria-label="`Remove game: ${day(g)}, ${outcome(g)}`" @click="removeGame(g)">Remove</button>
                </li>
              </ul>
              <div class="border-t border-line px-3.5 py-2 text-right">
                <button type="button" class="btn text-sm" @click="resetPairing(p)">Reset this pair</button>
              </div>
            </details>
          </div>
        </template>
      </div>

      <p v-if="message" role="status" class="text-center text-sm text-muted">{{ message }}</p>
      <footer class="grid grid-cols-3 gap-2">
        <button type="button" class="btn" :disabled="!table.length" @click="exportFile">Export</button>
        <label class="btn flex cursor-pointer items-center justify-center has-focus-visible:outline-2 has-focus-visible:outline-accent">
          Import
          <input type="file" accept="application/json,.json" class="sr-only" @change="importFile">
        </label>
        <button type="button" class="btn" :disabled="!table.length" @click="resetAll">Reset all</button>
      </footer>
    </div>
  </section>
</template>
