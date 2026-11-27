<script setup lang="ts">
import { computed } from 'vue'
import type { Color } from '../types'
import ChessPiece from './ChessPiece.vue'

/** End-of-game card: the winner's king rises over falling confetti; a draw brings both kings together. */
const props = defineProps<{ outcome: Color | 'd'; names: Record<Color, string>; status: string; faceToFace: boolean }>()
defineEmits<{ close: []; again: [] }>()

const title = computed(() => (props.outcome === 'd' ? 'Draw' : `${props.names[props.outcome]} wins`))
// "Checkmate · X wins" -> "Checkmate", "Ann resigned · Bob wins" -> "Ann resigned"; "Draw · threefold repetition" -> "threefold repetition"
const reason = computed(() => (props.outcome === 'd' ? props.status.replace(/^Draw · /, '').replace(' · draw', '') : props.status.split(' · ')[0]))
// fixed numbers, not Math.random, so the confetti is the same every time and needs no state
const confetti = Array.from({ length: 28 }, (_, i) => ({
  '--x': `${(i * 37) % 100}%`,
  '--delay': `${((i * 53) % 90) / 100}s`,
  '--dur': `${2.2 + ((i * 29) % 15) / 10}s`,
  '--spin': `${(i % 2 ? 1 : -1) * (360 + ((i * 71) % 360))}deg`,
  '--c': ['#ff6600', '#f4f4f4', '#769656', '#ffd23f'][i % 4],
}))
</script>

<template>
  <div class="fixed inset-0 z-40 grid place-items-center overflow-hidden bg-[#000000b0] p-6" role="dialog" :aria-label="`${title}, ${reason}`" @click.self="$emit('close')">
    <template v-if="outcome !== 'd'">
      <span v-for="(style, i) in confetti" :key="i" class="confetti" :style="style" aria-hidden="true" />
    </template>
    <div class="grid justify-items-center gap-5 text-center">
      <div v-if="faceToFace" aria-hidden="true" class="rotate-180">
        <p class="text-3xl font-bold">{{ title }}</p>
        <p class="text-muted first-letter:uppercase">{{ reason }}</p>
      </div>
      <div class="medal relative grid h-28 w-28 place-items-center rounded-full border-4 border-accent bg-[#f4f4f4] shadow-[0_8px_24px_rgba(0,0,0,.6)]" :class="{ draw: outcome === 'd' }">
        <template v-if="outcome === 'd'">
          <ChessPiece color="w" type="k" class="king-l absolute h-16 w-16" />
          <ChessPiece color="b" type="k" class="king-r absolute h-16 w-16" />
        </template>
        <ChessPiece v-else :color="outcome" type="k" class="h-20 w-20" />
      </div>
      <div>
        <p class="text-3xl font-bold">{{ title }}</p>
        <p class="text-muted first-letter:uppercase">{{ reason }}</p>
      </div>
      <div class="flex gap-2">
        <button type="button" class="btn px-5" @click="$emit('close')">Board</button>
        <button type="button" class="btn border-accent bg-accent px-5 font-semibold text-black" autofocus @click="$emit('again')">New game</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.medal { animation: pop .7s cubic-bezier(.2, 1.4, .4, 1) both; }
.medal:not(.draw)::after { content: ''; position: absolute; inset: -4px; border-radius: 50%; border: 3px solid var(--color-accent); animation: ring 1.6s .5s ease-out infinite; }
.king-l { animation: slide-l .8s .3s ease-out both; }
.king-r { animation: slide-r .8s .3s ease-out both; }
.confetti { position: absolute; top: -16px; left: var(--x); width: 9px; height: 14px; background: var(--c); animation: fall var(--dur) var(--delay) linear infinite; }
@keyframes pop { from { transform: scale(0) rotate(-25deg); } }
@keyframes ring { to { transform: scale(1.6); opacity: 0; } }
@keyframes slide-l { from { transform: translateX(-80px); opacity: 0; } to { transform: translateX(-14px); } }
@keyframes slide-r { from { transform: translateX(80px); opacity: 0; } to { transform: translateX(14px); } }
@keyframes fall { to { transform: translateY(110dvh) rotate(var(--spin)); } }
@media (prefers-reduced-motion: reduce) { .medal, .medal::after, .king-l, .king-r { animation: none; } .confetti { display: none; } }
</style>
