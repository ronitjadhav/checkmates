<script setup lang="ts">
import { reactive } from 'vue'
import type { ColourChoice, Settings } from '../types'
import ChessPiece from './ChessPiece.vue'
import SegmentedControl from './SegmentedControl.vue'
import ToggleSwitch from './ToggleSwitch.vue'

const props = defineProps<{ initial: Settings | null }>()
const emit = defineEmits<{ start: [settings: Settings] }>()

const COLOURS: { value: ColourChoice; label: string }[] = [
  { value: 'p1white', label: 'White' },
  { value: 'p1black', label: 'Black' },
  { value: 'toss', label: 'Toss' },
]

const form = reactive({
  p1: props.initial?.p1 ?? '',
  p2: props.initial?.p2 ?? '',
  colour: props.initial?.colour ?? 'p1white',
  rotate: props.initial?.rotate ?? false,
  hints: props.initial?.hints ?? true,
})

function submit() {
  const white = form.colour === 'toss' ? (Math.random() < 0.5 ? 'p1' : 'p2') : form.colour === 'p1white' ? 'p1' : 'p2'
  emit('start', { p1: form.p1.trim() || 'Player 1', p2: form.p2.trim() || 'Player 2', colour: form.colour, rotate: form.rotate, hints: form.hints, white })
}
</script>

<template>
  <section class="screen">
    <h1 class="mb-3 flex items-center gap-1.5 text-3xl font-bold tracking-tight">
      <ChessPiece color="w" type="n" class="h-[1.3em] w-[1.3em]" />Checkmates
    </h1>
    <form class="grid w-full max-w-[380px] gap-3" autocomplete="off" @submit.prevent="submit">
      <label class="field">Player 1 <input v-model="form.p1" type="text" maxlength="20" placeholder="Player 1" class="input"></label>
      <label class="field">Player 2 <input v-model="form.p2" type="text" maxlength="20" placeholder="Player 2" class="input"></label>
      <div class="field">Player 1 plays <SegmentedControl v-model="form.colour" :options="COLOURS" label="Player 1 plays" /></div>
      <ToggleSwitch v-model="form.rotate">Rotate board each turn</ToggleSwitch>
      <ToggleSwitch v-model="form.hints">Show legal moves</ToggleSwitch>
      <button type="submit" class="mt-1.5 rounded-[10px] bg-accent px-4 py-3.5 text-lg font-semibold text-[#1b1b1b] shadow-[0_4px_0_var(--color-accent-dark)] active:translate-y-0.5 active:shadow-[0_2px_0_var(--color-accent-dark)]">
        Start game
      </button>
    </form>
  </section>
</template>

<style scoped>
@reference "../style.css";
.field { @apply grid gap-1 text-sm text-muted; }
.input { @apply w-full rounded-[10px] border border-line bg-panel px-3.5 py-3 text-[1.05rem] text-ink focus-visible:border-accent focus-visible:outline-offset-0; }
</style>
