<script setup lang="ts">
import { inject, type Ref } from 'vue'
import type { Color, PieceSymbol } from '../types'

defineProps<{ color: Color; type: PieceSymbol }>()
// the game screen provides this in face-to-face mode; everywhere else the classic set is used
const symmetric = inject<Ref<boolean>>('symmetricPieces')
</script>

<template>
  <svg class="piece" aria-hidden="true"><use :href="`#${symmetric ? 's' : ''}${color}${type.toUpperCase()}`" /></svg>
</template>
