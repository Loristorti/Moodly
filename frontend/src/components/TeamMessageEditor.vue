<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ApiError } from '@/api/client'
import { getTeamMessage, publishTeamMessage, removeTeamMessage } from '@/api/teamMessage'
import type { TeamMessage } from '@/types/api'

/** Same limit as the API */
const MAX_LENGTH = 280

const current = ref<TeamMessage | null>(null)
const draft = ref('')
const saving = ref(false)
const error = ref<string | null>(null)
/** Short confirmation after an action, read by screen readers */
const status = ref<string | null>(null)

const length = computed(() => draft.value.trim().length)
const canPublish = computed(
  () =>
    !saving.value &&
    length.value > 0 &&
    length.value <= MAX_LENGTH &&
    draft.value.trim() !== current.value?.content,
)

const date = computed(() =>
  current.value
    ? new Date(current.value.updatedAt).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
      })
    : null,
)

async function run(action: () => Promise<void>, done: string) {
  saving.value = true
  error.value = null
  status.value = null
  try {
    await action()
    status.value = done
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : 'Une erreur est survenue.'
  } finally {
    saving.value = false
  }
}

function publish() {
  void run(async () => {
    current.value = await publishTeamMessage(draft.value)
    draft.value = current.value.content
  }, 'Message publié : votre équipe le voit sur son écran de saisie.')
}

function remove() {
  void run(async () => {
    await removeTeamMessage()
    current.value = null
    draft.value = ''
  }, 'Message retiré.')
}

onMounted(async () => {
  try {
    current.value = await getTeamMessage()
    draft.value = current.value?.content ?? ''
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : 'Une erreur est survenue.'
  }
})
</script>

<template>
  <section class="editor stack" aria-labelledby="editor-title">
    <div>
      <h2 id="editor-title">
        <span class="emoji" aria-hidden="true">📣</span> Votre message à l’équipe
      </h2>
      <p class="muted small">
        Visible par toute l’équipe sur son écran de saisie. Par exemple : ce que vous avez entendu,
        et ce que vous allez faire.
      </p>
    </div>

    <form class="stack" @submit.prevent="publish">
      <label for="team-message" class="sr-only">Message à l’équipe</label>
      <textarea
        id="team-message"
        v-model="draft"
        class="input textarea"
        rows="4"
        :maxlength="MAX_LENGTH"
        placeholder="Merci pour vos retours sur la charge de travail…"
        aria-describedby="team-message-count"
      ></textarea>
      <p id="team-message-count" class="count muted">
        {{ length }} / {{ MAX_LENGTH }}
        <template v-if="current"> · publié le {{ date }}</template>
      </p>

      <p v-if="error" class="alert" role="alert">{{ error }}</p>
      <p class="status" role="status">{{ status }}</p>

      <div class="actions">
        <button type="submit" class="button button-primary" :disabled="!canPublish">
          {{ saving ? 'Envoi…' : current ? 'Mettre à jour' : 'Publier' }}
        </button>
        <button
          v-if="current"
          type="button"
          class="button button-secondary"
          :disabled="saving"
          @click="remove"
        >
          Retirer
        </button>
      </div>
    </form>
  </section>
</template>

<style scoped>
.stack {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.small {
  margin-top: var(--space-3xs);
  font-size: var(--text-sm);
}

h2 {
  font-size: var(--text-lg);
}

.textarea {
  min-height: 96px;
  padding: var(--space-xs) var(--space-sm);
  font: inherit;
  font-weight: 600;
  resize: vertical;
}

.count {
  font-size: var(--text-sm);
  font-variant-numeric: tabular-nums;
}

.status:empty {
  display: none;
}

.status {
  font-weight: 700;
  color: var(--color-success);
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
}

.actions .button-primary {
  width: auto;
  flex: 1;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
</style>
