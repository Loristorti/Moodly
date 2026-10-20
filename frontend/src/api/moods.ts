import type { CreateMoodRequest, MoodStatus } from '@/types/api'
import { client, USE_MOCK } from './client'
import { mock } from './mock'

/** Has the employee already answered today? */
export async function getTodayStatus(): Promise<MoodStatus> {
  if (USE_MOCK) {
    return mock.getTodayStatus()
  }
  const { data } = await client.get<MoodStatus>('/moods/today')
  return data
}

export async function submitMood(mood: CreateMoodRequest): Promise<MoodStatus> {
  if (USE_MOCK) {
    return mock.submitMood()
  }
  const { data } = await client.post<MoodStatus>('/moods', mood)
  return data
}
