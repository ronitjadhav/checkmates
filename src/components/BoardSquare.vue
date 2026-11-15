<script setup lang="ts">
import { computed } from 'vue'
import type { Piece, Square, Target } from '../types'
import ChessPiece from './ChessPiece.vue'

const NAMES = { p: 'pawn', n: 'knight', b: 'bishop', r: 'rook', q: 'queen', k: 'king' } as const
const COLOURS = { w: 'white', b: 'black' } as const

const props = defineProps<{
  sq: Square
  piece?: Piece
  light: boolean
  selected: boolean
  last: boolean
  check: boolean
  /** Legal destination from the selected piece (always known, drawn only when hints are on). */
  legal?: Target
  hints: boolean
  /** Piece is being dragged away from this square. */
  dragging?: boolean
  /** Dragged piece is hovering over this square. */
  over?: boolean
}>()
defineEmits<{ tap: [] }>()

const label = computed(() =>
  (props.piece ? `${COLOURS[props.piece.color]} ${NAMES[props.piece.type]} on ${props.sq}` : props.sq) +
  (props.legal ? (props.legal.capture ? ', capture' : ', legal move') : ''),
)
</script>

<template>
  <button
    type="button"
    class="sq"
    :data-sq="sq"
    :class="{ light, selected, last, check, dragging, over, target: hints && legal && !legal.capture, capture: hints && legal?.capture }"
    :aria-label="label"
    :aria-pressed="selected || undefined"
    @click="$emit('tap')"
  >
    <ChessPiece v-if="piece" :color="piece.color" :type="piece.type" />
  </button>
</template>

<style scoped>
.sq { position: relative; width: 100%; aspect-ratio: 1; padding: 0; border: 0; border-radius: 0; background: var(--color-square-dark); appearance: none; }
.sq.light { background: var(--color-square-light); }
.sq::before { content: ''; position: absolute; inset: 0; }
.sq.selected::before, .sq.last::before { background: rgba(255, 255, 51, .45); }
.sq.check::before { background: radial-gradient(circle, rgba(255, 0, 0, .9) 0%, rgba(231, 0, 0, .7) 25%, rgba(169, 0, 0, 0) 90%); }
.sq.target::after { content: ''; position: absolute; inset: 0; margin: auto; width: 32%; height: 32%; border-radius: 50%; background: rgba(0, 0, 0, .17); }
.sq.capture::after { content: ''; position: absolute; inset: 0; border-radius: 50%; border: 5px solid rgba(0, 0, 0, .17); border-width: 1.1cqw; }
.sq :deep(.piece) { position: absolute; inset: -2%; width: 104%; height: 104%; pointer-events: none; }
.sq.dragging :deep(.piece) { opacity: .3; }
.sq.over { box-shadow: inset 0 0 0 3px rgba(255, 255, 255, .8); box-shadow: inset 0 0 0 max(3px, .6cqw) rgba(255, 255, 255, .8); }
.sq:focus-visible { outline: 3px solid #1b1b1b; outline-offset: -3px; z-index: 1; }
</style>
