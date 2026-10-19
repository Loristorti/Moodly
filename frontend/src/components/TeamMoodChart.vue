<script setup lang="ts">
import { computed } from 'vue'
import {
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  type ChartData,
  type ChartOptions,
  type Plugin,
} from 'chart.js'
import { Line } from 'vue-chartjs'
import { MOOD_SCORES } from '@/constants/mood'
import type { DailyStat } from '@/types/api'
import { formatAverage, formatDayMonth, formatWeekday } from '@/utils/format'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip)

const props = defineProps<{ daily: DailyStat[] }>()

/** Colors come from the CSS variables of assets/main.css */
const css = getComputedStyle(document.documentElement)
const color = (name: string) => css.getPropertyValue(name).trim()
const primary = color('--color-primary')
const muted = color('--color-text-muted')
const grid = color('--color-border')

/** Dashed line at 3 (neutral mood), drawn behind the curve */
const neutralLine: Plugin<'line'> = {
  id: 'neutralLine',
  beforeDatasetsDraw(chart) {
    const { ctx, chartArea, scales } = chart
    const y = scales.y?.getPixelForValue(3)
    if (y === undefined) return
    ctx.save()
    ctx.strokeStyle = muted
    ctx.setLineDash([6, 6])
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
      backgroundColor: primary,
      borderWidth: 3,
      pointRadius: 3,
      pointHoverRadius: 6,
      tension: 0.3,
    },
  ],
}))

const options: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'nearest', intersect: false },
  scales: {
    y: {
      min: 1,
      max: 5,
      ticks: {
        stepSize: 1,
        font: { size: 16 },
        callback: (value) => MOOD_SCORES[Number(value) - 1]?.emoji ?? '',
      },
      grid: { color: grid },
    },
    x: {
      ticks: { color: muted, maxRotation: 0, autoSkip: true, maxTicksLimit: 6 },
      grid: { display: false },
    },
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      displayColors: false,
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
  height: 260px;
}
</style>
