import type { WeatherType } from '@/types/api'

export interface WeatherInfo {
  emoji: string
  label: string
  /** Shown to employees, kept gentle */
  text: string
  /** CSS color of the tile, defined in assets/tokens.css */
  tile: string
}

/** Same values as the weather of the back (stats/weather.ts) */
export const WEATHER: Record<WeatherType, WeatherInfo> = {
  SUNNY: {
    emoji: '☀️',
    label: 'Grand soleil',
    text: 'L’équipe va bien cette semaine.',
    tile: 'var(--tile-yellow)',
  },
  PARTLY_CLOUDY: {
    emoji: '⛅',
    label: 'Éclaircies',
    text: 'Plutôt une bonne semaine pour l’équipe.',
    tile: 'var(--mood-4-soft)',
  },
  CLOUDY: {
    emoji: '☁️',
    label: 'Nuageux',
    text: 'Une semaine en demi-teinte pour l’équipe.',
    tile: 'var(--tile-cloud)',
  },
  RAINY: {
    emoji: '🌧️',
    label: 'Pluie',
    text: 'L’équipe traverse une période difficile, et votre manager le voit aussi.',
    tile: 'var(--tile-sky)',
  },
}
