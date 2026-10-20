<script setup lang="ts">
import { computed } from 'vue'
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  type ChartData,
  type ChartOptions,
  type Plugin,
  type ScriptableContext,
} from 'chart.js'
import { Line } from 'vue-chartjs'
import { MOOD_SCORES } from '@/constants/mood'
import type { DailyStat } from '@/types/api'
import { formatAverage, formatDayMonth, formatWeekday } from '@/utils/format'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip)

const props = defineProps<{ daily: DailyStat[]; threshold: number }>()

/** Colors and fonts come from the design tokens (assets/tokens.css) */
const css = getComputedStyle(document.documentElement)
const token = (name: string) => css.getPropertyValue(name).trim()
const primary = token('--color-primary')
const muted = token('--color-text-muted')
const border = token('--color-border')
const surface = token('--color-surface')
const fillTop = token('--color-chart-fill')
const fillEnd = token('--color-chart-fill-end')
const moodColors = [1, 2, 3, 4, 5].map((score) => token(`--mood-${score}`))
const bodyFont = token('--font-body')

/** Each point takes the color of its mood level (3.6 -> color of 4); the y position carries the value */
function pointColor(context: ScriptableContext<'line'>): string {
  const value = context.raw as number | null
  return value === null ? 'transparent' : (moodColors[Math.round(value) - 1] ?? primary)
}

/** Solid hairline at 3 (neutral mood), labelled at its right end, drawn behind the curve */
const neutralLine: Plugin<'line'> = {
  id: 'neutralLine',
  beforeDatasetsDraw(chart) {
    const { ctx, chartArea, scales } = chart
    const y = scales.y?.getPixelForValue(3)
    if (y === undefined) return
    ctx.save()
    ctx.strokeStyle = muted
    ctx.globalAlpha = 0.45
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(chartArea.left, y)
    ctx.lineTo(chartArea.right, y)
    ctx.stroke()
    ctx.globalAlpha = 1
    ctx.fillStyle = muted
    ctx.font = `12px ${bodyFont}`
    ctx.textAlign = 'right'
    ctx.fillText('neutre', chartArea.right, y - 6)
    ctx.restore()
  },
}

/** Vertical hairline following the hovered day */
const crosshair: Plugin<'line'> = {
  id: 'crosshair',
  afterDatasetsDraw(chart) {
    const active = chart.tooltip?.getActiveElements()[0]
    if (!active) return
    const { ctx, chartArea } = chart
    const x = active.element.x
    ctx.save()
    ctx.strokeStyle = muted
    ctx.globalAlpha = 0.5
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(x, chartArea.top)
    ctx.lineTo(x, chartArea.bottom)
    ctx.stroke()
    ctx.restore()
  },
}

const data = computed<ChartData<'line', (number | null)[]>>(() => ({
  labels: props.daily.map((day) => formatDayMonth(day.date)),
  datasets: [
    {
      label: 'Humeur moyenne',
      // null for hidden days: the line has a gap there
      data: props.daily.map((day) => day.average),
      spanGaps: false,
      borderColor: primary,
      borderWidth: 3,
      borderCapStyle: 'round',
      borderJoinStyle: 'round',
      // Smooth curve that never goes beyond the real values
      cubicInterpolationMode: 'monotone',
      fill: 'start',
      backgroundColor: (context) => {
        const { ctx, chartArea } = context.chart
        if (!chartArea) return 'transparent'
        const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
        gradient.addColorStop(0, fillTop)
        gradient.addColorStop(1, fillEnd)
        return gradient
      },
      pointRadius: 4,
      pointHoverRadius: 7,
      pointHitRadius: 14,
      pointBorderWidth: 2,
      pointBorderColor: surface,
      pointBackgroundColor: pointColor,
      pointHoverBackgroundColor: pointColor,
      pointHoverBorderColor: surface,
    },
  ],
}))

const options: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index', intersect: false },
  layout: { padding: { top: 8 } },
  scales: {
    y: {
      min: 1,
      max: 5,
      border: { display: false },
      ticks: {
        stepSize: 1,
        padding: 6,
        font: { size: 17 },
        callback: (value) => MOOD_SCORES[Number(value) - 1]?.emoji ?? '',
      },
      grid: { color: border },
    },
    x: {
      border: { display: false },
      ticks: {
        color: muted,
        font: { family: bodyFont, size: 12 },
        maxRotation: 0,
        autoSkip: true,
        maxTicksLimit: 7,
      },
      grid: { display: false },
    },
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      displayColors: false,
      backgroundColor: primary,
      padding: 12,
      cornerRadius: 12,
      titleFont: { family: bodyFont, size: 13, weight: 'bold' },
      bodyFont: { family: bodyFont, size: 13 },
      filter: (item) => item.parsed.y !== null,
      callbacks: {
        title: (items) => {
          const day = props.daily[items[0]?.dataIndex ?? 0]
          return day ? formatWeekday(day.date) : ''
        },
        label: (item) => `Moyenne : ${formatAverage(item.parsed.y ?? 0)} / 5`,
        afterLabel: (item) => `${props.daily[item.dataIndex]?.responses ?? 0} réponses`,
      },
    },
  },
}
</script>

<template>
  <figure class="team-chart">
    <div class="chart-canvas">
      <Line
        :data="data"
        :options="options"
        :plugins="[neutralLine, crosshair]"
        role="img"
        aria-label="Courbe de l’humeur moyenne de l’équipe, jour par jour. Le détail est disponible dans le tableau sous le graphe."
      />
    </div>

    <!-- Same data as a table: readable by screen readers and easy to check -->
    <details class="chart-table">
      <summary>Voir les données jour par jour</summary>
      <div class="chart-table-scroll">
        <table>
          <caption class="visually-hidden">
            Humeur moyenne de l’équipe par jour
          </caption>
          <thead>
            <tr>
              <th scope="col">Jour</th>
              <th scope="col">Moyenne</th>
              <th scope="col">Réponses</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="day in daily" :key="day.date" :class="{ hidden: day.hidden }">
              <th scope="row">{{ formatWeekday(day.date) }}</th>
              <template v-if="day.hidden">
                <td colspan="2" class="muted">Masqué (moins de {{ threshold }} réponses)</td>
              </template>
              <template v-else>
                <td>{{ formatAverage(day.average ?? 0) }} / 5</td>
                <td>{{ day.responses }}</td>
              </template>
            </tr>
          </tbody>
        </table>
      </div>
    </details>
  </figure>
</template>

<style scoped>
.team-chart {
  margin: 0;
}

.chart-canvas {
  position: relative;
  height: 270px;
}

@media (min-width: 960px) {
  .chart-canvas {
    height: 360px;
  }
}

.chart-table {
  margin-top: var(--space-sm);
  border-top: 1px solid var(--color-border);
}

.chart-table summary {
  display: flex;
  align-items: center;
  min-height: var(--tap-size);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-primary);
  cursor: pointer;
}

.chart-table-scroll {
  max-height: 320px;
  overflow-y: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--text-sm);
  font-variant-numeric: tabular-nums;
}

th,
td {
  padding: var(--space-2xs) var(--space-3xs);
  border-bottom: 1px solid var(--color-border);
  text-align: left;
}

thead th {
  position: sticky;
  top: 0;
  background: var(--color-surface);
  color: var(--color-text-muted);
  font-weight: 600;
}

tbody th {
  font-weight: 500;
}

tr.hidden th {
  color: var(--color-text-muted);
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
</style>
