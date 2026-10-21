<script setup lang="ts">
// PROTOTYPE — Style D "Une question à la fois": huge type, step-by-step check-in, sentence-led dashboard
import '@fontsource/instrument-serif'
import '@fontsource-variable/onest'
import { computed, ref } from 'vue'
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js'
import { Line } from 'vue-chartjs'
import { MOOD_SCORES, MOOD_TAGS, tagLabel } from '@/constants/mood'
import type { MoodTag, TeamStats } from '@/types/api'
import { formatAverage, formatDayMonth, formatPercent } from '@/utils/format'
import ScreenColumn from './ScreenColumn.vue'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip)

const props = defineProps<{ stats: TeamStats }>()
const step = ref<1 | 2>(1)
const score = ref<number | null>(2)
const tags = ref<MoodTag[]>(['WORKLOAD'])
const toggle = (tag: MoodTag) =>
  (tags.value = tags.value.includes(tag)
    ? tags.value.filter((t) => t !== tag)
    : [...tags.value, tag].slice(0, 3))
const chosen = computed(() => MOOD_SCORES.find((m) => m.score === score.value))

const verdict = computed(() => {
  const average = props.stats.summary.average ?? 3
  if (average < 2) return 'plutôt mal'
  if (average < 2.75) return 'moyennement'
  if (average < 3.6) return 'plutôt bien'
  return 'bien'
})
const firstConcern = computed(() => props.stats.summary.topConcerns?.[0])

const chartData = computed(() => ({
  labels: props.stats.daily.map((d) => formatDayMonth(d.date)),
  datasets: [
    {
      data: props.stats.daily.map((d) => d.average),
      borderColor: '#1a1a1a',
      borderWidth: 1.5,
      pointRadius: 0,
      cubicInterpolationMode: 'monotone' as const,
      spanGaps: false,
      fill: 'start' as const,
      backgroundColor: 'rgba(255, 92, 53, 0.14)',
    },
  ],
}))
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    y: { min: 1, max: 5, display: false },
    x: {
      ticks: { maxTicksLimit: 3, maxRotation: 0, color: '#8a8a8a' },
      grid: { display: false },
      border: { color: '#1a1a1a' },
    },
  },
}
</script>

<template>
  <div class="row">
    <ScreenColumn label="Connexion">
      <div class="d-screen d-login">
        <h1 class="d-giant">Moodly.</h1>
        <p class="d-lead">Une question par jour. Trente secondes. Aucun nom.</p>
        <label class="d-line">Email<input value="alice@moodly.dev" /></label>
        <label class="d-line">Mot de passe<input type="password" value="Moodly2026!" /></label>
        <button class="d-arrow" aria-label="Se connecter">Entrer →</button>
      </div>
    </ScreenColumn>

    <ScreenColumn label="Saisie de l'humeur (2 étapes)">
      <div class="d-screen d-flow">
        <div class="d-progress">
          <span :class="{ on: step >= 1 }" /><span :class="{ on: step === 2 }" />
        </div>
        <template v-if="step === 1">
          <p class="d-step">1 / 2</p>
          <h2 class="d-question">Comment allez-vous aujourd'hui ?</h2>
          <div class="d-faces">
            <button
              v-for="m in MOOD_SCORES"
              :key="m.score"
              :class="{ on: score === m.score }"
              :aria-label="m.label"
              @click="score = m.score"
            >
              {{ m.emoji }}
            </button>
          </div>
          <p class="d-chosen">{{ chosen?.label ?? ' ' }}</p>
          <button class="d-next" :disabled="score === null" @click="step = 2">Suivant →</button>
        </template>
        <template v-else>
          <p class="d-step">2 / 2</p>
          <h2 class="d-question">Qu'est-ce qui joue&nbsp;?</h2>
          <div class="d-words">
            <button
              v-for="tag in MOOD_TAGS"
              :key="tag.value"
              :class="{ on: tags.includes(tag.value) }"
              @click="toggle(tag.value)"
            >
              {{ tag.label }}
            </button>
          </div>
          <div class="d-actions">
            <button class="d-back" @click="step = 1">← Retour</button>
            <button class="d-next">Envoyer →</button>
          </div>
        </template>
      </div>
    </ScreenColumn>

    <ScreenColumn label="Dashboard manager">
      <div class="d-screen">
        <p class="d-step">{{ stats.team.name }} · 30 derniers jours</p>
        <h2 class="d-sentence">
          L'équipe va <em class="d-mark">{{ verdict }}</em
          >.
        </h2>
        <p v-if="firstConcern" class="d-lead">
          Quand l'humeur baisse, c'est surtout
          <b>{{ tagLabel(firstConcern.tag).toLowerCase() }}</b> qui revient ({{
            firstConcern.count
          }}
          mentions).
        </p>
        <div class="d-chart"><Line :data="chartData" :options="chartOptions" /></div>
        <dl class="d-figures">
          <div>
            <dt>Moyenne</dt>
            <dd>{{ formatAverage(stats.summary.average ?? 0) }} / 5</dd>
          </div>
          <div>
            <dt>Participation</dt>
            <dd>{{ formatPercent(stats.summary.participationRate) }}</dd>
          </div>
        </dl>
        <p class="d-label">Préoccupations</p>
        <p class="d-list">
          {{ stats.summary.topConcerns?.map((t) => tagLabel(t.tag)).join(' · ') }}
        </p>
        <p class="d-label">Thèmes cités</p>
        <p class="d-list">{{ stats.summary.topTags?.map((t) => tagLabel(t.tag)).join(' · ') }}</p>
        <p class="d-fine">Les jours à moins de 3 réponses sont masqués.</p>
      </div>
    </ScreenColumn>
  </div>
</template>

<style scoped>
.row {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 32px;
}
.d-screen {
  min-height: 100%;
  padding: 30px 26px 40px;
  background: #f4f1ea;
  color: #1a1a1a;
  font-family: 'Onest Variable', sans-serif;
  font-size: 15px;
}
.d-login {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 22px;
  padding-bottom: 60px;
}
.d-giant {
  margin: 0;
  font-family: 'Instrument Serif', serif;
  font-size: 92px;
  font-weight: 400;
  line-height: 0.9;
  letter-spacing: -0.03em;
}
.d-lead {
  margin: 0;
  font-size: 17px;
  line-height: 1.45;
  color: #4a4a4a;
}
.d-line {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 12px;
  color: #8a8a8a;
  text-transform: none;
}
.d-line input {
  height: 44px;
  padding: 0;
  border: none;
  border-bottom: 1.5px solid #1a1a1a;
  background: transparent;
  color: #1a1a1a;
  font: inherit;
  font-size: 18px;
}
.d-arrow,
.d-next {
  align-self: flex-start;
  height: 52px;
  padding: 0 26px;
  border: none;
  border-radius: 999px;
  background: #1a1a1a;
  color: #f4f1ea;
  font: inherit;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
}
.d-next:disabled {
  opacity: 0.3;
}
.d-flow {
  display: flex;
  flex-direction: column;
}
.d-progress {
  display: flex;
  gap: 6px;
  margin-bottom: 40px;
}
.d-progress span {
  flex: 1;
  height: 3px;
  background: #d8d3c8;
}
.d-progress span.on {
  background: #ff5c35;
}
.d-step {
  margin: 0 0 8px;
  color: #8a8a8a;
  font-size: 13px;
}
.d-question {
  margin: 0 0 36px;
  font-family: 'Instrument Serif', serif;
  font-size: 46px;
  font-weight: 400;
  line-height: 1.02;
  letter-spacing: -0.02em;
}
.d-faces {
  display: flex;
  justify-content: space-between;
}
.d-faces button {
  padding: 4px;
  border: none;
  background: none;
  font-size: 44px;
  opacity: 0.35;
  filter: grayscale(1);
  cursor: pointer;
  transition:
    transform 0.2s,
    opacity 0.2s,
    filter 0.2s;
}
.d-faces button.on {
  opacity: 1;
  filter: none;
  transform: scale(1.25);
}
.d-chosen {
  min-height: 28px;
  margin: 22px 0 36px;
  font-family: 'Instrument Serif', serif;
  font-size: 26px;
  text-align: center;
}
.d-words {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  margin-bottom: 36px;
}
.d-words button {
  padding: 6px 0;
  border: none;
  background: none;
  color: #b5afa3;
  font-family: 'Instrument Serif', serif;
  font-size: 30px;
  text-align: left;
  cursor: pointer;
}
.d-words button.on {
  color: #1a1a1a;
  text-decoration: underline;
  text-decoration-color: #ff5c35;
  text-decoration-thickness: 3px;
  text-underline-offset: 6px;
}
.d-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.d-back {
  border: none;
  background: none;
  color: #8a8a8a;
  font: inherit;
  cursor: pointer;
}
.d-sentence {
  margin: 0 0 14px;
  font-family: 'Instrument Serif', serif;
  font-size: 44px;
  font-weight: 400;
  line-height: 1.05;
  letter-spacing: -0.02em;
}
.d-mark {
  font-style: normal;
  background: linear-gradient(transparent 60%, rgba(255, 92, 53, 0.35) 60%);
}
.d-chart {
  height: 170px;
  margin: 26px 0 18px;
}
.d-figures {
  display: grid;
  grid-template-columns: 1fr 1fr;
  margin: 0 0 22px;
  border-top: 1.5px solid #1a1a1a;
}
.d-figures div {
  padding: 12px 0;
}
.d-figures dt {
  color: #8a8a8a;
  font-size: 12px;
}
.d-figures dd {
  margin: 4px 0 0;
  font-family: 'Instrument Serif', serif;
  font-size: 34px;
}
.d-label {
  margin: 0;
  color: #8a8a8a;
  font-size: 12px;
}
.d-list {
  margin: 4px 0 16px;
  font-size: 16px;
  font-weight: 500;
}
.d-fine {
  margin: 0;
  color: #8a8a8a;
  font-size: 12px;
}
</style>
