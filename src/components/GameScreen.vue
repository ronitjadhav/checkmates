<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Game } from '../composables/useGame'
import { useFullscreen } from '../composables/useFullscreen'
import { useWakeLock } from '../composables/useWakeLock'
import ActionButton from './ActionButton.vue'
import ChessBoard from './ChessBoard.vue'
import PlayerBar from './PlayerBar.vue'
import PromotionDialog from './PromotionDialog.vue'

const props = defineProps<{ game: Game }>()
const emit = defineEmits<{ quit: [] }>()

const settings = computed(() => props.game.settings!)
const promo = ref<InstanceType<typeof PromotionDialog>>()
const fullscreen = useFullscreen()
useWakeLock()

const flipped = ref(settings.value.rotate && props.game.turn === 'b')
// Rotate after a short pause so the mover sees the move land before the board turns.
watch(() => props.game.turn, () => {
  if (settings.value.rotate) setTimeout(() => { flipped.value = props.game.turn === 'b' }, 350)
})
const top = computed(() => (flipped.value ? 'w' : 'b'))
const bottom = computed(() => (flipped.value ? 'b' : 'w'))

function quit() {
  if (props.game.hasHistory && !props.game.gameOver && !confirm('Abandon this game?')) return
  emit('quit')
}
</script>

<template>
  <section class="screen">
    <div class="playfield grid gap-2">
      <PlayerBar :name="game.names[top]" :color="top" :active="!game.gameOver && game.turn === top" :captured="game.mat.captured[top]" :lead="top === 'w' ? game.mat.lead : -game.mat.lead" />
      <ChessBoard
        :pieces="game.pieces"
        :selected="game.selected"
        :targets="game.targets"
        :last-move="game.lastMove"
        :checked-king="game.checkedKing"
        :flipped="flipped"
        :hints="settings.hints"
        :turn="game.gameOver ? undefined : game.turn"
        @tap="sq => game.tap(sq, c => promo!.ask(c))"
      />
      <PlayerBar :name="game.names[bottom]" :color="bottom" :active="!game.gameOver && game.turn === bottom" :captured="game.mat.captured[bottom]" :lead="bottom === 'w' ? game.mat.lead : -game.mat.lead" />
      <p aria-live="polite" class="min-h-[1.4em] text-center" :class="game.gameOver ? 'font-semibold text-ink' : 'text-muted'">{{ game.status }}</p>
      <div class="flex gap-2">
        <ActionButton label="Undo" :disabled="!game.hasHistory" @click="game.undo()"><path d="M9 14 4 9l5-5" /><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" /></ActionButton>
        <ActionButton label="Flip" @click="flipped = !flipped"><path d="M7 4v16m0 0-3-3m3 3 3-3" /><path d="M17 20V4m0 0-3 3m3-3 3 3" /></ActionButton>
        <ActionButton v-if="fullscreen.supported" :label="fullscreen.active.value ? 'Exit' : 'Full screen'" @click="fullscreen.toggle()"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /></ActionButton>
        <ActionButton label="New game" @click="quit"><path d="M12 5v14M5 12h14" /></ActionButton>
      </div>
    </div>
    <PromotionDialog ref="promo" />
  </section>
</template>

<style scoped>
/* as wide as the screen allows, but leave room for the bars, status and buttons */
.playfield { width: min(100%, 100dvh - 240px); }
</style>
