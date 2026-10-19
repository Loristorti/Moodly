import type { LoginResponse } from '@/types/api'
import { client, USE_MOCK } from './client'
import { mock } from './mock'

export async function login(email: string, password: string): Promise<LoginResponse> {
  if (USE_MOCK) {
    return mock.login(email, password)
  }
  const { data } = await client.post<LoginResponse>('/auth/login', { email, password })
  return data
}
