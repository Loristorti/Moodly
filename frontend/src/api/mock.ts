import type {
  DailyStat,
  LoginResponse,
  MoodStatus,
  Team,
  TeamMessage,
  TeamStats,
} from '@/types/api'
import { ApiError } from './client'

/**
 * Fake responses used when VITE_USE_MOCK=true, so the front can be built
 * without the back. Same shapes as the real API (types/api.ts).
 * Demo login: any ...@moodly.dev email with the password Moodly2026!
 * ("manager.xxx@moodly.dev" logs in as a manager).
 */

const DEMO_PASSWORD = 'Moodly2026!'
const TEAM: Team = { id: 'mock-team', name: 'Équipe Produit' }

let submittedToday = false
let teamMessage: TeamMessage | null = {
  content:
    'Merci pour vos retours sur la charge de travail pendant le rush. On décale la prochaine livraison d’une semaine, et on en reparle ensemble vendredi.',
  updatedAt: new Date().toISOString(),
}

const wait = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms))

/** "2026-10-19", in local time */
function isoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

/** A stable scenario: good mood, a "rush" with a clear drop, then a recovery. */
function buildStats(days: number): TeamStats {
  const today = new Date()
  const daily: DailyStat[] = []

  for (let daysAgo = days - 1; daysAgo >= 0; daysAgo--) {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - daysAgo)
    const isWeekend = date.getDay() === 0 || date.getDay() === 6
    // Weekends, today and 2 weekdays with too few answers are hidden
    const hidden = isWeekend || daysAgo === 0 || daysAgo === 6 || daysAgo === 20
    const isRush = daysAgo >= 11 && daysAgo <= 15
    const average = isRush ? 2.2 + (daysAgo % 3) * 0.1 : 3.6 + (daysAgo % 4) * 0.1

    daily.push({
      date: isoDate(date),
      average: hidden ? null : Math.round(average * 10) / 10,
      responses: hidden ? null : 4 + (daysAgo % 2),
      hidden,
    })
  }

  return {
    team: { ...TEAM, employeeCount: 6 },
    period: { from: daily[0]?.date ?? '', to: isoDate(today), days },
    threshold: 3,
    daily,
    summary: {
      average: 3.3,
      previousAverage: 3.6,
      participationRate: 0.74,
      topTags: [
        { tag: 'WORKLOAD', count: 23 },
        { tag: 'RECOGNITION', count: 19 },
        { tag: 'TEAM_SPIRIT', count: 17 },
      ],
      topConcerns: [
        { tag: 'WORKLOAD', count: 18 },
        { tag: 'WORK_CONDITIONS', count: 7 },
        { tag: 'MANAGEMENT', count: 4 },
      ],
      alerts: [
        { type: 'DECLINE', value: -0.3 },
        { type: 'CONCERN', tag: 'WORKLOAD', value: 0.62 },
      ],
    },
  }
}

export const mock = {
  async login(email: string, password: string): Promise<LoginResponse> {
    await wait()
    if (password !== DEMO_PASSWORD || !email.trim().toLowerCase().endsWith('@moodly.dev')) {
      throw new ApiError('Email ou mot de passe incorrect', 401)
    }
    const isManager = email.trim().toLowerCase().startsWith('manager.')
    return {
      accessToken: 'mock-token',
      user: {
        id: 'mock-user',
        firstName: isManager ? 'Nathalie' : 'Alice',
        lastName: isManager ? 'Lambert' : 'Martin',
        role: isManager ? 'MANAGER' : 'EMPLOYEE',
        team: TEAM,
      },
    }
  },

  async getTodayStatus(): Promise<MoodStatus> {
    await wait()
    return { submitted: submittedToday }
  },

  async submitMood(): Promise<MoodStatus> {
    await wait()
    if (submittedToday) {
      throw new ApiError('Vous avez déjà renseigné votre humeur aujourd’hui', 409)
    }
    submittedToday = true
    return { submitted: true }
  },

  async getTeamStats(days: number): Promise<TeamStats> {
    await wait()
    return buildStats(days)
  },

  async getTeamMessage(): Promise<TeamMessage | null> {
    await wait()
    return teamMessage
  },

  async publishTeamMessage(content: string): Promise<TeamMessage> {
    await wait()
    teamMessage = { content: content.trim(), updatedAt: new Date().toISOString() }
    return teamMessage
  },

  async removeTeamMessage(): Promise<void> {
    await wait()
    teamMessage = null
  },

  async deleteAccount(): Promise<void> {
    await wait()
    submittedToday = false
  },
}
