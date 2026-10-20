import type { TeamStats } from '@/types/api'
import { client, USE_MOCK } from './client'
import { mock } from './mock'

/** Stats of the manager's own team (the back takes the team from the token). */
export async function getTeamStats(days = 30): Promise<TeamStats> {
  if (USE_MOCK) {
    return mock.getTeamStats(days)
  }
  const { data } = await client.get<TeamStats>('/stats/team', { params: { days } })
  return data
}
