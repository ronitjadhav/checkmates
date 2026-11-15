<script setup lang="ts">
import ChessPiece from './ChessPiece.vue'

/** Shows who won the toss before the first move. In face-to-face mode the far player gets a copy turned to face them. */
defineProps<{ white: string; black: string; faceToFace: boolean }>()
defineEmits<{ close: [] }>()
</script>

<template>
  <div class="fixed inset-0 z-40 grid place-items-center bg-[#000000c4] p-6" role="dialog" aria-label="Toss result" @click="$emit('close')">
    <div class="grid justify-items-center gap-6 text-center">
      <p v-if="faceToFace" aria-hidden="true" class="rotate-180 text-xl"><b>{{ white }}</b> plays white · <b>{{ black }}</b> plays black</p>
      <div class="coin grid h-28 w-28 place-items-center rounded-full border-4 border-[#c9c9c9] bg-[#f4f4f4] shadow-[0_8px_24px_rgba(0,0,0,.6)]">
        <ChessPiece color="w" type="k" class="h-20 w-20" />
      </div>
      <p class="text-xl"><b>{{ white }}</b> plays white · <b>{{ black }}</b> plays black</p>
      <button type="button" class="btn px-6" autofocus>Start</button>
    </div>
  </div>
</template>

<style scoped>
/* a few turns like a flicked coin, landing on the white king */
.coin { animation: flip 1.1s cubic-bezier(.2, .7, .3, 1); }
@keyframes flip { from { transform: rotateY(1800deg) scale(.6); } }
@media (prefers-reduced-motion: reduce) { .coin { animation: none; } }
</style>
