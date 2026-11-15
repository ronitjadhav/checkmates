<script setup lang="ts">
import { provide, ref } from 'vue'
import type { Color, PieceSymbol } from '../types'
import ChessPiece from './ChessPiece.vue'

/**
 * `captured` are the opponent's pieces this player has taken; `lead` is this player's material advantage in points.
 * `tag` adds "to move" for a bar that has no status line under it.
 */
defineProps<{ name: string; color: Color; active: boolean; captured: PieceSymbol[]; lead: number; tag?: boolean }>()
// The bar already faces its reader, so the captured pieces use the classic set, which is clearer at this size.
provide('symmetricPieces', ref(false))
</script>

<template>
  <!-- wraps when it sits in the narrow column beside the board: name first, captured pieces under it -->
  <div class="flex min-h-11 flex-wrap items-center gap-x-2.5 gap-y-1 rounded-lg border-l-4 border-transparent px-3 py-1.5" :class="{ 'bg-panel border-l-accent': active }">
    <span class="h-3.5 w-3.5 flex-none rounded-[3px] border" :class="color === 'w' ? 'border-black bg-white' : 'border-[#777] bg-black'" />
    <span class="min-w-[3ch] flex-1 truncate font-semibold">{{ name }}</span>
    <span v-if="captured.length" class="flex max-w-full flex-wrap items-center pl-1.5" :aria-label="`captured ${captured.length} pieces`">
      <ChessPiece v-for="(t, i) in captured" :key="i" :color="color === 'w' ? 'b' : 'w'" :type="t" class="-ml-1.5 h-5 w-5 flex-none" :class="{ 'on-dark': color === 'w' }" />
      <span v-if="lead > 0" class="ml-2 text-sm font-semibold text-muted">+{{ lead }}</span>
    </span>
    <span v-if="tag && active" class="flex-none text-sm text-muted">to move</span>
  </div>
</template>

<style scoped>
/* captured black pieces sit on a near-black bar: a light rim keeps them visible */
.on-dark { filter: drop-shadow(0 0 .5px rgba(255, 255, 255, .9)); }
</style>
