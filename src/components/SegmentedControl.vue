<script setup lang="ts" generic="T extends string">
defineProps<{ options: { value: T; label: string }[]; label: string }>()
const model = defineModel<T>({ required: true })
</script>

<template>
  <div role="radiogroup" :aria-label="label" class="grid auto-cols-fr grid-flow-col gap-1 rounded-[10px] bg-panel p-1">
    <label
      v-for="o in options"
      :key="o.value"
      class="relative cursor-pointer rounded-lg py-2.5 text-center text-ink has-checked:bg-line has-checked:font-semibold has-focus-visible:outline-2 has-focus-visible:outline-accent"
    >
      <input v-model="model" type="radio" :name="label" :value="o.value" class="absolute inset-0 cursor-pointer opacity-0">{{ o.label }}
    </label>
  </div>
</template>
