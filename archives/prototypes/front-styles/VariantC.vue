<script setup lang="ts">
// PROTOTYPE — Style C "Ludique": bright, chunky, big colored bubbles, friendly tone
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

const BUBBLE = ['#ff6b6b', '#ffa94d', '#ffd43b', '#69db7c', '#38d9a9']
const SHADE = ['#e03131', '#f76707', '#f59f00', '#37b24d', '#0ca678']
const props = defineProps<{ stats: TeamStats; only?: ('login' | 'mood' | 'dashboard')[] }>()
const show = (screen: 'login' | 'mood' | 'dashboard') => !props.only || props.only.includes(screen)
const score = ref<number | null>(5)
const tags = ref<MoodTag[]>(['TEAM_SPIRIT'])
const toggle = (tag: MoodTag) =>
  (tags.value = tags.value.includes(tag)
    ? tags.value.filter((t) => t !== tag)
    : [...tags.value, tag].slice(0, 3))

const chartData = computed(() => ({
  labels: props.stats.daily.map((d) => formatDayMonth(d.date)),
  datasets: [
    {
      data: props.stats.daily.map((d) => d.average),
      borderColor: '#7048e8',
      borderWidth: 5,
      borderCapStyle: 'round' as const,
      pointRadius: 5,
      pointBackgroundColor: '#ffffff',
      pointBorderColor: '#7048e8',
      pointBorderWidth: 3,
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
        font: { size: 16 },
        callback: (v: string | number) => MOOD_SCORES[Number(v) - 1]?.emoji,
      },
      grid: { display: false },
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
    <ScreenColumn v-if="show('login')" label="Connexion">
      <div class="c-screen c-login">
        <div class="c-faces">
          <span
            v-for="m in MOOD_SCORES"
            :key="m.score"
            :style="{ background: BUBBLE[m.score - 1] }"
            >{{ m.emoji }}</span
          >
        </div>
        <h1>Salut ! 👋</h1>
        <p class="c-sub">Prêt à partager ton humeur du jour ?</p>
        <input class="c-input" value="alice@moodly.dev" />
        <input class="c-input" type="password" value="Moodly2026!" />
        <button class="c-btn">C'est parti !</button>
        <p class="c-foot">🤫 Promis, c'est anonyme.</p>
      </div>
    </ScreenColumn>

    <ScreenColumn v-if="show('mood')" label="Saisie de l'humeur">
      <div class="c-screen">
        <p class="c-sub">Lundi 20 octobre</p>
        <h1>Ça va comment aujourd'hui ?</h1>
        <div class="c-bubbles">
          <button
            v-for="m in [...MOOD_SCORES].reverse()"
            :key="m.score"
            class="c-bubble"
            :class="{ on: score === m.score, dim: score !== null && score !== m.score }"
            :style="{ background: BUBBLE[m.score - 1], '--shade': SHADE[m.score - 1] }"
            @click="score = m.score"
          >
            <span>{{ m.emoji }}</span
            ><small>{{ m.label }}</small>
          </button>
        </div>
        <p class="c-q">Qu'est-ce qui joue là-dessus ?</p>
        <div class="c-chips">
          <button
            v-for="tag in MOOD_TAGS"
            :key="tag.value"
            :class="{ on: tags.includes(tag.value) }"
            @click="toggle(tag.value)"
          >
            {{ tag.label }}
          </button>
        </div>
        <button class="c-btn">Envoyer 🚀</button>
      </div>
    </ScreenColumn>

    <ScreenColumn v-if="show('dashboard')" label="Dashboard manager">
      <div class="c-screen">
        <h1>{{ stats.team.name }}</h1>
        <div class="c-stats">
          <div class="c-stat c-yellow">
            <span class="c-big"
              >{{ formatAverage(stats.summary.average ?? 0) }}
              {{ emojiFor(stats.summary.average ?? 3) }}</span
            ><small>humeur moyenne</small>
          </div>
          <div class="c-stat c-green">
            <span class="c-big">{{ formatPercent(stats.summary.participationRate) }}</span
            ><small>ont participé</small>
          </div>
        </div>
        <div class="c-card">
          <p class="c-q">📈 L'humeur jour après jour</p>
          <div class="c-chart"><Line :data="chartData" :options="chartOptions" /></div>
          <p class="c-hint">
            Les jours à moins de 3 réponses sont cachés pour protéger tout le monde.
          </p>
        </div>
        <div class="c-card">
          <p class="c-q">😬 Ce qui coince</p>
          <p v-for="(t, i) in stats.summary.topConcerns" :key="t.tag" class="c-rank">
            <b class="c-medal c-red">{{ i + 1 }}</b
            >{{ tagLabel(t.tag) }}<span>{{ t.count }}×</span>
          </p>
        </div>
        <div class="c-card">
          <p class="c-q">💬 Ce qui revient le plus</p>
          <p v-for="(t, i) in stats.summary.topTags" :key="t.tag" class="c-rank">
            <b class="c-medal">{{ i + 1 }}</b
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
.c-screen {
  min-height: 100%;
  padding: 26px 20px 40px;
  background: #fff9f0;
  color: #212529;
  font-family: 'Nunito Variable', sans-serif;
  font-size: 16px;
  font-weight: 600;
}
.c-screen h1 {
  margin: 4px 0 18px;
  font-size: 28px;
  font-weight: 900;
  line-height: 1.15;
}
.c-sub {
  margin: 0;
  color: #868e96;
}
.c-login {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px;
  text-align: center;
}
.c-login h1 {
  margin: 8px 0 0;
  font-size: 36px;
}
.c-faces {
  display: flex;
  justify-content: center;
  gap: 6px;
}
.c-faces span {
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  font-size: 28px;
  transform: rotate(-6deg);
}
.c-faces span:nth-child(even) {
  transform: rotate(6deg) translateY(6px);
}
.c-input {
  height: 54px;
  padding: 0 18px;
  border: 3px solid #e9ecef;
  border-radius: 16px;
  background: #fff;
  font: inherit;
}
.c-btn {
  width: 100%;
  height: 56px;
  margin-top: 6px;
  border: none;
  border-radius: 16px;
  background: #7048e8;
  box-shadow: 0 5px 0 #5f3dc4;
  color: #fff;
  font: inherit;
  font-size: 18px;
  font-weight: 900;
  cursor: pointer;
}
.c-btn:active {
  transform: translateY(4px);
  box-shadow: 0 1px 0 #5f3dc4;
}
.c-foot {
  margin: 6px 0 0;
  color: #868e96;
}
.c-bubbles {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 10px;
  margin-bottom: 22px;
}
.c-bubble {
  grid-column: span 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  height: 104px;
  border: none;
  border-radius: 28px;
  box-shadow: 0 6px 0 var(--shade);
  color: #212529;
  font: inherit;
  cursor: pointer;
  transition:
    transform 0.15s,
    opacity 0.15s;
}
.c-bubble:nth-child(4) {
  grid-column: 2 / span 2;
}
.c-bubble span {
  font-size: 40px;
}
.c-bubble small {
  font-size: 12px;
  font-weight: 800;
}
.c-bubble.on {
  transform: scale(1.06);
  outline: 4px solid #212529;
}
.c-bubble.dim {
  opacity: 0.45;
}
.c-q {
  margin: 0 0 10px;
  font-size: 17px;
  font-weight: 800;
}
.c-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 22px;
}
.c-chips button {
  min-height: 44px;
  padding: 0 16px;
  border: 3px solid #e9ecef;
  border-radius: 14px;
  background: #fff;
  font: inherit;
  font-size: 14px;
  cursor: pointer;
}
.c-chips button.on {
  border-color: #7048e8;
  background: #f3f0ff;
  color: #5f3dc4;
}
.c-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 14px;
}
.c-stat {
  display: flex;
  flex-direction: column;
  padding: 16px;
  border-radius: 22px;
}
.c-yellow {
  background: #ffec99;
}
.c-green {
  background: #b2f2bb;
}
.c-big {
  font-size: 30px;
  font-weight: 900;
}
.c-stat small {
  font-weight: 800;
  color: #495057;
}
.c-card {
  margin-bottom: 14px;
  padding: 16px;
  border: 3px solid #f1f3f5;
  border-radius: 22px;
  background: #fff;
}
.c-chart {
  height: 180px;
}
.c-hint {
  margin: 8px 0 0;
  color: #868e96;
  font-size: 13px;
}
.c-rank {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  padding: 7px 0;
}
.c-rank span {
  margin-left: auto;
  color: #868e96;
}
.c-medal {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: 10px;
  background: #d0bfff;
  color: #5f3dc4;
  font-weight: 900;
}
.c-red {
  background: #ffc9c9;
  color: #c92a2a;
}
</style>
