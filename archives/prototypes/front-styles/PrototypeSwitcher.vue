<script setup lang="ts">
// PROTOTYPE: floating bar to flip between style variants (dev only)
import { onBeforeUnmount, onMounted } from 'vue'

const props = defineProps<{ variants: { key: string; name: string }[]; current: string }>()
const emit = defineEmits<{ change: [key: string] }>()

function step(direction: number) {
  const index = props.variants.findIndex((v) => v.key === props.current)
  const next = props.variants[(index + direction + props.variants.length) % props.variants.length]
  if (next) emit('change', next.key)
}

function onKey(event: KeyboardEvent) {
  const target = event.target as HTMLElement | null
  if (target?.closest('input, textarea, [contenteditable]')) return
  if (event.key === 'ArrowLeft') step(-1)
  if (event.key === 'ArrowRight') step(1)
}

onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <nav class="switcher" aria-label="Changer de style">
    <button type="button" aria-label="Style précédent" @click="step(-1)">←</button>
    <span class="switcher-label">
      <strong>{{ current }}</strong>
      {{ variants.find((v) => v.key === current)?.name }}
    </span>
    <button type="button" aria-label="Style suivant" @click="step(1)">→</button>
  </nav>
</template>

<style scoped>
.switcher {
  position: fixed;
  left: 50%;
  bottom: 18px;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px;
  transform: translateX(-50%);
  background: #111111;
  color: #ffffff;
  border-radius: 999px;
  box-shadow: 0 10px 30px rgb(0 0 0 / 35%);
  font:
    600 14px/1 system-ui,
    sans-serif;
}

.switcher button {
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 50%;
  background: #2a2a2a;
  color: #ffffff;
  font-size: 18px;
  cursor: pointer;
}

.switcher button:hover {
  background: #444444;
}

.switcher-label {
  min-width: 220px;
  padding: 0 10px;
  text-align: center;
  white-space: nowrap;
}

.switcher-label strong {
  margin-right: 6px;
  color: #ffd166;
}
</style>
