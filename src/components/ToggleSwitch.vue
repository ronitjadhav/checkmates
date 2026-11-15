<script setup lang="ts">
const model = defineModel<boolean>({ required: true })
</script>

<template>
  <label class="flex cursor-pointer items-center justify-between gap-3 rounded-[10px] bg-panel px-3.5 py-3">
    <slot />
    <input v-model="model" type="checkbox" class="switch">
  </label>
</template>

<style scoped>
.switch { appearance: none; flex: none; position: relative; width: 46px; height: 28px; border-radius: 14px; background: var(--color-line); cursor: pointer; transition: background .2s; }
.switch::after { content: ''; position: absolute; top: 3px; left: 3px; width: 22px; height: 22px; border-radius: 50%; background: #fff; transition: transform .2s; }
.switch:checked { background: var(--color-accent); }
.switch:checked::after { transform: translateX(18px); }
</style>
