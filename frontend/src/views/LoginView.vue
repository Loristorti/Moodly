<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ApiError, USE_MOCK } from '@/api/client'
import { MOOD_SCORES } from '@/constants/mood'
import { homeFor } from '@/router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
/** Set after an account deletion (see PrivacyView) */
const accountDeleted = useRoute().query.deleted === '1'

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
  <main class="login">
    <div class="login-grid">
      <header class="login-hero reveal">
        <span
          v-for="(mood, index) in MOOD_SCORES"
          :key="mood.score"
          class="login-float emoji"
          :style="{ '--i': index }"
          aria-hidden="true"
        >
          {{ mood.emoji }}
        </span>
        <h1 class="login-wordmark">Moodly</h1>
        <p class="login-tagline">Votre humeur du jour, en 10 secondes.</p>
      </header>

      <ul class="login-facts" role="list" aria-label="Moodly en bref">
        <li class="login-fact login-fact-yellow reveal" style="--order: 1">
          <b>10 s</b><span>pour répondre</span>
        </li>
        <li class="login-fact login-fact-mint reveal" style="--order: 2">
          <b>1 ×</b><span>par jour</span>
        </li>
        <li class="login-fact login-fact-pink reveal" style="--order: 3">
          <b>100 %</b><span>anonyme</span>
        </li>
      </ul>

      <form class="card login-form reveal" style="--order: 4" novalidate @submit.prevent="submit">
        <h2>Connexion</h2>

        <p v-if="accountDeleted" class="notice" role="status">
          <span class="emoji" aria-hidden="true">✅</span>
          <span>Votre compte a bien été supprimé.</span>
        </p>

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
            placeholder="prenom@entreprise.fr"
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

        <p class="login-help">Pas de compte ? Il est fourni par votre employeur.</p>

        <p v-if="USE_MOCK" class="notice">
          <span class="emoji" aria-hidden="true">🧪</span>
          <span>
            Mode démo : un compte <strong>@moodly.dev</strong> et le mot de passe
            <strong>Moodly2026!</strong> (<strong>manager.produit@moodly.dev</strong> pour la vue
            manager).
          </span>
        </p>
      </form>
    </div>
  </main>
</template>

<style scoped>
.login {
  display: flex;
  align-items: center;
  min-height: 100vh;
  min-height: 100dvh;
  padding: var(--space-sm) 14px var(--space-lg);
}

.login-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 10px;
  width: 100%;
  max-width: var(--page-width);
  margin: 0 auto;
}

/* Big violet tile where the five moods float */
.login-hero {
  position: relative;
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  min-height: 260px;
  padding: var(--space-md) 20px;
  overflow: hidden;
  border-radius: var(--radius);
  background: var(--gradient-hero);
  color: var(--color-on-primary);
}

.login-float {
  position: absolute;
  top: calc(18px + var(--i) * 4%);
  left: calc(6% + var(--i) * 18%);
  font-size: 2.5rem;
  animation: float 3.6s var(--ease-in-out) infinite;
  animation-delay: calc(var(--i) * -0.7s);
}

.login-float:nth-child(even) {
  top: 72px;
  font-size: 2rem;
}

.login-wordmark {
  position: relative;
  font-size: var(--text-display);
  letter-spacing: -0.03em;
  line-height: 1;
}

.login-tagline {
  position: relative;
  margin-top: 6px;
  font-size: 1.1rem;
}

/* Three key facts */
.login-facts {
  display: contents;
  list-style: none;
}

.login-fact {
  grid-column: span 2;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  min-height: 96px;
  padding: 14px;
  border-radius: var(--radius);
}

.login-fact b {
  font-size: 1.6rem;
  font-weight: 900;
  line-height: 1;
}

.login-fact span {
  margin-top: var(--space-3xs);
  font-size: var(--text-xs);
  font-weight: 800;
  color: var(--color-text-soft);
}

.login-fact-yellow {
  background: var(--tile-yellow);
}

.login-fact-mint {
  background: var(--tile-mint);
}

.login-fact-pink {
  background: var(--tile-pink);
}

.login-form {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.login-form h2 {
  font-size: var(--text-lg);
}

.login-help {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  text-align: center;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0) rotate(-6deg);
  }
  50% {
    transform: translateY(-12px) rotate(6deg);
  }
}

/* Desktop: the hero on the left, the form on the right, the facts below the hero */
@media (min-width: 960px) {
  .login-grid {
    grid-template-columns: repeat(12, minmax(0, 1fr));
    gap: 14px;
    max-width: 980px;
  }

  .login-hero {
    grid-column: 1 / 8;
    grid-row: 1;
    min-height: 420px;
    padding: var(--space-lg);
  }

  .login-wordmark {
    font-size: 4.5rem;
  }

  .login-tagline {
    font-size: 1.4rem;
  }

  .login-float {
    font-size: 3.75rem;
  }

  .login-float:nth-child(even) {
    top: 120px;
    font-size: 3rem;
  }

  .login-form {
    grid-column: 8 / 13;
    grid-row: 1 / 3;
    justify-content: center;
  }

  .login-fact {
    grid-column: span 7;
    grid-row: 2;
    min-height: 110px;
  }

  .login-fact:nth-child(1) {
    grid-column: 1 / 4;
  }

  .login-fact:nth-child(2) {
    grid-column: 4 / 6;
  }

  .login-fact:nth-child(3) {
    grid-column: 6 / 8;
  }
}
</style>
