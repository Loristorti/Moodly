<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ApiError } from '@/api/client'
import { deleteAccount } from '@/api/users'
import AppHeader from '@/components/AppHeader.vue'
import { homeFor } from '@/router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

const homePath = computed(() => (auth.user ? homeFor(auth.user.role) : '/login'))
const confirming = ref(false)
const deleting = ref(false)
const error = ref<string | null>(null)

async function confirmDeletion() {
  deleting.value = true
  error.value = null
  try {
    await deleteAccount()
    auth.logout()
    await router.replace({ path: '/login', query: { deleted: '1' } })
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : 'Une erreur est survenue.'
    deleting.value = false
  }
}
</script>

<template>
  <AppHeader />

  <main class="page privacy">
    <RouterLink :to="homePath" class="privacy-back">← Retour</RouterLink>

    <header class="privacy-title reveal">
      <h1>Vos données</h1>
      <p class="muted">Ce que Moodly garde, ce que votre manager voit, et comment tout effacer.</p>
    </header>

    <section class="card reveal" style="--order: 1" aria-labelledby="stored-title">
      <h2 id="stored-title">Ce que Moodly enregistre</h2>
      <ul class="privacy-list">
        <li>
          <span class="emoji" aria-hidden="true">👤</span>
          <span
            ><strong>Votre compte</strong> : prénom, nom, email, équipe. Fourni par votre
            employeur.</span
          >
        </li>
        <li>
          <span class="emoji" aria-hidden="true">📅</span>
          <span>
            <strong>Le fait que vous avez répondu aujourd’hui</strong>, pour éviter une deuxième
            réponse. Effacé automatiquement dès le lendemain.
          </span>
        </li>
        <li>
          <span class="emoji" aria-hidden="true">🙂</span>
          <span>
            <strong>Votre humeur et vos thèmes</strong>, enregistrés
            <strong>sans votre nom</strong>, avec seulement le jour et votre équipe.
          </span>
        </li>
      </ul>
      <p class="muted privacy-small">
        Jamais d’heure, jamais de texte libre, jamais de donnée de santé.
      </p>
    </section>

    <div class="privacy-pair reveal" style="--order: 2">
      <section class="privacy-tile privacy-sees" aria-labelledby="sees-title">
        <h2 id="sees-title">Ce que voit votre manager</h2>
        <p>La moyenne de l’équipe, jour par jour.</p>
        <p>Le taux de participation.</p>
        <p>Les thèmes les plus cités.</p>
      </section>
      <section class="privacy-tile privacy-never" aria-labelledby="never-title">
        <h2 id="never-title">Ce qu’il ne voit jamais</h2>
        <p>✕ Votre réponse</p>
        <p>✕ Si vous avez répondu</p>
        <p>✕ Un jour avec moins de 3 réponses</p>
      </section>
    </div>

    <section class="card privacy-delete reveal" style="--order: 3" aria-labelledby="delete-title">
      <h2 id="delete-title">Supprimer mon compte</h2>
      <p class="muted">
        Votre compte est effacé. Vos humeurs passées restent dans les moyennes de l’équipe : elles
        ne contiennent pas votre nom et ne permettent pas de vous retrouver.
      </p>

      <button
        v-if="!confirming"
        type="button"
        class="button button-danger"
        @click="confirming = true"
      >
        Supprimer mon compte
      </button>

      <div v-else class="privacy-confirm" role="alertdialog" aria-labelledby="confirm-text">
        <p id="confirm-text">
          <strong>Cette action est définitive.</strong> Votre session sera fermée.
        </p>
        <p v-if="error" class="alert" role="alert">{{ error }}</p>
        <div class="privacy-actions">
          <button
            type="button"
            class="button button-secondary"
            :disabled="deleting"
            @click="confirming = false"
          >
            Annuler
          </button>
          <button
            type="button"
            class="button button-danger"
            :disabled="deleting"
            @click="confirmDeletion"
          >
            {{ deleting ? 'Suppression…' : 'Oui, supprimer' }}
          </button>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.privacy {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.privacy-back {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  min-height: var(--tap-size);
  color: var(--color-primary-edge);
  font-weight: 800;
  text-decoration: none;
}

.privacy-title h1 {
  font-size: var(--text-2xl);
}

h2 {
  margin-bottom: var(--space-2xs);
  font-size: var(--text-lg);
}

.privacy-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  margin: 0 0 var(--space-xs);
  padding: 0;
  list-style: none;
}

.privacy-list li {
  display: flex;
  gap: var(--space-xs);
}

.privacy-small {
  font-size: var(--text-sm);
}

.privacy-pair {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.privacy-tile {
  padding: var(--space-sm);
  border-radius: var(--radius);
}

.privacy-tile h2 {
  font-size: var(--text-md);
}

.privacy-tile p {
  margin-bottom: 6px;
  font-size: var(--text-sm);
}

.privacy-sees {
  background: var(--tile-mint);
}

.privacy-never {
  background: var(--color-danger-soft);
}

.privacy-never p {
  color: var(--color-danger);
}

.privacy-delete {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.privacy-confirm {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  padding: var(--space-sm);
  border-radius: var(--radius-small);
  background: var(--color-danger-soft);
}

.privacy-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-2xs);
}

.button-danger {
  background: var(--color-danger);
  color: var(--color-on-primary);
}

.button-danger:hover:not(:disabled) {
  filter: brightness(0.92);
}
</style>
