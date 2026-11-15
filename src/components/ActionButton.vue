<script setup lang="ts">
// Icon above a short label; the icon goes in the default slot.
defineProps<{ label: string }>()
</script>

<template>
  <button type="button" class="flex min-h-14 flex-1 flex-col items-center justify-center gap-1 rounded-xl border border-line bg-panel px-2 py-1.5 text-xs font-medium text-muted transition-colors hover:text-ink active:bg-line disabled:opacity-40">
    <svg viewBox="0 0 24 24" class="h-5 w-5 text-ink" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><slot /></svg>
    {{ label }}
  </button>
</template>
