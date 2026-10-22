<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ApiError } from '@/api/client'
import { getTodayStatus, submitMood } from '@/api/moods'
import { getTeamMessage } from '@/api/teamMessage'
import { getTeamWeather } from '@/api/weather'
import AppHeader from '@/components/AppHeader.vue'
import MoodPicker from '@/components/MoodPicker.vue'
import TagSelector from '@/components/TagSelector.vue'
import TeamMessageCard from '@/components/TeamMessageCard.vue'
import TeamWeather from '@/components/TeamWeather.vue'
import { LOW_MOOD_MAX_SCORE, SUPPORT_RESOURCES } from '@/constants/support'
import type { MoodTag, TeamMessage, TeamWeather as Weather } from '@/types/api'

type Step = 'loading' | 'form' | 'done' | 'error'

const step = ref<Step>('loading')
const score = ref<number | null>(null)
const tags = ref<MoodTag[]>([])
const sending = ref(false)
const error = ref<string | null>(null)
const alreadyAnswered = ref(false)
/** Score just sent, only kept on screen to show help after a low mood (never stored) */
const sentScore = ref<number | null>(null)
/** Message of the manager to the team, if there is one */
const teamMessage = ref<TeamMessage | null>(null)
/** Weather of the team, shown after the answer */
const weather = ref<Weather | null>(null)

const today = new Date().toLocaleDateString('fr-FR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})

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
    sentScore.value = score.value
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

/** Optional: if it fails, the employee can still answer */
async function loadTeamMessage() {
  try {
    teamMessage.value = await getTeamMessage()
  } catch {
    teamMessage.value = null
  }
}

/** Optional too: the thank-you screen works without it */
async function loadWeather() {
  try {
    weather.value = await getTeamWeather()
  } catch {
    weather.value = null
  }
}

onMounted(() => {
  void loadTodayStatus()
  void loadTeamMessage()
  void loadWeather()
})
</script>

<template>
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
      <div class="thanks-tile reveal">
        <p class="thanks-hand emoji" aria-hidden="true">👋</p>
        <h1>Merci, à demain 👋</h1>
        <p>
          {{
            alreadyAnswered
              ? 'Vous avez déjà renseigné votre humeur aujourd’hui.'
              : 'Votre humeur du jour a bien été enregistrée, de façon anonyme.'
          }}
        </p>
      </div>

      <section
        v-if="sentScore !== null && sentScore <= LOW_MOOD_MAX_SCORE"
        class="support reveal"
        style="--order: 1"
        aria-labelledby="support-title"
      >
        <h2 id="support-title">Merci de l’avoir dit.</h2>
        <p class="support-lead">Si ça ne va pas, vous n’avez pas à le garder pour vous :</p>
        <ul class="support-list">
          <li v-for="resource in SUPPORT_RESOURCES" :key="resource.title">
            <span class="support-emoji emoji" aria-hidden="true">{{ resource.emoji }}</span>
            <span>
              <strong>{{ resource.title }}</strong>
              <span class="support-text">{{ resource.text }}</span>
            </span>
          </li>
        </ul>
      </section>

      <TeamWeather v-if="weather" :weather="weather" class="reveal" style="--order: 2" />

      <TeamMessageCard
        v-if="teamMessage"
        :message="teamMessage"
        class="reveal"
        style="--order: 2"
      />

      <p class="notice reveal" style="--order: 3">
        <span class="emoji" aria-hidden="true">🔒</span>
        <span>Votre manager ne verra qu’une moyenne de l’équipe, jamais votre réponse.</span>
      </p>
    </section>

    <form v-else class="stack" @submit.prevent="send">
      <header class="mood-title reveal">
        <p class="muted mood-date">{{ today }}</p>
        <h1>Comment allez-vous aujourd’hui&nbsp;?</h1>
      </header>

      <div class="reveal" style="--order: 1">
        <MoodPicker v-model="score" />
      </div>

      <section class="card reveal" style="--order: 2">
        <h2 class="section-title">
          Qu’est-ce qui joue sur votre humeur&nbsp;?
          <span class="section-hint">Facultatif · jusqu’à 3 thèmes</span>
        </h2>
        <TagSelector v-model="tags" />
      </section>

      <p class="notice reveal" style="--order: 3">
        <span class="emoji" aria-hidden="true">🔒</span>
        <span>
          Vos réponses sont anonymes : votre manager ne voit que des moyennes d’équipe.
          <RouterLink to="/donnees" class="mood-more">En savoir plus</RouterLink>
        </span>
      </p>

      <TeamMessageCard
        v-if="teamMessage"
        :message="teamMessage"
        class="reveal"
        style="--order: 4"
      />

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
.stack {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.center {
  text-align: center;
}

.mood-title {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: var(--space-3xs) 6px 0;
}

.mood-date {
  font-size: var(--text-sm);
}

.mood-date::first-letter {
  text-transform: uppercase;
}

.mood-title h1 {
  font-size: var(--text-2xl);
}

.section-title {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: var(--space-xs);
  font-size: var(--text-lg);
}

.section-hint {
  font-size: var(--text-sm);
  font-weight: 700;
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
  gap: var(--space-sm);
  padding-top: var(--space-md);
}

.thanks-tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2xs);
  padding: var(--space-xl) var(--space-md);
  border-radius: var(--radius);
  background: var(--tile-mint);
  text-align: center;
}

.thanks-tile h1 {
  font-size: var(--text-2xl);
}

.thanks-hand {
  display: grid;
  place-items: center;
  width: 104px;
  height: 104px;
  margin-bottom: var(--space-2xs);
  border-radius: 50%;
  background: var(--color-surface);
  font-size: 3.25rem;
  animation: wave 1.4s var(--ease-in-out) 0.5s 1;
}

.mood-more {
  color: var(--color-primary-edge);
  font-weight: 800;
}

/* Help after a low mood: calm lilac tile */
.support {
  padding: 20px 18px;
  border-radius: var(--radius);
  background: var(--tile-lilac);
}

.support h2 {
  font-size: var(--text-lg);
}

.support-lead {
  margin: var(--space-3xs) 0 var(--space-xs);
  color: var(--color-text-soft);
}

.support-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2xs);
  margin: 0;
  padding: 0;
  list-style: none;
}

.support-list li {
  display: flex;
  align-items: flex-start;
  gap: var(--space-xs);
  padding: var(--space-xs);
  border-radius: var(--radius-small);
  background: var(--color-surface);
}

.support-emoji {
  font-size: 1.5rem;
  line-height: 1.2;
}

.support-text {
  display: block;
  font-size: var(--text-sm);
  color: var(--color-text-soft);
}

/* One single wave, then still */
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
