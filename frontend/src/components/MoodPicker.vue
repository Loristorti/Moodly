<script setup lang="ts">
import { MOOD_SCORES } from '@/constants/mood'

/** Selected score (1 to 5), or null while nothing is chosen. */
const score = defineModel<number | null>({ required: true })
</script>

<template>
  <div class="mood-picker" role="group" aria-label="Votre humeur du jour">
    <button
      v-for="mood in MOOD_SCORES"
      :key="mood.score"
      type="button"
      class="mood-option"
      :class="{ selected: score === mood.score }"
      :aria-label="mood.label"
      :aria-pressed="score === mood.score"
      @click="score = mood.score"
    >
      <span class="mood-emoji" aria-hidden="true">{{ mood.emoji }}</span>
      <span class="mood-label" aria-hidden="true">{{ mood.label }}</span>
    </button>
  </div>
</template>

<style scoped>
.mood-picker {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 6px;
}

.mood-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-height: 84px;
  padding: 10px 2px;
  background: var(--color-surface);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-small);
  cursor: pointer;
  transition:
    border-color 0.15s,
    background-color 0.15s,
    transform 0.15s;
}

.mood-option:hover {
  border-color: var(--color-primary);
}

.mood-option.selected {
  background: var(--color-primary-soft);
  border-color: var(--color-primary);
  transform: translateY(-2px);
}

.mood-emoji {
  font-size: 2rem;
  line-height: 1;
}

.mood-label {
  font-size: 0.7rem;
  line-height: 1.2;
  text-align: center;
  color: var(--color-text-muted);
}

.mood-option.selected .mood-label {
  color: var(--color-text);
  font-weight: 600;
}
</style>
