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
        {{ tag.label }}
      </button>
    </div>
    <p class="tag-limit" aria-live="polite">{{ limitMessage }}</p>
  </div>
</template>

<style scoped>
.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  min-height: var(--tap-size);
  padding: 0 16px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 999px;
  cursor: pointer;
  transition:
    border-color 0.15s,
    background-color 0.15s;
}

.tag:hover {
  border-color: var(--color-primary);
}

.tag.selected {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: #ffffff;
  font-weight: 600;
}

.tag-limit {
  min-height: 1.5em;
  margin-top: 8px;
  font-size: 0.875rem;
  color: var(--color-danger);
}
</style>
