<script setup lang="ts">
import { ref } from 'vue'
import { MAX_TAGS, MOOD_TAGS } from '@/constants/mood'
import type { MoodTag } from '@/types/api'

/** Selected tags, at most MAX_TAGS. */
const tags = defineModel<MoodTag[]>({ required: true })

const limitMessage = ref<string | null>(null)

function toggle(tag: MoodTag) {
  if (tags.value.includes(tag)) {
    tags.value = tags.value.filter((selected) => selected !== tag)
    limitMessage.value = null
    return
  }
  if (tags.value.length >= MAX_TAGS) {
    limitMessage.value = `${MAX_TAGS} thèmes maximum : retirez-en un pour en choisir un autre.`
    return
  }
  tags.value = [...tags.value, tag]
}
</script>

<template>
  <div>
    <div class="tag-list" role="group" aria-label="Ce qui influence votre humeur">
      <button
        v-for="tag in MOOD_TAGS"
        :key="tag.value"
        type="button"
        class="tag"
        :class="{ selected: tags.includes(tag.value) }"
        :aria-pressed="tags.includes(tag.value)"
        @click="toggle(tag.value)"
      >
        <span class="tag-check" aria-hidden="true">✓</span>
        {{ tag.label }}
      </button>
    </div>
    <p class="tag-footer">
      <span class="tag-limit" aria-live="polite">{{ limitMessage }}</span>
      <span class="tag-count muted">{{ tags.length }} / {{ MAX_TAGS }}</span>
    </p>
  </div>
</template>

<style scoped>
.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: var(--tap-size);
  padding: 0 16px;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 999px;
  font-size: 0.95rem;
  cursor: pointer;
  transition:
    background-color 0.2s,
    border-color 0.2s,
    color 0.2s;
}

.tag:hover {
  border-color: var(--color-primary);
}

.tag-check {
  display: none;
  font-weight: 700;
}

.tag.selected {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: #ffffff;
  font-weight: 600;
}

.tag.selected .tag-check {
  display: inline;
}

.tag-footer {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  min-height: 1.5em;
  margin-top: 10px;
  font-size: 0.85rem;
}

.tag-limit {
  color: var(--color-danger);
}

.tag-count {
  margin-left: auto;
  font-variant-numeric: tabular-nums;
}
</style>
