<script setup lang="ts">
// PROTOTYPE — Style E "Bento": everything in rounded tiles of different sizes, iOS-widget feel
import '@fontsource-variable/outfit'
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
import { emojiFor, formatAverage, formatDayMonth, formatPercent } from '@/utils/format'
import ScreenColumn from './ScreenColumn.vue'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip)

const TILE = ['#ffd6d1', '#ffe8c2', '#ececf1', '#d6f5dd', '#c9f0ff']
// Layout of the mood tiles: [score, columns spanned]
const LAYOUT: [number, number][] = [
  [5, 3],
  [4, 3],
  [3, 6],
  [2, 3],
  [1, 3],
]
const props = defineProps<{ stats: TeamStats }>()
const score = ref<number | null>(4)
const tags = ref<MoodTag[]>(['RECOGNITION'])
const toggle = (tag: MoodTag) =>
  (tags.value = tags.value.includes(tag)
    ? tags.value.filter((t) => t !== tag)
    : [...tags.value, tag].slice(0, 3))
const mood = (s: number) => MOOD_SCORES[s - 1]!

const chartData = computed(() => ({
  labels: props.stats.daily.map((d) => formatDayMonth(d.date)),
  datasets: [
    {
      data: props.stats.daily.map((d) => d.average),
      borderColor: '#0a84ff',
      borderWidth: 3,
      pointRadius: 0,
      cubicInterpolationMode: 'monotone' as const,
      spanGaps: false,
      fill: 'start' as const,
      backgroundColor: 'rgba(10, 132, 255, 0.10)',
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
      ticks: { stepSize: 1, callback: (v: string | number) => MOOD_SCORES[Number(v) - 1]?.emoji },
      grid: { color: '#f2f2f5' },
      border: { display: false },
    },
    x: {
      ticks: { maxTicksLimit: 4, maxRotation: 0, color: '#8e8e93' },
      grid: { display: false },
      border: { display: false },
    },
  },
}
</script>

<template>
  <div class="row">
    <ScreenColumn label="Connexion">
      <div class="e-screen e-grid e-login">
        <div class="e-tile e-span6 e-brand">
          <span>Moodly</span><small>Votre humeur, en 10 secondes</small>
        </div>
        <div class="e-tile e-span6 e-form">
          <input class="e-input" value="alice@moodly.dev" />
          <input class="e-input" type="password" value="Moodly2026!" />
          <button class="e-btn">Se connecter</button>
        </div>
        <div class="e-tile e-span3 e-fact"><b>10 s</b><small>par jour</small></div>
        <div class="e-tile e-span3 e-fact e-mint"><b>100 %</b><small>anonyme</small></div>
      </div>
    </ScreenColumn>

    <ScreenColumn label="Saisie de l'humeur">
      <div class="e-screen e-grid">
        <div class="e-span6 e-head">
          <small>Lundi 20 octobre</small>
          <h1>Comment ça va ?</h1>
        </div>
        <button
          v-for="[s, span] in LAYOUT"
          :key="s"
          class="e-tile e-mood"
          :class="[`e-span${span}`, { on: score === s }]"
          :style="{ background: TILE[s - 1] }"
          @click="score = s"
        >
          <span class="e-emoji">{{ mood(s).emoji }}</span
          ><span>{{ mood(s).label }}</span>
        </button>
        <div class="e-tile e-span6">
          <p class="e-title">Ce qui joue · 3 max</p>
          <div class="e-chips">
            <button
              v-for="tag in MOOD_TAGS"
              :key="tag.value"
              :class="{ on: tags.includes(tag.value) }"
              @click="toggle(tag.value)"
            >
              {{ tag.label }}
            </button>
          </div>
        </div>
        <button class="e-tile e-span6 e-send">Envoyer anonymement →</button>
      </div>
    </ScreenColumn>

    <ScreenColumn label="Dashboard manager">
      <div class="e-screen e-grid">
        <div class="e-span6 e-head">
          <small>30 derniers jours</small>
          <h1>{{ stats.team.name }}</h1>
        </div>
        <div class="e-tile e-span3 e-kpi e-blue">
          <small>Moyenne</small><b>{{ formatAverage(stats.summary.average ?? 0) }}</b
          ><span>{{ emojiFor(stats.summary.average ?? 3) }}</span>
        </div>
        <div class="e-tile e-span3 e-kpi">
          <small>Participation</small><b>{{ formatPercent(stats.summary.participationRate) }}</b
          ><span class="e-ring" :style="{ '--p': stats.summary.participationRate }" />
        </div>
        <div class="e-tile e-span6">
          <p class="e-title">Jour par jour</p>
          <div class="e-chart"><Line :data="chartData" :options="chartOptions" /></div>
          <small class="e-muted">Jours à moins de 3 réponses masqués.</small>
        </div>
        <div class="e-tile e-span6 e-dark">
          <p class="e-title">Préoccupations</p>
          <p v-for="t in stats.summary.topConcerns" :key="t.tag" class="e-row">
            {{ tagLabel(t.tag) }}<b>{{ t.count }}</b>
          </p>
        </div>
        <div class="e-tile e-span6">
          <p class="e-title">Thèmes cités</p>
          <p v-for="t in stats.summary.topTags" :key="t.tag" class="e-row">
            {{ tagLabel(t.tag) }}<b>{{ t.count }}</b>
          </p>
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
.e-screen {
  min-height: 100%;
  padding: 20px 14px 30px;
  background: #eef0f4;
  color: #1c1c1e;
  font-family: 'Outfit Variable', sans-serif;
  font-size: 15px;
}
.e-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 10px;
  align-content: start;
}
.e-span3 {
  grid-column: span 3;
}
.e-span6 {
  grid-column: span 6;
}
.e-tile {
  padding: 16px;
  border: none;
  border-radius: 26px;
  background: #ffffff;
  color: inherit;
  font: inherit;
  text-align: left;
}
.e-head {
  padding: 6px 6px 4px;
}
.e-head small {
  color: #8e8e93;
}
.e-head h1 {
  margin: 2px 0 0;
  font-size: 28px;
  font-weight: 700;
}
.e-login {
  align-content: center;
}
.e-brand {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  height: 180px;
  background: linear-gradient(135deg, #0a84ff, #64d2ff);
  color: #fff;
}
.e-brand span {
  font-size: 40px;
  font-weight: 800;
  letter-spacing: -0.02em;
}
.e-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.e-input {
  height: 48px;
  padding: 0 16px;
  border: none;
  border-radius: 16px;
  background: #f2f2f7;
  font: inherit;
}
.e-btn {
  height: 50px;
  border: none;
  border-radius: 16px;
  background: #1c1c1e;
  color: #fff;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}
.e-fact {
  display: flex;
  flex-direction: column;
  height: 110px;
  justify-content: flex-end;
  background: #fff1c2;
}
.e-mint {
  background: #d6f5dd;
}
.e-fact b {
  font-size: 30px;
}
.e-mood {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 110px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.15s;
}
.e-mood.e-span6 {
  flex-direction: row;
  align-items: center;
  height: 76px;
  gap: 12px;
}
.e-mood.on {
  outline: 3px solid #1c1c1e;
  transform: scale(0.98);
}
.e-emoji {
  font-size: 34px;
}
.e-title {
  margin: 0 0 10px;
  font-weight: 700;
}
.e-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.e-chips button {
  min-height: 40px;
  padding: 0 14px;
  border: none;
  border-radius: 999px;
  background: #f2f2f7;
  font: inherit;
  font-size: 13px;
  cursor: pointer;
}
.e-chips button.on {
  background: #0a84ff;
  color: #fff;
}
.e-send {
  height: 64px;
  background: #1c1c1e;
  color: #fff;
  font-weight: 700;
  font-size: 17px;
  text-align: center;
  cursor: pointer;
}
.e-kpi {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 130px;
  justify-content: space-between;
}
.e-kpi small {
  color: #8e8e93;
}
.e-kpi b {
  font-size: 38px;
  line-height: 1;
}
.e-kpi > span {
  position: absolute;
  top: 14px;
  right: 14px;
  font-size: 26px;
}
.e-blue {
  background: #c9f0ff;
}
.e-ring {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: conic-gradient(#30d158 calc(var(--p) * 100%), #e5e5ea 0);
}
.e-chart {
  height: 170px;
}
.e-muted {
  color: #8e8e93;
}
.e-dark {
  background: #1c1c1e;
  color: #fff;
}
.e-row {
  display: flex;
  justify-content: space-between;
  margin: 0;
  padding: 7px 0;
}
</style>
