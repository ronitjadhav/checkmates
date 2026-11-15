<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import sprite from './assets/pieces.svg?raw'
import GameScreen from './components/GameScreen.vue'
import ScoresScreen from './components/ScoresScreen.vue'
import SetupScreen from './components/SetupScreen.vue'
import { useGame } from './composables/useGame'
import { useScores } from './composables/useScores'
import { standings } from './lib/scores'

const game = useGame()
const playing = computed(() => game.settings !== null)
const showScores = ref(false)
const players = computed(() => standings(useScores().games.value).map(s => s.name))
onMounted(() => game.resume())
</script>

<template>
  <div v-html="sprite" />
  <GameScreen v-if="playing" :game="game" @quit="game.quit()" />
  <ScoresScreen v-else-if="showScores" @back="showScores = false" />
  <SetupScreen v-else :initial="game.lastSettings()" :players="players" @start="game.start($event)" @scores="showScores = true" />
</template>
