<script setup lang="ts">
import { computed } from 'vue'
import type { TeamMessage } from '@/types/api'

const props = defineProps<{ message: TeamMessage }>()

/** "22 octobre" */
const date = computed(() =>
  new Date(props.message.updatedAt).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
  }),
)
</script>

<template>
  <section class="team-message" aria-labelledby="team-message-title">
    <h2 id="team-message-title">
      <span class="emoji" aria-hidden="true">📣</span> Le mot de votre manager
    </h2>
    <!-- Plain text interpolation: the message is never interpreted as HTML -->
    <p class="team-message-content">{{ message.content }}</p>
    <p class="team-message-date">Mis à jour le {{ date }}</p>
  </section>
</template>

<style scoped>
.team-message {
  display: flex;
  flex-direction: column;
  gap: var(--space-2xs);
  padding: var(--space-sm);
  border-radius: var(--radius);
  background: var(--tile-lilac);
}

.team-message h2 {
  font-size: var(--text-md);
}

.team-message-content {
  font-weight: 700;
  white-space: pre-line;
  overflow-wrap: anywhere;
}

.team-message-date {
  font-size: var(--text-sm);
  color: var(--color-text-soft);
}
</style>
