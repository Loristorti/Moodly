import { tagLabel } from '@/constants/mood'
import type { Alert } from '@/types/api'
import { formatAverage, formatPercent } from './format'

export type AlertTone = 'warning' | 'info' | 'positive'

export interface AlertMessage {
  emoji: string
  text: string
  tone: AlertTone
}

/** French sentence shown to the manager for an alert of the API */
export function alertMessage(alert: Alert, days: number): AlertMessage {
  // "0,4 point", "2,1 points": singular below 2 in French
  const change = `${formatAverage(Math.abs(alert.value))} ${Math.abs(alert.value) >= 2 ? 'points' : 'point'}`
  switch (alert.type) {
    case 'DECLINE':
      return {
        emoji: '📉',
        text: `La moyenne baisse de ${change} par rapport aux ${days} jours précédents.`,
        tone: 'warning',
      }
    case 'CONCERN':
      return {
        emoji: '🔎',
        text: `« ${alert.tag ? tagLabel(alert.tag) : 'Un thème'} » revient dans ${formatPercent(alert.value)} des réponses basses.`,
        tone: 'warning',
      }
    case 'LOW_PARTICIPATION':
      return {
        emoji: '🙋',
        text: `${formatPercent(alert.value)} de participation seulement : les résultats sont moins représentatifs.`,
        tone: 'info',
      }
    case 'IMPROVEMENT':
      return {
        emoji: '🌱',
        text: `La moyenne monte de ${change} par rapport aux ${days} jours précédents.`,
        tone: 'positive',
      }
  }
}
