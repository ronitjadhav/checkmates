<script setup lang="ts">
import { computed, onMounted } from 'vue'
import sprite from './assets/pieces.svg?raw'
import GameScreen from './components/GameScreen.vue'
import SetupScreen from './components/SetupScreen.vue'
import { useGame } from './composables/useGame'

const game = useGame()
const playing = computed(() => game.settings !== null)
onMounted(() => game.resume())
</script>

<template>
  <div v-html="sprite" />
  <GameScreen v-if="playing" :game="game" @quit="game.quit()" />
  <SetupScreen v-else :initial="game.lastSettings()" @start="game.start($event)" />
</template>
