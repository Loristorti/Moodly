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

const props = defineProps<{ daily: DailyStat[] }>()

/** Colors and fonts come from the CSS variables of assets/main.css */
const css = getComputedStyle(document.documentElement)
const cssVar = (name: string) => css.getPropertyValue(name).trim()
const primary = cssVar('--color-primary')
const muted = cssVar('--color-text-muted')
const border = cssVar('--color-border')
const surface = cssVar('--color-surface')
const moodColors = [1, 2, 3, 4, 5].map((score) => cssVar(`--mood-${score}`))
const bodyFont = cssVar('--font-body')

/** Each point takes the color of its mood level (3.6 -> color of 4) */
function pointColor(context: ScriptableContext<'line'>): string {
  const value = context.raw as number | null
  return value === null ? 'transparent' : (moodColors[Math.round(value) - 1] ?? primary)
}

/** Dashed line at 3 (neutral mood), drawn behind the curve */
const neutralLine: Plugin<'line'> = {
  id: 'neutralLine',
  beforeDatasetsDraw(chart) {
    const { ctx, chartArea, scales } = chart
    const y = scales.y?.getPixelForValue(3)
    if (y === undefined) return
    ctx.save()
    ctx.strokeStyle = muted
    ctx.globalAlpha = 0.5
    ctx.setLineDash([4, 6])
    ctx.beginPath()
    ctx.moveTo(chartArea.left, y)
    ctx.lineTo(chartArea.right, y)
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
      // Smooth curve that never goes beyond the real values
      cubicInterpolationMode: 'monotone',
      fill: 'start',
      backgroundColor: (context) => {
        const { ctx, chartArea } = context.chart
        if (!chartArea) return 'transparent'
        const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
        gradient.addColorStop(0, 'rgb(141 181 138 / 35%)')
        gradient.addColorStop(1, 'rgb(141 181 138 / 0%)')
        return gradient
      },
      pointRadius: 4,
      pointHoverRadius: 7,
      pointBorderWidth: 2,
      pointBorderColor: surface,
      pointBackgroundColor: pointColor,
      pointHoverBackgroundColor: pointColor,
    },
  ],
}))

const options: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  font: { family: bodyFont },
  interaction: { mode: 'nearest', intersect: false },
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
        maxTicksLimit: 6,
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
  <div class="chart">
    <Line
      :data="data"
      :options="options"
      :plugins="[neutralLine]"
      role="img"
      aria-label="Courbe de l’humeur moyenne de l’équipe, jour par jour"
    />
  </div>
</template>

<style scoped>
.chart {
  position: relative;
  height: 270px;
}
</style>
