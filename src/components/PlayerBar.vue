<script setup lang="ts">
import type { Color, PieceSymbol } from '../types'
import ChessPiece from './ChessPiece.vue'

/** `captured` are the opponent's pieces this player has taken; `lead` is this player's material advantage in points. */
defineProps<{ name: string; color: Color; active: boolean; captured: PieceSymbol[]; lead: number }>()
</script>

<template>
  <div class="flex min-h-11 items-center gap-2.5 rounded-lg border-l-4 border-transparent px-3 py-1.5" :class="{ 'bg-panel border-l-accent': active }">
    <span class="h-3.5 w-3.5 flex-none rounded-[3px] border" :class="color === 'w' ? 'border-black bg-white' : 'border-[#777] bg-black'" />
    <span class="min-w-0 flex-1 truncate font-semibold">{{ name }}</span>
    <!-- right-aligned tray, so it lines up the same in both bars -->
    <span v-if="captured.length" class="flex flex-none items-center" :aria-label="`captured ${captured.length} pieces`">
      <ChessPiece v-for="(t, i) in captured" :key="i" :color="color === 'w' ? 'b' : 'w'" :type="t" class="-ml-1.5 h-5 w-5 flex-none first:ml-0" />
      <span v-if="lead > 0" class="ml-2 w-6 text-sm font-semibold text-muted">+{{ lead }}</span>
    </span>
    <span v-if="active" class="flex-none text-sm text-muted">to move</span>
  </div>
</template>
