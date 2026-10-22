/** Types mirroring the DTOs of the back (see the API documentation on /api/docs). */

export type Role = 'EMPLOYEE' | 'MANAGER'

export type MoodTag =
  | 'WORKLOAD'
  | 'TEAM_SPIRIT'
  | 'MANAGEMENT'
  | 'WORK_LIFE_BALANCE'
  | 'RECOGNITION'
  | 'WORK_CONDITIONS'
  | 'MEANING'
  | 'AUTONOMY'
  | 'COMMUNICATION'
  | 'ORGANIZATION'

export interface Team {
  id: string
  name: string
}

export interface User {
  id: string
  firstName: string
  lastName: string
  role: Role
  team: Team
}

export interface LoginResponse {
  accessToken: string
  user: User
}

export interface MoodStatus {
  submitted: boolean
}

export interface CreateMoodRequest {
  score: number
  tags: MoodTag[]
}

export interface DailyStat {
  date: string
  average: number | null
  responses: number | null
  hidden: boolean
}

export interface TagCount {
  tag: MoodTag
  count: number
}

export type AlertType = 'DECLINE' | 'CONCERN' | 'LOW_PARTICIPATION' | 'IMPROVEMENT'

export interface Alert {
  type: AlertType
  /** Average change (DECLINE, IMPROVEMENT) or a rate from 0 to 1 (CONCERN, LOW_PARTICIPATION) */
  value: number
  /** Only for CONCERN */
  tag?: MoodTag
}

export interface TeamStats {
  team: Team & { employeeCount: number }
  period: { from: string; to: string; days: number }
  threshold: number
  daily: DailyStat[]
  summary: {
    average: number | null
    /** Average of the previous period of the same length */
    previousAverage: number | null
    participationRate: number
    topTags: TagCount[] | null
    topConcerns: TagCount[] | null
    /** At most 3, the most urgent first */
    alerts: Alert[]
  }
}

export type WeatherType = 'SUNNY' | 'PARTLY_CLOUDY' | 'CLOUDY' | 'RAINY'

/** Weather of the team over the 7 days before today: a category, never a number */
export interface TeamWeather {
  weather: WeatherType | null
  period: { from: string; to: string }
}

/** Message from the manager to the whole team */
export interface TeamMessage {
  content: string
  /** ISO date and time of the last change */
  updatedAt: string
}

/** Error body returned by NestJS. */
export interface ApiErrorBody {
  statusCode: number
  message: string | string[]
  error?: string
}
