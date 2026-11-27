<script setup lang="ts">
// Icon above a short label; the icon goes in the default slot.
defineProps<{ label: string }>()
</script>

<template>
  <button type="button" class="flex min-h-11 flex-1 flex-col items-center justify-center rounded-xl border border-line bg-black px-2 py-1 text-xs font-medium text-muted transition-colors hover:text-ink active:bg-line disabled:opacity-40">
    <svg viewBox="0 0 24 24" class="h-4 w-4 text-ink" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><slot /></svg>
    {{ label }}
  </button>
</template>
