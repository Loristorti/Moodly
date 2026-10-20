<script setup lang="ts">
// PROTOTYPE — Style A "Clair & pro": white, cobalt accent, list-based mood picking, KPI strip
import '@fontsource-variable/plus-jakarta-sans'
import { computed, ref } from 'vue'
import {
  CategoryScale,
  Chart as ChartJS,
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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip)

const props = defineProps<{ stats: TeamStats }>()
const score = ref<number | null>(3)
const tags = ref<MoodTag[]>(['WORKLOAD'])
const toggle = (tag: MoodTag) =>
  (tags.value = tags.value.includes(tag)
    ? tags.value.filter((t) => t !== tag)
    : [...tags.value, tag].slice(0, 3))

const hiddenDays = computed(() => props.stats.daily.filter((d) => d.hidden).length)
const chartData = computed(() => ({
  labels: props.stats.daily.map((d) => formatDayMonth(d.date)),
  datasets: [
    {
      data: props.stats.daily.map((d) => d.average),
      borderColor: '#1d4ed8',
      borderWidth: 2,
      pointRadius: 0,
      pointHoverRadius: 5,
      cubicInterpolationMode: 'monotone' as const,
      spanGaps: false,
    },
  ],
}))
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    y: {
      min: 1,
      max: 5,
      ticks: { stepSize: 1, color: '#6b7280' },
      grid: { color: '#f1f2f4' },
      border: { display: false },
    },
    x: {
      ticks: { maxTicksLimit: 5, maxRotation: 0, color: '#6b7280' },
      grid: { display: false },
      border: { display: false },
    },
  },
}
</script>

<template>
  <div class="row">
    <ScreenColumn label="Connexion">
      <div class="a-screen a-login">
        <div class="a-logo">M</div>
        <h1>Bon retour</h1>
        <p class="a-muted">Connectez-vous avec votre compte professionnel.</p>
        <label class="a-field">Email<input class="a-input" value="alice@moodly.dev" /></label>
        <label class="a-field"
          >Mot de passe<input class="a-input" type="password" value="Moodly2026!"
        /></label>
        <button class="a-btn">Se connecter</button>
        <p class="a-foot">🔒 Réponses anonymes : votre manager ne voit que des moyennes.</p>
      </div>
    </ScreenColumn>

    <ScreenColumn label="Saisie de l'humeur">
      <div class="a-screen">
        <p class="a-muted a-small">Lundi 20 octobre</p>
        <h1>Comment allez-vous ?</h1>
        <ul class="a-list">
          <li
            v-for="mood in [...MOOD_SCORES].reverse()"
            :key="mood.score"
            :class="{ on: score === mood.score }"
            @click="score = mood.score"
          >
            <span class="a-emoji">{{ mood.emoji }}</span>
            <span class="a-label">{{ mood.label }}</span>
            <span class="a-radio" />
          </li>
        </ul>
        <p class="a-section">Ce qui joue <span class="a-muted">· facultatif, 3 max</span></p>
        <div class="a-checks">
          <label
            v-for="tag in MOOD_TAGS"
            :key="tag.value"
            :class="{ on: tags.includes(tag.value) }"
            @click.prevent="toggle(tag.value)"
          >
            <span class="a-box">✓</span>{{ tag.label }}
          </label>
        </div>
        <button class="a-btn a-sticky">Envoyer</button>
      </div>
    </ScreenColumn>

    <ScreenColumn label="Dashboard manager">
      <div class="a-screen">
        <div class="a-top">
          <div>
            <p class="a-muted a-small">Tableau de bord</p>
            <h1>{{ stats.team.name }}</h1>
          </div>
          <span class="a-seg">30 j</span>
        </div>
        <div class="a-kpis">
          <div>
            <p class="a-muted a-small">Moyenne</p>
            <p class="a-kpi">{{ formatAverage(stats.summary.average ?? 0) }}<small>/5</small></p>
          </div>
          <div>
            <p class="a-muted a-small">Participation</p>
            <p class="a-kpi">{{ formatPercent(stats.summary.participationRate) }}</p>
          </div>
          <div>
            <p class="a-muted a-small">Jours masqués</p>
            <p class="a-kpi">{{ hiddenDays }}</p>
          </div>
        </div>
        <div class="a-card">
          <p class="a-section">Humeur moyenne par jour</p>
          <div class="a-chart"><Line :data="chartData" :options="chartOptions" /></div>
          <p class="a-muted a-small">Les jours avec moins de 3 réponses sont masqués.</p>
        </div>
        <div class="a-card">
          <p class="a-section">Principales préoccupations</p>
          <table class="a-table">
            <tr v-for="(t, i) in stats.summary.topConcerns" :key="t.tag">
              <td>{{ i + 1 }}</td>
              <td>{{ tagLabel(t.tag) }}</td>
              <td>{{ t.count }}</td>
            </tr>
          </table>
        </div>
        <div class="a-card">
          <p class="a-section">Thèmes les plus cités</p>
          <table class="a-table">
            <tr v-for="(t, i) in stats.summary.topTags" :key="t.tag">
              <td>{{ i + 1 }}</td>
              <td>{{ tagLabel(t.tag) }}</td>
              <td>{{ t.count }}</td>
            </tr>
          </table>
        </div>
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
.a-screen {
  min-height: 100%;
  padding: 28px 22px 90px;
  background: #ffffff;
  color: #111827;
  font-family: 'Plus Jakarta Sans Variable', sans-serif;
  font-size: 15px;
}
.a-screen h1 {
  margin: 4px 0 18px;
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.02em;
}
.a-muted {
  color: #6b7280;
}
.a-small {
  margin: 0;
  font-size: 13px;
}
.a-login {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 14px;
}
.a-login h1 {
  margin: 8px 0 0;
}
.a-logo {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: #1d4ed8;
  color: #fff;
  font-weight: 800;
  font-size: 20px;
}
.a-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
}
.a-input {
  height: 46px;
  padding: 0 14px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  font: inherit;
  font-weight: 400;
}
.a-btn {
  height: 50px;
  width: 100%;
  border: none;
  border-radius: 10px;
  background: #1d4ed8;
  color: #fff;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}
.a-foot {
  margin-top: 10px;
  font-size: 13px;
  color: #6b7280;
  text-align: center;
}
.a-list {
  margin: 0 0 22px;
  padding: 0;
  list-style: none;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
}
.a-list li {
  display: flex;
  align-items: center;
  gap: 14px;
  height: 56px;
  padding: 0 16px;
  border-top: 1px solid #f1f2f4;
  cursor: pointer;
}
.a-list li:first-child {
  border-top: none;
}
.a-list li.on {
  background: #eff4ff;
}
.a-emoji {
  font-size: 24px;
}
.a-label {
  flex: 1;
  font-weight: 600;
}
.a-radio {
  width: 20px;
  height: 20px;
  border: 2px solid #d1d5db;
  border-radius: 50%;
}
.on .a-radio {
  border: 6px solid #1d4ed8;
}
.a-section {
  margin: 0 0 10px;
  font-weight: 700;
}
.a-checks {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.a-checks label {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  padding: 0 10px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  font-size: 13px;
  cursor: pointer;
}
.a-box {
  display: grid;
  place-items: center;
  width: 18px;
  height: 18px;
  border: 1.5px solid #d1d5db;
  border-radius: 5px;
  color: transparent;
  font-size: 12px;
}
.a-checks label.on {
  border-color: #1d4ed8;
  background: #eff4ff;
}
.a-checks label.on .a-box {
  background: #1d4ed8;
  border-color: #1d4ed8;
  color: #fff;
}
.a-sticky {
  position: sticky;
  bottom: 0;
  margin-top: 22px;
}
.a-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.a-seg {
  padding: 6px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
}
.a-kpis {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  margin-bottom: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
}
.a-kpis > div {
  padding: 12px 14px;
  border-left: 1px solid #e5e7eb;
}
.a-kpis > div:first-child {
  border-left: none;
}
.a-kpi {
  margin: 4px 0 0;
  font-size: 22px;
  font-weight: 700;
}
.a-kpi small {
  font-size: 13px;
  color: #6b7280;
}
.a-card {
  margin-bottom: 14px;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
}
.a-chart {
  height: 180px;
  margin-bottom: 8px;
}
.a-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}
.a-table td {
  padding: 9px 0;
  border-top: 1px solid #f1f2f4;
}
.a-table td:first-child {
  width: 24px;
  color: #6b7280;
}
.a-table td:last-child {
  text-align: right;
  color: #6b7280;
}
</style>
