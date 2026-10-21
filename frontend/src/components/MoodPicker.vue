<script setup lang="ts">
import { MOOD_SCORES, moodColor, moodSoftColor } from '@/constants/mood'

/** Selected score (1 to 5), or null while nothing is chosen. */
const score = defineModel<number | null>({ required: true })

/** Bento layout: the best moods on top, "Neutre" as a wide tile in the middle. [score, columns] */
const LAYOUT: [number, number][] = [
  [5, 3],
  [4, 3],
  [3, 6],
  [2, 3],
  [1, 3],
]

const moodOf = (value: number) => MOOD_SCORES[value - 1]!
</script>

<template>
  <div
    class="mood-picker"
    :class="{ 'has-selection': score !== null }"
    role="group"
    aria-label="Votre humeur du jour"
  >
    <button
      v-for="[value, span] in LAYOUT"
      :key="value"
      type="button"
      class="mood-tile"
      :class="{ selected: score === value, wide: span === 6 }"
      :style="{
        gridColumn: `span ${span}`,
        '--fill': moodSoftColor(value),
        '--edge': moodColor(value),
      }"
      :aria-pressed="score === value"
      @click="score = value"
    >
      <span class="mood-emoji emoji" aria-hidden="true">{{ moodOf(value).emoji }}</span>
      <span class="mood-label">{{ moodOf(value).label }}</span>
    </button>
  </div>
</template>

<style scoped>
.mood-picker {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 10px;
}

/* A raised colored tile, sitting on a darker edge */
.mood-tile {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  min-height: 108px;
  padding: 14px 16px;
  border: none;
  border-radius: var(--radius);
  background: var(--fill);
  box-shadow: 0 5px 0 var(--edge);
  color: var(--color-text);
  font-weight: 800;
  text-align: left;
  cursor: pointer;
  transition:
    transform var(--dur-short) var(--ease-out),
    opacity var(--dur-medium) var(--ease-out),
    box-shadow var(--dur-short) var(--ease-out);
}

.mood-tile.wide {
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: var(--space-xs);
  min-height: 76px;
}

.mood-tile:active {
  transform: translateY(4px);
  box-shadow: 0 1px 0 var(--edge);
}

/* Once a mood is chosen, the others step back */
.has-selection .mood-tile:not(.selected) {
  opacity: 0.5;
}

.mood-tile.selected {
  outline: var(--border-width) solid var(--color-text);
  outline-offset: 0;
}

.mood-emoji {
  font-size: 2.25rem;
  line-height: 1;
}

.mood-label {
  font-size: var(--text-md);
}
</style>
