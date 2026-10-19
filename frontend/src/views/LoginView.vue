<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ApiError, USE_MOCK } from '@/api/client'
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
    <div class="login-intro">
      <h1 class="login-title">Moodly</h1>
      <p class="muted">Votre humeur du jour, en moins de 10 secondes.</p>
    </div>

    <form class="card login-form" novalidate @submit.prevent="submit">
      <div class="field">
        <label for="email">Email</label>
        <input
          id="email"
          v-model="email"
          class="input"
          type="email"
          inputmode="email"
          autocomplete="username"
          autocapitalize="none"
          spellcheck="false"
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

    <p v-if="USE_MOCK" class="notice">
      Mode démo : utilisez un compte <strong>@moodly.dev</strong> avec le mot de passe
      <strong>Moodly2026!</strong> (<strong>manager.produit@moodly.dev</strong> pour la vue
      manager).
    </p>

    <p class="login-footer muted">
      Vos réponses sont anonymes : votre manager ne voit que des moyennes d’équipe.
    </p>
  </main>
</template>

<style scoped>
.login {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 20px;
  min-height: 100vh;
}

.login-intro {
  text-align: center;
}

.login-title {
  font-size: 2.25rem;
  color: var(--color-primary);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.login-footer {
  font-size: 0.875rem;
  text-align: center;
}
</style>
