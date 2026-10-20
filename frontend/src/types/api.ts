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

export interface TeamStats {
  team: Team & { employeeCount: number }
  period: { from: string; to: string; days: number }
  threshold: number
  daily: DailyStat[]
  summary: {
    average: number | null
    participationRate: number
    topTags: TagCount[] | null
    topConcerns: TagCount[] | null
  }
}

/** Error body returned by NestJS. */
export interface ApiErrorBody {
  statusCode: number
  message: string | string[]
  error?: string
}
