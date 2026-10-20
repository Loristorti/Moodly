<script setup lang="ts">
// PROTOTYPE — Style F "Bento ludique": E's tile layout everywhere, with C's colors, rounded font and chunky buttons
import '@fontsource-variable/nunito'
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
import { emojiFor, formatAverage, formatDayMonth, formatPercent } from '@/utils/format'
import ScreenColumn from './ScreenColumn.vue'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip)

const FILL = ['#ffc9c9', '#ffd8a8', '#fff3bf', '#d3f9d8', '#c3fae8']
const EDGE = ['#ff8787', '#ffa94d', '#fcc419', '#69db7c', '#38d9a9']
// Mood tiles: [score, columns spanned] — the best moods on top, "Neutre" as a wide tile
const LAYOUT: [number, number][] = [
  [5, 3],
  [4, 3],
  [3, 6],
  [2, 3],
  [1, 3],
]
const props = defineProps<{ stats: TeamStats }>()
const score = ref<number | null>(4)
const tags = ref<MoodTag[]>(['TEAM_SPIRIT'])
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
      borderColor: '#7048e8',
      borderWidth: 4,
      borderCapStyle: 'round' as const,
      pointRadius: 4,
      pointBackgroundColor: '#ffffff',
      pointBorderColor: '#7048e8',
      pointBorderWidth: 2.5,
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
      ticks: {
        stepSize: 1,
        font: { size: 15 },
        callback: (v: string | number) => MOOD_SCORES[Number(v) - 1]?.emoji,
      },
      grid: { color: '#f1f3f5' },
      border: { display: false },
    },
    x: {
      ticks: {
        maxTicksLimit: 4,
        maxRotation: 0,
        color: '#868e96',
        font: { weight: 'bold' as const },
      },
      grid: { display: false },
      border: { display: false },
    },
  },
}
</script>

<template>
  <div class="row">
    <ScreenColumn label="Connexion">
      <div class="f-screen f-grid f-login">
        <div class="f-tile f-span6 f-brand">
          <div class="f-faces">
            <span v-for="m in MOOD_SCORES" :key="m.score">{{ m.emoji }}</span>
          </div>
          <b>Moodly</b>
          <small>Ton humeur du jour, en 10 secondes</small>
        </div>
        <div class="f-tile f-span6 f-form">
          <input class="f-input" value="alice@moodly.dev" />
          <input class="f-input" type="password" value="Moodly2026!" />
          <button class="f-btn">C'est parti !</button>
        </div>
        <div class="f-tile f-span3 f-fact f-yellow"><b>10 s</b><small>par jour</small></div>
        <div class="f-tile f-span3 f-fact f-mint"><b>100 %</b><small>anonyme 🤫</small></div>
      </div>
    </ScreenColumn>

    <ScreenColumn label="Saisie de l'humeur">
      <div class="f-screen f-grid">
        <div class="f-span6 f-head">
          <small>Lundi 20 octobre</small>
          <h1>Ça va comment aujourd'hui ?</h1>
        </div>
        <button
          v-for="[s, span] in LAYOUT"
          :key="s"
          class="f-tile f-mood"
          :class="[`f-span${span}`, { on: score === s, dim: score !== null && score !== s }]"
          :style="{ background: FILL[s - 1], '--edge': EDGE[s - 1] }"
          @click="score = s"
        >
          <span class="f-emoji">{{ mood(s).emoji }}</span
          ><span>{{ mood(s).label }}</span>
        </button>
        <div class="f-tile f-span6">
          <p class="f-title">Qu'est-ce qui joue là-dessus ? <small>· 3 max</small></p>
          <div class="f-chips">
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
        <button class="f-span6 f-btn f-send">Envoyer 🚀</button>
      </div>
    </ScreenColumn>

    <ScreenColumn label="Dashboard manager">
      <div class="f-screen f-grid">
        <div class="f-span6 f-head">
          <small>30 derniers jours</small>
          <h1>{{ stats.team.name }}</h1>
        </div>
        <div class="f-tile f-span3 f-kpi f-yellow">
          <small>Humeur moyenne</small>
          <b
            >{{ formatAverage(stats.summary.average ?? 0)
            }}<span>{{ emojiFor(stats.summary.average ?? 3) }}</span></b
          >
        </div>
        <div class="f-tile f-span3 f-kpi f-mint">
          <small>Participation</small>
          <b>{{ formatPercent(stats.summary.participationRate) }}</b>
        </div>
        <div class="f-tile f-span6">
          <p class="f-title">📈 L'humeur jour après jour</p>
          <div class="f-chart"><Line :data="chartData" :options="chartOptions" /></div>
          <small class="f-muted"
            >Les jours à moins de 3 réponses sont cachés pour protéger l'anonymat.</small
          >
        </div>
        <div class="f-tile f-span6">
          <p class="f-title">😬 Ce qui coince</p>
          <p v-for="(t, i) in stats.summary.topConcerns" :key="t.tag" class="f-rank">
            <b class="f-medal f-red">{{ i + 1 }}</b
            >{{ tagLabel(t.tag) }}<span>{{ t.count }}×</span>
          </p>
        </div>
        <div class="f-tile f-span6">
          <p class="f-title">💬 Ce qui revient le plus</p>
          <p v-for="(t, i) in stats.summary.topTags" :key="t.tag" class="f-rank">
            <b class="f-medal">{{ i + 1 }}</b
            >{{ tagLabel(t.tag) }}<span>{{ t.count }}×</span>
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
.f-screen {
  min-height: 100%;
  padding: 20px 14px 30px;
  background: #fff9f0;
  color: #212529;
  font-family: 'Nunito Variable', sans-serif;
  font-size: 15px;
  font-weight: 600;
}
.f-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 10px;
  align-content: start;
}
.f-span3 {
  grid-column: span 3;
}
.f-span6 {
  grid-column: span 6;
}
.f-tile {
  padding: 16px;
  border: 3px solid #f1f3f5;
  border-radius: 24px;
  background: #ffffff;
  color: inherit;
  font: inherit;
  text-align: left;
}
.f-head {
  padding: 6px 6px 2px;
}
.f-head small {
  color: #868e96;
}
.f-head h1 {
  margin: 2px 0 0;
  font-size: 26px;
  font-weight: 900;
  line-height: 1.15;
}
.f-login {
  align-content: center;
}
.f-brand {
  display: flex;
  flex-direction: column;
  gap: 4px;
  height: 190px;
  justify-content: flex-end;
  border: none;
  background: #7048e8;
  color: #fff;
}
.f-brand b {
  font-size: 40px;
  font-weight: 900;
  letter-spacing: -0.02em;
}
.f-brand small {
  font-size: 15px;
  opacity: 0.9;
}
.f-faces {
  display: flex;
  gap: 4px;
  margin-bottom: auto;
  font-size: 26px;
}
.f-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.f-input {
  height: 52px;
  padding: 0 16px;
  border: 3px solid #e9ecef;
  border-radius: 16px;
  background: #fff;
  font: inherit;
}
.f-btn {
  width: 100%;
  height: 56px;
  border: none;
  border-radius: 18px;
  background: #7048e8;
  box-shadow: 0 5px 0 #5f3dc4;
  color: #fff;
  font: inherit;
  font-size: 17px;
  font-weight: 900;
  cursor: pointer;
}
.f-btn:active {
  transform: translateY(4px);
  box-shadow: 0 1px 0 #5f3dc4;
}
.f-send {
  height: 62px;
  margin-top: 4px;
}
.f-fact {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  height: 104px;
  border: none;
}
.f-fact b {
  font-size: 30px;
  font-weight: 900;
}
.f-yellow {
  background: #ffec99;
  border: none;
}
.f-mint {
  background: #b2f2bb;
  border: none;
}
.f-mood {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 108px;
  border: none;
  box-shadow: 0 5px 0 var(--edge);
  font-weight: 800;
  cursor: pointer;
  transition:
    transform 0.15s,
    opacity 0.15s;
}
.f-mood.f-span6 {
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: 12px;
  height: 74px;
}
.f-mood.on {
  outline: 3px solid #212529;
  transform: translateY(-2px);
}
.f-mood.dim {
  opacity: 0.5;
}
.f-emoji {
  font-size: 36px;
}
.f-title {
  margin: 0 0 10px;
  font-weight: 800;
}
.f-title small {
  color: #868e96;
  font-weight: 700;
}
.f-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.f-chips button {
  min-height: 42px;
  padding: 0 14px;
  border: 3px solid #e9ecef;
  border-radius: 14px;
  background: #fff;
  font: inherit;
  font-size: 13px;
  cursor: pointer;
}
.f-chips button.on {
  border-color: #7048e8;
  background: #f3f0ff;
  color: #5f3dc4;
}
.f-kpi {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 124px;
}
.f-kpi small {
  color: #495057;
  font-weight: 800;
}
.f-kpi b {
  display: flex;
  align-items: baseline;
  gap: 6px;
  font-size: 36px;
  font-weight: 900;
  line-height: 1;
}
.f-kpi b span {
  font-size: 26px;
}
.f-chart {
  height: 170px;
}
.f-muted {
  color: #868e96;
}
.f-rank {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  padding: 6px 0;
}
.f-rank span {
  margin-left: auto;
  color: #868e96;
}
.f-medal {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: 10px;
  background: #d0bfff;
  color: #5f3dc4;
  font-weight: 900;
}
.f-red {
  background: #ffc9c9;
  color: #c92a2a;
}
</style>
