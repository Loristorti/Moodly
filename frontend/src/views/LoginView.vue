<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ApiError, USE_MOCK } from '@/api/client'
import { MOOD_SCORES, moodSoftColor } from '@/constants/mood'
import { homeFor } from '@/router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const error = ref<string | null>(null)
const loading = ref(false)

async function submit() {
  error.value = null
  if (!email.value.trim() || !password.value) {
    error.value = 'Renseignez votre email et votre mot de passe.'
    return
  }

  loading.value = true
  try {
    const user = await auth.login(email.value, password.value)
    await router.replace(homeFor(user.role))
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : 'Une erreur est survenue.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="page login">
    <header class="login-brand">
      <h1 class="login-wordmark reveal">Moodly</h1>
      <ul class="login-scale" aria-hidden="true">
        <li
          v-for="mood in MOOD_SCORES"
          :key="mood.score"
          class="emoji reveal"
          :style="{ '--order': mood.score, background: moodSoftColor(mood.score) }"
        >
          {{ mood.emoji }}
        </li>
      </ul>
      <p class="login-tagline reveal" style="--order: 6">Comment ça va, vraiment&nbsp;?</p>
      <p class="muted reveal" style="--order: 7">Votre humeur du jour en moins de 10 secondes.</p>
    </header>

    <form class="card login-form reveal" style="--order: 8" novalidate @submit.prevent="submit">
      <div class="field">
        <label for="email">Email professionnel</label>
        <input
          id="email"
          v-model="email"
          class="input"
          type="email"
          inputmode="email"
          autocomplete="username"
          autocapitalize="none"
          spellcheck="false"
          placeholder="prenom@moodly.dev"
          required
        />
      </div>

      <div class="field">
        <label for="password">Mot de passe</label>
        <input
          id="password"
          v-model="password"
          class="input"
          type="password"
          autocomplete="current-password"
          required
        />
      </div>

      <p v-if="error" class="alert" role="alert">{{ error }}</p>

      <button type="submit" class="button button-primary" :disabled="loading">
        {{ loading ? 'Connexion…' : 'Se connecter' }}
      </button>
    </form>

    <p v-if="USE_MOCK" class="notice reveal" style="--order: 9">
      <span class="emoji" aria-hidden="true">🧪</span>
      <span>
        Mode démo : un compte <strong>@moodly.dev</strong> et le mot de passe
        <strong>Moodly2026!</strong> (<strong>manager.produit@moodly.dev</strong> pour la vue
        manager).
      </span>
    </p>

    <p class="login-footer muted reveal" style="--order: 10">
      <span class="emoji" aria-hidden="true">🔒</span>
      Vos réponses sont anonymes : votre manager ne voit que des moyennes d’équipe.
    </p>
  </main>
</template>

<style scoped>
.login {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 24px;
  min-height: 100vh;
  min-height: 100dvh;
}

.login-brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
}

.login-wordmark {
  font-size: var(--text-display);
  font-weight: 700;
  letter-spacing: -0.03em;
  color: var(--color-primary);
}

.login-scale {
  display: flex;
  gap: 8px;
  margin: 4px 0 8px;
  padding: 0;
  list-style: none;
}

.login-scale li {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  font-size: 1.4rem;
}

.login-tagline {
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: 500;
  font-variation-settings: 'SOFT' 100;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.login-footer {
  font-size: var(--text-sm);
  text-align: center;
}
</style>
