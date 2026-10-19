<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ApiError } from '@/api/client'
import { getTodayStatus, submitMood } from '@/api/moods'
import AppHeader from '@/components/AppHeader.vue'
import MoodPicker from '@/components/MoodPicker.vue'
import TagSelector from '@/components/TagSelector.vue'
import { MOOD_SCORES, moodSoftColor } from '@/constants/mood'
import type { MoodTag } from '@/types/api'

type Step = 'loading' | 'form' | 'done' | 'error'

const step = ref<Step>('loading')
const score = ref<number | null>(null)
const tags = ref<MoodTag[]>([])
const sending = ref(false)
const error = ref<string | null>(null)
const alreadyAnswered = ref(false)

const today = new Date().toLocaleDateString('fr-FR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})

const selectedMood = computed(() => MOOD_SCORES.find((mood) => mood.score === score.value))

/** The page takes the soft color of the chosen mood */
const tint = computed(() => (score.value === null ? 'transparent' : moodSoftColor(score.value)))

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
  <div class="mood-screen" :style="{ '--tint': tint }">
    <div class="mood-backdrop" aria-hidden="true"></div>
    <AppHeader />

    <main class="page mood-page">
      <p v-if="step === 'loading'" class="muted center" role="status">Chargement…</p>

      <section v-else-if="step === 'error'" class="card stack reveal">
        <p class="alert" role="alert">{{ error }}</p>
        <button type="button" class="button button-secondary" @click="loadTodayStatus">
          Réessayer
        </button>
      </section>

      <section v-else-if="step === 'done'" class="thanks" aria-live="polite">
        <p class="thanks-hand emoji reveal" aria-hidden="true">👋</p>
        <h1 class="reveal" style="--order: 1">Merci, à demain 👋</h1>
        <p class="muted reveal" style="--order: 2">
          {{
            alreadyAnswered
              ? 'Vous avez déjà renseigné votre humeur aujourd’hui.'
              : 'Votre humeur du jour a bien été enregistrée, de façon anonyme.'
          }}
        </p>
      </section>

      <form v-else class="stack" @submit.prevent="send">
        <header class="mood-title reveal">
          <p class="muted mood-date">{{ today }}</p>
          <h1>Comment allez-vous aujourd’hui&nbsp;?</h1>
        </header>

        <section class="card stack reveal" style="--order: 1">
          <MoodPicker v-model="score" />
          <p class="mood-feedback" aria-live="polite">
            <template v-if="selectedMood">
              <span class="emoji" aria-hidden="true">{{ selectedMood.emoji }}</span>
              {{ selectedMood.label }}
            </template>
            <template v-else>Touchez l’émoji qui vous ressemble.</template>
          </p>
        </section>

        <section class="card stack reveal" style="--order: 2">
          <h2 class="section-title">
            Qu’est-ce qui joue sur votre humeur&nbsp;?
            <span class="section-hint">Facultatif · jusqu’à 3 thèmes</span>
          </h2>
          <TagSelector v-model="tags" />
        </section>

        <p class="notice reveal" style="--order: 3">
          <span class="emoji" aria-hidden="true">🔒</span>
          <span>Vos réponses sont anonymes : votre manager ne voit que des moyennes d’équipe.</span>
        </p>

        <div class="send-bar">
          <p v-if="error" class="alert" role="alert">{{ error }}</p>
          <button type="submit" class="button button-primary" :disabled="score === null || sending">
            {{ sending ? 'Envoi…' : 'Envoyer' }}
          </button>
        </div>
      </form>
    </main>
  </div>
</template>

<style scoped>
.mood-screen {
  min-height: 100vh;
  min-height: 100dvh;
  transition: --tint var(--dur-long) var(--ease-out);
}

/* Soft glow of the chosen mood's color at the top of the screen */
.mood-backdrop {
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background: radial-gradient(120% 60% at 50% 0%, var(--tint), transparent 75%);
}

.mood-page {
  padding-bottom: 16px;
}

.stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.center {
  text-align: center;
}

.mood-title {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 4px 4px 0;
}

.mood-date::first-letter {
  text-transform: uppercase;
}

.mood-title h1 {
  font-size: var(--text-2xl);
}

.mood-feedback {
  min-height: 1.6em;
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: 500;
  font-variation-settings: 'SOFT' 100;
  text-align: center;
  color: var(--color-text-muted);
}

.section-title {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 1.2rem;
}

.section-hint {
  font-family: var(--font-body);
  font-size: 0.85rem;
  font-weight: 400;
  letter-spacing: 0;
  color: var(--color-text-muted);
}

/* Send button stays within thumb reach at the bottom of the screen */
.send-bar {
  position: sticky;
  bottom: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px 0 calc(14px + env(safe-area-inset-bottom));
  background: linear-gradient(to top, var(--color-bg) 70%, transparent);
}

.thanks {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 60vh;
  text-align: center;
}

.thanks h1 {
  font-size: 2rem;
}

.thanks-hand {
  display: grid;
  place-items: center;
  width: 112px;
  height: 112px;
  margin-bottom: 8px;
  border-radius: 50%;
  background: var(--mood-5-soft);
  font-size: 3.5rem;
}

/* One single wave, then still */
.thanks-hand.reveal {
  animation:
    reveal var(--dur-long) var(--ease-out) both,
    wave 1.4s var(--ease-in-out) 0.5s 1;
}

@keyframes wave {
  0%,
  60%,
  100% {
    transform: rotate(0deg);
  }
  15%,
  45% {
    transform: rotate(14deg);
  }
  30% {
    transform: rotate(-8deg);
  }
}
</style>
