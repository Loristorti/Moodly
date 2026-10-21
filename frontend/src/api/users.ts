import { client, USE_MOCK } from './client'
import { mock } from './mock'

/** GDPR: deletes the account and its check-ins. Anonymous moods stay in the team averages. */
export async function deleteAccount(): Promise<void> {
  if (USE_MOCK) {
    return mock.deleteAccount()
  }
  await client.delete('/users/me')
}
