<script setup lang="ts">
import { useFullscreen } from '../composables/useFullscreen'
import type { Color, PieceSymbol } from '../types'
import ActionButton from './ActionButton.vue'
import PlayerBar from './PlayerBar.vue'

/**
 * Everything one player needs, on their side of the board: name bar, status line and buttons.
 * `far` marks the copy for the player across the table; it is hidden from screen readers, which read the near one.
 */
defineProps<{
  name: string
  color: Color
  active: boolean
  captured: PieceSymbol[]
  lead: number
  /** Status line and buttons; without them the panel is only the name bar. */
  controls: boolean
  status: string
  gameOver: boolean
  canUndo: boolean
  far?: boolean
}>()
defineEmits<{ undo: []; flip: []; resign: []; quit: [] }>()

const fullscreen = useFullscreen()
</script>

<template>
  <div class="grid gap-2">
    <PlayerBar :name="name" :color="color" :active="active" :captured="captured" :lead="lead" :tag="!controls" />
    <template v-if="controls">
      <!-- the active bar already shows whose move it is, so the line speaks up only for check and the result -->
      <p :aria-live="far ? undefined : 'polite'" :aria-hidden="far || undefined" class="min-h-[1.4em] text-center" :class="gameOver ? 'font-semibold text-ink' : 'text-muted'">{{ gameOver || status.includes('check') ? status : '' }}</p>
      <!-- one row under the board, two by two beside it -->
      <div class="grid grid-cols-5 gap-2 landscape:grid-cols-2">
        <ActionButton label="Undo" :disabled="!canUndo" @click="$emit('undo')"><path d="M9 14 4 9l5-5" /><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" /></ActionButton>
        <ActionButton label="Flip" @click="$emit('flip')"><path d="M7 4v16m0 0-3-3m3 3 3-3" /><path d="M17 20V4m0 0-3 3m3-3 3 3" /></ActionButton>
        <ActionButton v-if="fullscreen.supported" :label="fullscreen.active.value ? 'Exit' : 'Full screen'" @click="fullscreen.toggle()"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /></ActionButton>
        <!-- nothing to resign before the first move or after the end -->
        <ActionButton label="Resign" :disabled="gameOver || !canUndo" @click="$emit('resign')"><path d="M4 22V4" /><path d="M4 4h13l-3 4.5 3 4.5H4" /></ActionButton>
        <ActionButton label="New game" @click="$emit('quit')"><path d="M12 5v14M5 12h14" /></ActionButton>
      </div>
    </template>
  </div>
</template>
