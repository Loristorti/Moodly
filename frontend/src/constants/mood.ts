import type { MoodTag } from '@/types/api'

export interface MoodScore {
  score: number
  emoji: string
  label: string
}

export const MOOD_SCORES: MoodScore[] = [
  { score: 1, emoji: '😞', label: 'Très mal' },
  { score: 2, emoji: '🙁', label: 'Pas terrible' },
  { score: 3, emoji: '😐', label: 'Neutre' },
  { score: 4, emoji: '🙂', label: 'Bien' },
  { score: 5, emoji: '😄', label: 'Très bien' },
]

/** Same values as the MoodTag enum of the back. */
export const MOOD_TAGS: { value: MoodTag; label: string }[] = [
  { value: 'WORKLOAD', label: 'Charge de travail' },
  { value: 'TEAM_SPIRIT', label: 'Ambiance d’équipe' },
  { value: 'MANAGEMENT', label: 'Management' },
  { value: 'WORK_LIFE_BALANCE', label: 'Équilibre vie pro / perso' },
  { value: 'RECOGNITION', label: 'Reconnaissance' },
  { value: 'WORK_CONDITIONS', label: 'Conditions de travail' },
]

export const MAX_TAGS = 3

/** CSS colors of a mood level, defined in assets/main.css (--mood-1 ... --mood-5) */
export function moodColor(score: number): string {
  return `var(--mood-${score})`
}

export function moodSoftColor(score: number): string {
  return `var(--mood-${score}-soft)`
}

export function tagLabel(tag: MoodTag): string {
  return MOOD_TAGS.find((item) => item.value === tag)?.label ?? tag
}
