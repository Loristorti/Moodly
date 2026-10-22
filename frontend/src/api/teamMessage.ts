import type { TeamMessage } from '@/types/api'
import { client, USE_MOCK } from './client'
import { mock } from './mock'

/** Message of the manager to the team of the logged-in user, or null */
export async function getTeamMessage(): Promise<TeamMessage | null> {
  if (USE_MOCK) {
    return mock.getTeamMessage()
  }
  const { data } = await client.get<{ message: TeamMessage | null }>('/team-message')
  return data.message
}

/** Manager only: creates or replaces the message */
export async function publishTeamMessage(content: string): Promise<TeamMessage> {
  if (USE_MOCK) {
    return mock.publishTeamMessage(content)
  }
  const { data } = await client.put<TeamMessage>('/team-message', { content })
  return data
}

/** Manager only */
export async function removeTeamMessage(): Promise<void> {
  if (USE_MOCK) {
    return mock.removeTeamMessage()
  }
  await client.delete('/team-message')
}
