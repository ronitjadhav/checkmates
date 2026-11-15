<script setup lang="ts">
import { ref } from 'vue'
import type { Color, PieceSymbol } from '../types'
import ChessPiece from './ChessPiece.vue'

const PIECES: { type: PieceSymbol; label: string }[] = [
  { type: 'q', label: 'Queen' },
  { type: 'r', label: 'Rook' },
  { type: 'b', label: 'Bishop' },
  { type: 'n', label: 'Knight' },
]

const dialog = ref<HTMLDialogElement>()
const color = ref<Color>('w')
let resolve: ((piece: PieceSymbol | null) => void) | undefined

/** Open the picker and resolve with the chosen piece, or null when dismissed. */
function ask(c: Color): Promise<PieceSymbol | null> {
  color.value = c
  dialog.value!.returnValue = ''
  dialog.value!.showModal()
  return new Promise(r => { resolve = r })
}

function onClose() {
  resolve?.((dialog.value!.returnValue || null) as PieceSymbol | null)
  resolve = undefined
}

defineExpose({ ask })
</script>

<template>
  <dialog ref="dialog" aria-label="Promote pawn to" class="m-auto rounded-xl bg-panel p-2.5 text-ink backdrop:bg-[#0000008c]" @close="onClose" @click.self="dialog?.close()">
    <form method="dialog" class="flex gap-1.5">
      <button v-for="p in PIECES" :key="p.type" :value="p.type" :aria-label="p.label" class="h-16 w-16 rounded-lg bg-square-light p-1">
        <ChessPiece :color="color" :type="p.type" class="h-full w-full" />
      </button>
    </form>
  </dialog>
</template>
