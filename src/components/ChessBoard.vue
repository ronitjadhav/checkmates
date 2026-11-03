<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
import { squareAt } from '../lib/chess'
import type { Piece, Square, Target } from '../types'
import BoardSquare from './BoardSquare.vue'
import ChessPiece from './ChessPiece.vue'

const props = defineProps<{
  pieces: Map<Square, Piece>
  selected: Square | null
  targets: Map<Square, Target>
  lastMove?: { from: Square; to: Square }
  checkedKing?: Square
  flipped: boolean
  hints: boolean
  /** Side allowed to move; undefined when the game is over. Only its pieces can be dragged. */
  turn?: Piece['color']
}>()
const emit = defineEmits<{ tap: [square: Square] }>()

// Drag and drop on top of tap-to-move. Plain taps still go through the squares' click handlers.
interface Drag { from: Square; piece: Piece; x: number; y: number; over: Square | null; size: number; lift: number }
const board = ref<HTMLElement>()
const drag = ref<Drag | null>(null)
let pending: { from: Square; piece: Piece; x: number; y: number; id: number; touch: boolean } | null = null
let suppressClick = false

const squareAtPoint = (x: number, y: number) =>
  document.elementFromPoint(x, y)?.closest<HTMLElement>('[data-sq]')?.dataset.sq as Square | undefined

function onDown(e: PointerEvent) {
  if (pending || e.button !== 0) return
  const from = squareAtPoint(e.clientX, e.clientY)
  const piece = from && props.pieces.get(from)
  if (!from || !piece || piece.color !== props.turn) return
  pending = { from, piece, x: e.clientX, y: e.clientY, id: e.pointerId, touch: e.pointerType !== 'mouse' }
  window.addEventListener('pointermove', onMove)
  window.addEventListener('pointerup', onUp)
  window.addEventListener('pointercancel', stop)
}

function onMove(e: PointerEvent) {
  if (!pending || e.pointerId !== pending.id) return
  if (!drag.value) {
    if (Math.hypot(e.clientX - pending.x, e.clientY - pending.y) < 6) return
    // picking a piece up selects it, so its legal moves show while dragging
    if (props.selected !== pending.from) emit('tap', pending.from)
    const size = (board.value?.getBoundingClientRect().width ?? 320) / 8
    // on touch, hold the piece above the fingertip so it stays visible
    drag.value = { from: pending.from, piece: pending.piece, x: 0, y: 0, over: null, size, lift: pending.touch ? size * 0.7 : 0 }
  }
  drag.value.x = e.clientX
  drag.value.y = e.clientY
  drag.value.over = squareAtPoint(e.clientX, e.clientY - drag.value.lift) ?? null
}

function onUp() {
  const d = drag.value
  stop()
  if (!d) return // a plain tap: let the click through
  suppressClick = true
  setTimeout(() => (suppressClick = false), 50)
  if (d.over && d.over !== d.from && props.targets.has(d.over)) emit('tap', d.over)
}

function stop() {
  window.removeEventListener('pointermove', onMove)
  window.removeEventListener('pointerup', onUp)
  window.removeEventListener('pointercancel', stop)
  pending = null
  drag.value = null
}

function onClick(e: MouseEvent) {
  if (!suppressClick) return
  suppressClick = false
  e.stopPropagation()
}

onUnmounted(stop)

// coordinates sit outside the board so they never cover a piece
const ranks = computed(() => Array.from({ length: 8 }, (_, r) => squareAt(r, 0, props.flipped)[1]))
const files = computed(() => Array.from({ length: 8 }, (_, c) => squareAt(7, c, props.flipped)[0]))

const cells = computed(() =>
  Array.from({ length: 64 }, (_, i) => {
    const r = i >> 3, c = i & 7
    const sq = squareAt(r, c, props.flipped)
    return {
      sq,
      piece: props.pieces.get(sq),
      light: (r + c) % 2 === 0,
      selected: sq === props.selected,
      last: sq === props.lastMove?.from || sq === props.lastMove?.to,
      check: sq === props.checkedKing,
      legal: props.targets.get(sq),
      dragging: sq === drag.value?.from,
      over: !!drag.value && sq === drag.value.over && sq !== drag.value.from,
    }
  }),
)
</script>

<template>
  <div class="grid grid-cols-[1rem_1fr] gap-x-1 gap-y-0.5 text-xs font-semibold leading-none text-muted">
  <div aria-hidden="true" class="grid grid-rows-8">
    <span v-for="r in ranks" :key="r" class="flex items-center justify-center">{{ r }}</span>
  </div>
  <div ref="board" role="group" aria-label="Chess board" class="board grid grid-cols-8 overflow-hidden rounded shadow-[0_10px_30px_rgba(0,0,0,.45)]" @pointerdown="onDown" @click.capture="onClick">
    <!-- keyed by position, not square, so a flip patches the buttons in place and keeps focus -->
    <BoardSquare v-for="(cell, i) in cells" :key="i" v-bind="cell" :hints="hints" @tap="emit('tap', cell.sq)" />
  </div>
  <span />
  <div aria-hidden="true" class="grid grid-cols-8 text-center">
    <span v-for="f in files" :key="f">{{ f }}</span>
  </div>
  </div>
  <Teleport to="body">
    <ChessPiece
      v-if="drag"
      :color="drag.piece.color"
      :type="drag.piece.type"
      class="pointer-events-none fixed z-50"
      :style="{ left: 0, top: 0, width: drag.size * 1.2 + 'px', height: drag.size * 1.2 + 'px', transform: `translate(${drag.x - drag.size * 0.6}px, ${drag.y - drag.lift - drag.size * 0.6}px)` }"
    />
  </Teleport>
</template>

<style scoped>
/* lets squares size captures rings and coordinates in cqw */
.board { container-type: inline-size; touch-action: none; }
</style>
