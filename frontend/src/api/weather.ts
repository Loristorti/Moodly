import type { TeamWeather } from '@/types/api'
import { client, USE_MOCK } from './client'
import { mock } from './mock'

/** Weather of the team of the logged-in user, over the 7 days before today */
export async function getTeamWeather(): Promise<TeamWeather> {
  if (USE_MOCK) {
    return mock.getTeamWeather()
  }
  const { data } = await client.get<TeamWeather>('/team-weather')
  return data
}
