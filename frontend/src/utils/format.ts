import { MOOD_SCORES } from '@/constants/mood'

const averageFormat = new Intl.NumberFormat('fr-FR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})
const percentFormat = new Intl.NumberFormat('fr-FR', { style: 'percent' })

/** "2026-09-21" -> "21/09" */
export function formatDayMonth(isoDate: string): string {
  const [, month, day] = isoDate.split('-')
  return `${day}/${month}`
}

/** "2026-09-21" -> "lundi 21/09" */
export function formatWeekday(isoDate: string): string {
  // Noon avoids any time zone shift to the previous or next day
  const weekday = new Date(`${isoDate}T12:00:00`).toLocaleDateString('fr-FR', {
    weekday: 'long',
  })
  return `${weekday} ${formatDayMonth(isoDate)}`
}

/** 3.4 -> "3,4" */
export function formatAverage(value: number): string {
  return averageFormat.format(value)
}

/** 0.78 -> "78 %" */
export function formatPercent(rate: number): string {
  return percentFormat.format(rate)
}

/** Emoji of the closest score, e.g. 3.6 -> 🙂 */
export function emojiFor(average: number): string {
  return MOOD_SCORES[Math.round(average) - 1]?.emoji ?? ''
}
