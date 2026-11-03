<script setup lang="ts">
import type { Color, PieceSymbol } from '../types'

defineProps<{ color: Color; type: PieceSymbol }>()
</script>

<template>
  <svg class="piece" aria-hidden="true"><use :href="`#${color}${type.toUpperCase()}`" /></svg>
</template>
