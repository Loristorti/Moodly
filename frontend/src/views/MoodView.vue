<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ApiError } from '@/api/client'
import { getTodayStatus, submitMood } from '@/api/moods'
import AppHeader from '@/components/AppHeader.vue'
import MoodPicker from '@/components/MoodPicker.vue'
import TagSelector from '@/components/TagSelector.vue'
import type { MoodTag } from '@/types/api'

type Step = 'loading' | 'form' | 'done' | 'error'

const step = ref<Step>('loading')
const score = ref<number | null>(null)
const tags = ref<MoodTag[]>([])
const sending = ref(false)
const error = ref<string | null>(null)
const alreadyAnswered = ref(false)

async function loadTodayStatus() {
  step.value = 'loading'
  error.value = null
  try {
    const { submitted } = await getTodayStatus()
    step.value = submitted ? 'done' : 'form'
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : 'Une erreur est survenue.'
    step.value = 'error'
  }
}

async function send() {
  if (score.value === null) {
    return
  }
  sending.value = true
  error.value = null
  try {
    await submitMood({ score: score.value, tags: tags.value })
    step.value = 'done'
  } catch (e) {
    if (e instanceof ApiError && e.status === 409) {
      alreadyAnswered.value = true
      step.value = 'done'
    } else {
      error.value = e instanceof ApiError ? e.message : 'Une erreur est survenue.'
    }
  } finally {
    sending.value = false
  }
}

onMounted(loadTodayStatus)
</script>

<template>
  <AppHeader />

  <main class="page mood-page">
    <p v-if="step === 'loading'" class="muted center" role="status">Chargement…</p>

    <section v-else-if="step === 'error'" class="card stack">
      <p class="alert" role="alert">{{ error }}</p>
      <button type="button" class="button button-secondary" @click="loadTodayStatus">
        Réessayer
      </button>
    </section>

    <section v-else-if="step === 'done'" class="card thanks" aria-live="polite">
      <p class="thanks-emoji" aria-hidden="true">👋</p>
      <h1>Merci, à demain 👋</h1>
      <p class="muted">
        {{
          alreadyAnswered
            ? 'Vous avez déjà renseigné votre humeur aujourd’hui.'
            : 'Votre humeur du jour a bien été enregistrée, de façon anonyme.'
        }}
      </p>
    </section>

    <form v-else class="stack" @submit.prevent="send">
      <section class="card stack">
        <h1>Comment allez-vous aujourd’hui ?</h1>
        <MoodPicker v-model="score" />
      </section>

      <section class="card stack">
        <h2 class="section-title">
          Qu’est-ce qui influence votre humeur ?
          <span class="muted section-hint">Facultatif, 3 maximum</span>
        </h2>
        <TagSelector v-model="tags" />
      </section>

      <p class="notice">
        🔒 Vos réponses sont anonymes : votre manager ne voit que des moyennes d’équipe.
      </p>

      <div class="send-bar">
        <p v-if="error" class="alert" role="alert">{{ error }}</p>
        <button type="submit" class="button button-primary" :disabled="score === null || sending">
          {{ sending ? 'Envoi…' : 'Envoyer' }}
        </button>
      </div>
    </form>
  </main>
</template>

<style scoped>
.mood-page {
  padding-bottom: 24px;
}

.stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.center {
  text-align: center;
}

h1 {
  font-size: 1.35rem;
}

.section-title {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 1.05rem;
}

.section-hint {
  font-size: 0.85rem;
  font-weight: 400;
}

/* Send button stays within thumb reach at the bottom of the screen */
.send-bar {
  position: sticky;
  bottom: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px 0 calc(12px + env(safe-area-inset-bottom));
  background: linear-gradient(to top, var(--color-bg) 75%, transparent);
}

.thanks {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
  padding: 40px 20px;
}

.thanks-emoji {
  font-size: 3.5rem;
  line-height: 1;
}
</style>
