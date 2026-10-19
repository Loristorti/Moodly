<script setup lang="ts">
import { MOOD_SCORES, moodColor, moodSoftColor } from '@/constants/mood'

/** Selected score (1 to 5), or null while nothing is chosen. */
const score = defineModel<number | null>({ required: true })
</script>

<template>
  <div
    class="mood-picker"
    :class="{ 'has-selection': score !== null }"
    role="group"
    aria-label="Votre humeur du jour"
  >
    <button
      v-for="mood in MOOD_SCORES"
      :key="mood.score"
      type="button"
      class="mood-option"
      :class="{ selected: score === mood.score }"
      :style="{ '--color': moodColor(mood.score), '--soft': moodSoftColor(mood.score) }"
      :aria-label="mood.label"
      :aria-pressed="score === mood.score"
      @click="score = mood.score"
    >
      <span class="mood-emoji emoji" aria-hidden="true">{{ mood.emoji }}</span>
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
  gap: 6px;
  min-height: 92px;
  padding: 12px 2px 10px;
  background: var(--soft);
  border: 2px solid transparent;
  border-radius: 18px;
  cursor: pointer;
  transition:
    border-color 0.2s,
    opacity 0.2s,
    transform 0.2s;
}

.mood-option:hover {
  border-color: var(--color);
}

/* Once a mood is chosen, the others step back */
.has-selection .mood-option:not(.selected) {
  opacity: 0.55;
}

.mood-option.selected {
  border-color: var(--color);
  background: var(--color-surface);
  box-shadow: 0 10px 24px -14px var(--color);
  transform: translateY(-3px);
}

.mood-emoji {
  font-size: 2.1rem;
  line-height: 1;
  transition: transform 0.35s cubic-bezier(0.3, 1.6, 0.5, 1);
}

.mood-option.selected .mood-emoji {
  transform: scale(1.18);
}

.mood-label {
  font-size: 0.68rem;
  font-weight: 600;
  line-height: 1.15;
  text-align: center;
  color: var(--color-text-muted);
}

.mood-option.selected .mood-label {
  color: var(--color-text);
}
</style>
