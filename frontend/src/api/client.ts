import axios, { isAxiosError } from 'axios'
import type { ApiErrorBody } from '@/types/api'

/** true = fake responses from api/mock.ts, to work without the back. */
export const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

/** Error with a message that can be shown to the user as is (in French). */
export class ApiError extends Error {
  readonly status: number | null

  constructor(message: string, status: number | null) {
    super(message)
    this.status = status
  }
}

let getToken: () => string | null = () => null
let onUnauthorized: () => void = () => {}

/**
 * Called once in main.ts: the client reads the token from the auth store,
 * and warns it when the session is no longer valid.
 */
export function configureApiClient(options: {
  getToken: () => string | null
  onUnauthorized: () => void
}) {
  getToken = options.getToken
  onUnauthorized = options.onUnauthorized
}

export const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10_000,
})

client.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

client.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const apiError = toApiError(error)
    // Expired or invalid session (a wrong password on the login form has no token yet)
    if (apiError.status === 401 && getToken()) {
      onUnauthorized()
    }
    return Promise.reject(apiError)
  },
)

function toApiError(error: unknown): ApiError {
  if (!isAxiosError<ApiErrorBody>(error)) {
    return new ApiError('Une erreur est survenue.', null)
  }
  if (!error.response) {
    return new ApiError('Impossible de joindre le serveur. Vérifiez votre connexion.', null)
  }
  const message = error.response.data?.message
  const text = Array.isArray(message) ? message[0] : message
  return new ApiError(text ?? 'Une erreur est survenue.', error.response.status)
}
