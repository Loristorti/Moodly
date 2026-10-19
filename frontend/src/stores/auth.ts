import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import * as authApi from '@/api/auth'
import type { User } from '@/types/api'

const STORAGE_KEY = 'moodly.auth'

interface SavedSession {
  token: string
  user: User
}

function readSavedSession(): SavedSession | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? (JSON.parse(saved) as SavedSession) : null
  } catch {
    return null
  }
}

/** Logged-in user and JWT, kept in localStorage so the session survives a reload. */
export const useAuthStore = defineStore('auth', () => {
  const saved = readSavedSession()
  const token = ref<string | null>(saved?.token ?? null)
  const user = ref<User | null>(saved?.user ?? null)

  const isLoggedIn = computed(() => token.value !== null && user.value !== null)

  async function login(email: string, password: string): Promise<User> {
    const response = await authApi.login(email.trim(), password)
    token.value = response.accessToken
    user.value = response.user
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: token.value, user: user.value }))
    return response.user
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem(STORAGE_KEY)
  }

  return { token, user, isLoggedIn, login, logout }
})
