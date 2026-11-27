<script setup lang="ts">
import { computed, onUnmounted, provide, ref, watch } from 'vue'
import type { Color } from '../types'
import type { Game } from '../composables/useGame'
import { useWakeLock } from '../composables/useWakeLock'
import ChessBoard from './ChessBoard.vue'
import GameOver from './GameOver.vue'
import PlayerPanel from './PlayerPanel.vue'
import PromotionDialog from './PromotionDialog.vue'
import TossReveal from './TossReveal.vue'

const props = defineProps<{ game: Game }>()
const emit = defineEmits<{ quit: [] }>()

const settings = computed(() => props.game.settings!)
// Made for two people on opposite sides of a flat screen; older saves have no value, so they get it too.
const faceToFace = computed(() => settings.value.faceToFace !== false)
provide('symmetricPieces', faceToFace)
const promo = ref<InstanceType<typeof PromotionDialog>>()
useWakeLock()

// Seats are fixed: player 1 at the bottom, player 2 at the top. The board turns so each player's colour is on their side,
// so a toss (or picking black) changes who has white, not who sits where. Rotate mode turns it to the mover instead.
const flipped = ref(settings.value.rotate ? props.game.turn === 'b' : settings.value.white === 'p2')
const showToss = ref(settings.value.colour === 'toss' && !props.game.hasHistory)
// Rotate after a short pause so the mover sees the move land before the board turns.
watch(() => props.game.turn, () => {
  if (settings.value.rotate) setTimeout(() => { flipped.value = props.game.turn === 'b' }, 350)
})
// Let the last move land (and the mated king tip over) before the result card covers the board; undoing the move closes it.
const showOver = ref(false)
let overTimer: ReturnType<typeof setTimeout>
watch(() => props.game.gameOver, over => {
  clearTimeout(overTimer)
  if (over) overTimer = setTimeout(() => { showOver.value = true }, 1100)
  else showOver.value = false
})
onUnmounted(() => clearTimeout(overTimer))
const top = computed(() => (flipped.value ? 'w' : 'b'))
const bottom = computed(() => (flipped.value ? 'b' : 'w'))
// placed by grid area, so the same three elements work stacked and side by side
const sides = computed(() => [
  { area: 'far', far: true, color: top.value },
  { area: 'near', far: false, color: bottom.value },
] as const)

function resign(color: Color) {
  if (confirm(`${props.game.names[color]} resigns?`)) props.game.resign(color)
}

function quit() {
  if (props.game.hasHistory && !props.game.gameOver && !confirm('Abandon this game?')) return
  emit('quit')
}
</script>

<template>
  <section class="screen">
    <div class="playfield" :class="{ 'face-to-face': faceToFace }">
      <!-- face to face, the far player gets the same panel as the near one, turned to face them -->
      <PlayerPanel
        v-for="side in sides"
        :key="side.area"
        :class="[side.area, { 'rotate-180': side.far && faceToFace }]"
        :far="side.far"
        :controls="!side.far || faceToFace"
        :name="game.names[side.color]"
        :color="side.color"
        :active="!game.gameOver && game.turn === side.color"
        :captured="game.mat.captured[side.color]"
        :lead="side.color === 'w' ? game.mat.lead : -game.mat.lead"
        :status="game.status"
        :game-over="game.gameOver"
        :can-undo="game.hasHistory"
        @undo="game.undo()"
        @flip="flipped = !flipped"
        @resign="resign(side.color)"
        @quit="quit"
      />
      <div class="board-area">
        <ChessBoard
          :pieces="game.pieces"
          :selected="game.selected"
          :targets="game.targets"
          :last-move="game.lastMove"
          :checked-king="game.checkedKing"
          :fallen="game.fallenKing"
          :flipped="flipped"
          :hints="settings.hints"
          :drag="settings.drag !== false"
          :turn="game.gameOver ? undefined : game.turn"
          :face-to-face="faceToFace"
          @tap="sq => game.tap(sq, c => promo!.ask(c))"
        />
      </div>
    </div>
    <PromotionDialog ref="promo" />
    <GameOver v-if="showOver && game.outcome" :outcome="game.outcome" :names="game.names" :status="game.status" :face-to-face="faceToFace" @close="showOver = false" @again="emit('quit')" />
    <TossReveal v-if="showToss" :white="game.names.w" :black="game.names.b" :face-to-face="faceToFace" @close="showToss = false" />
  </section>
</template>

<style scoped>
/* Upright screen: far panel, board, near panel in a column as wide as the board. --chrome is the height of everything but the board. */
.playfield {
  --chrome: 228px;
  display: grid;
  gap: 8px;
  grid-template-areas: "far" "board" "near";
  width: min(100%, 100dvh - var(--chrome));
}
.playfield.face-to-face { --chrome: 326px; }
.far { grid-area: far; }
.board-area { grid-area: board; }
.near { grid-area: near; }

/* Sideways screen: the board takes the full height and each panel sits beside it, at its player's right hand. */
@media (orientation: landscape) {
  .playfield {
    --chrome: 44px;
    gap: 16px;
    grid-template-areas: "far board near";
    /* 380px keeps room for the two panels */
    grid-template-columns: minmax(0, 1fr) min(100dvh - var(--chrome), 100vw - 380px) minmax(0, 1fr);
    width: 100%;
  }
  .playfield.face-to-face { --chrome: 60px; }
  .far, .near { width: min(100%, 260px); }
  .far { align-self: start; justify-self: end; }
  .near { align-self: end; justify-self: start; }
}
</style>
