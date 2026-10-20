<script setup lang="ts">
// PROTOTYPE — Style B "Nuit": dark, glowing pastels, slider-based mood picking, hero number
import '@fontsource-variable/sora'
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

const GLOW = ['#ff8a80', '#ffc46b', '#c9c3ff', '#8ef0c4', '#5ee6ff']
const props = defineProps<{ stats: TeamStats }>()
const score = ref(4)
const tags = ref<MoodTag[]>(['TEAM_SPIRIT', 'RECOGNITION'])
const toggle = (tag: MoodTag) =>
  (tags.value = tags.value.includes(tag)
    ? tags.value.filter((t) => t !== tag)
    : [...tags.value, tag].slice(0, 3))
const mood = computed(() => MOOD_SCORES[score.value - 1]!)
const glow = computed(() => GLOW[score.value - 1]!)

const chartData = computed(() => ({
  labels: props.stats.daily.map((d) => formatDayMonth(d.date)),
  datasets: [
    {
      data: props.stats.daily.map((d) => d.average),
      borderColor: '#8ef0c4',
      borderWidth: 2.5,
      pointRadius: 0,
      cubicInterpolationMode: 'monotone' as const,
      spanGaps: false,
      fill: 'start' as const,
      backgroundColor: 'rgba(142, 240, 196, 0.12)',
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
        color: '#7c84a6',
        callback: (v: string | number) => MOOD_SCORES[Number(v) - 1]?.emoji,
      },
      grid: { color: 'rgba(255,255,255,0.06)' },
      border: { display: false },
    },
    x: {
      ticks: { maxTicksLimit: 5, maxRotation: 0, color: '#7c84a6' },
      grid: { display: false },
      border: { display: false },
    },
  },
}
</script>

<template>
  <div class="row">
    <ScreenColumn label="Connexion">
      <div class="b-screen b-login">
        <div class="b-orb" />
        <p class="b-brand">moodly</p>
        <h1>Comment ça va,<br />vraiment ?</h1>
        <div class="b-glass">
          <input class="b-input" value="alice@moodly.dev" />
          <input class="b-input" type="password" value="Moodly2026!" />
          <button class="b-btn">Se connecter</button>
        </div>
        <p class="b-foot">Anonyme par conception. Toujours.</p>
      </div>
    </ScreenColumn>

    <ScreenColumn label="Saisie de l'humeur">
      <div class="b-screen b-mood" :style="{ '--glow': glow }">
        <p class="b-dim">Lundi 20 octobre</p>
        <h2>Votre humeur du jour</h2>
        <div class="b-big">
          <span class="b-halo" />
          <span class="b-emoji">{{ mood.emoji }}</span>
        </div>
        <p class="b-moodlabel">{{ mood.label }}</p>
        <input
          v-model.number="score"
          class="b-slider"
          type="range"
          min="1"
          max="5"
          step="1"
          aria-label="Humeur"
        />
        <div class="b-ends"><span>😞</span><span>😄</span></div>
        <div class="b-chips">
          <button
            v-for="tag in MOOD_TAGS"
            :key="tag.value"
            :class="{ on: tags.includes(tag.value) }"
            @click="toggle(tag.value)"
          >
            {{ tag.label }}
          </button>
        </div>
        <button class="b-btn b-send">Envoyer</button>
      </div>
    </ScreenColumn>

    <ScreenColumn label="Dashboard manager">
      <div class="b-screen">
        <p class="b-dim">{{ stats.team.name }} · 30 derniers jours</p>
        <div class="b-hero">
          <span class="b-hero-num">{{ formatAverage(stats.summary.average ?? 0) }}</span>
          <span class="b-hero-emoji">{{ emojiFor(stats.summary.average ?? 3) }}</span>
        </div>
        <p class="b-dim">
          humeur moyenne · participation {{ formatPercent(stats.summary.participationRate) }}
        </p>
        <div class="b-panel">
          <div class="b-chart"><Line :data="chartData" :options="chartOptions" /></div>
        </div>
        <p class="b-dim b-note">Les jours à moins de 3 réponses restent dans l'ombre.</p>
        <div class="b-panel">
          <p class="b-title">Ce qui pèse</p>
          <p v-for="t in stats.summary.topConcerns" :key="t.tag" class="b-line">
            <span class="b-dot b-warm" />{{ tagLabel(t.tag)
            }}<span class="b-dim">{{ t.count }}</span>
          </p>
        </div>
        <div class="b-panel">
          <p class="b-title">Ce qui revient</p>
          <p v-for="t in stats.summary.topTags" :key="t.tag" class="b-line">
            <span class="b-dot" />{{ tagLabel(t.tag) }}<span class="b-dim">{{ t.count }}</span>
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
.b-screen {
  position: relative;
  min-height: 100%;
  padding: 28px 22px 40px;
  overflow: hidden;
  background: radial-gradient(120% 60% at 50% 0%, #1b2246, #0a0d1c 70%);
  color: #eef0ff;
  font-family: 'Sora Variable', sans-serif;
  font-size: 15px;
}
.b-dim {
  margin: 0;
  color: #7c84a6;
  font-size: 13px;
}
.b-login {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 18px;
}
.b-orb {
  position: absolute;
  top: -80px;
  right: -60px;
  width: 260px;
  height: 260px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(94, 230, 255, 0.35), transparent 70%);
  filter: blur(10px);
}
.b-brand {
  margin: 0;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #8ef0c4;
}
.b-login h1 {
  margin: 0;
  font-size: 32px;
  line-height: 1.15;
  font-weight: 600;
}
.b-glass {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(12px);
}
.b-input {
  height: 48px;
  padding: 0 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  background: rgba(0, 0, 0, 0.25);
  color: #eef0ff;
  font: inherit;
}
.b-btn {
  height: 52px;
  width: 100%;
  border: none;
  border-radius: 16px;
  background: linear-gradient(135deg, #8ef0c4, #5ee6ff);
  color: #0a0d1c;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}
.b-foot {
  margin: 0;
  color: #7c84a6;
  font-size: 13px;
  text-align: center;
}
.b-mood {
  text-align: center;
}
.b-mood h2 {
  margin: 6px 0 0;
  font-size: 22px;
  font-weight: 600;
}
.b-big {
  position: relative;
  display: grid;
  place-items: center;
  height: 200px;
}
.b-halo {
  position: absolute;
  width: 170px;
  height: 170px;
  border-radius: 50%;
  background: radial-gradient(circle, var(--glow), transparent 68%);
  opacity: 0.55;
  transition: background 0.4s;
}
.b-emoji {
  position: relative;
  font-size: 96px;
}
.b-moodlabel {
  margin: 0 0 18px;
  font-size: 20px;
  font-weight: 600;
  color: var(--glow);
  transition: color 0.4s;
}
.b-slider {
  width: 100%;
  accent-color: var(--glow);
}
.b-ends {
  display: flex;
  justify-content: space-between;
  margin: 4px 2px 22px;
  font-size: 18px;
}
.b-chips {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin-bottom: 24px;
}
.b-chips button {
  min-height: 40px;
  padding: 0 14px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 999px;
  background: transparent;
  color: #c3c8e6;
  font: inherit;
  font-size: 13px;
  cursor: pointer;
}
.b-chips button.on {
  border-color: var(--glow);
  color: #0a0d1c;
  background: var(--glow);
}
.b-hero {
  display: flex;
  align-items: center;
  gap: 14px;
  margin: 14px 0 4px;
}
.b-hero-num {
  font-size: 76px;
  font-weight: 700;
  line-height: 1;
  background: linear-gradient(135deg, #ffffff, #8ef0c4);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.b-hero-emoji {
  font-size: 44px;
  filter: drop-shadow(0 0 16px rgba(201, 195, 255, 0.6));
}
.b-panel {
  margin-top: 16px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.03);
}
.b-chart {
  height: 190px;
}
.b-note {
  margin-top: 10px;
}
.b-title {
  margin: 0 0 8px;
  font-weight: 600;
}
.b-line {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  padding: 8px 0;
}
.b-line .b-dim {
  margin-left: auto;
}
.b-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #8ef0c4;
  box-shadow: 0 0 10px #8ef0c4;
}
.b-warm {
  background: #ff8a80;
  box-shadow: 0 0 10px #ff8a80;
}
</style>
