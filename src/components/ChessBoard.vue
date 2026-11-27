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
  /** King that has lost (mated or resigned): it tips over. */
  fallen?: Square
  flipped: boolean
  hints: boolean
  /** Pieces can be dragged; off leaves tap-to-move only. */
  drag?: boolean
  /** Side allowed to move; undefined when the game is over. Only its pieces can be dragged. */
  turn?: Piece['color']
  /** Players sit opposite each other: coordinates on all four sides, and the far player drags from their side. */
  faceToFace?: boolean
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
  if (!props.drag || pending || e.button !== 0) return
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
    // the far player's finger comes from the top edge, so their piece is held on the other side of it
    const fromFarSide = props.faceToFace && pending.piece.color === (props.flipped ? 'w' : 'b')
    const size = (board.value?.getBoundingClientRect().width ?? 320) / 8
    // on touch, hold the piece above the fingertip so it stays visible
    drag.value = { from: pending.from, piece: pending.piece, x: 0, y: 0, over: null, size, lift: pending.touch ? size * 0.7 * (fromFarSide ? -1 : 1) : 0 }
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
      mate: sq === props.fallen,
      legal: props.targets.get(sq),
      dragging: sq === drag.value?.from,
      over: !!drag.value && sq === drag.value.over && sq !== drag.value.from,
    }
  }),
)
</script>

<template>
  <div class="grid gap-x-1 gap-y-0.5 text-xs font-semibold leading-none text-muted" :class="faceToFace ? 'grid-cols-[1rem_1fr_1rem]' : 'grid-cols-[1rem_1fr]'">
    <!-- face to face: the far player gets their own letters and numbers, turned to face them -->
    <template v-if="faceToFace">
      <span />
      <div aria-hidden="true" class="grid grid-cols-8 text-center">
        <span v-for="f in files" :key="f" class="rotate-180">{{ f }}</span>
      </div>
      <span />
    </template>
    <div aria-hidden="true" class="grid grid-rows-8">
      <span v-for="r in ranks" :key="r" class="flex items-center justify-center">{{ r }}</span>
    </div>
    <div ref="board" role="group" aria-label="Chess board" class="board grid grid-cols-8 overflow-hidden rounded shadow-[0_10px_30px_rgba(0,0,0,.45)]" @pointerdown="onDown" @click.capture="onClick">
      <!-- keyed by position, not square, so a flip patches the buttons in place and keeps focus -->
      <BoardSquare v-for="(cell, i) in cells" :key="i" v-bind="cell" :hints="hints" @tap="emit('tap', cell.sq)" />
    </div>
    <div v-if="faceToFace" aria-hidden="true" class="grid grid-rows-8">
      <span v-for="r in ranks" :key="r" class="flex rotate-180 items-center justify-center">{{ r }}</span>
    </div>
    <span />
    <div aria-hidden="true" class="grid grid-cols-8 text-center">
      <span v-for="f in files" :key="f">{{ f }}</span>
    </div>
    <span v-if="faceToFace" />
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
