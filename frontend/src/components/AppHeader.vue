<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

/** wide: aligns the header with the wide desktop layout of the dashboard */
defineProps<{ wide?: boolean }>()

const auth = useAuthStore()
const router = useRouter()

function logout() {
  auth.logout()
  void router.replace('/login')
}
</script>

<template>
  <header class="app-header">
    <div class="app-header-content" :class="{ wide }">
      <div class="app-header-identity">
        <p class="app-header-brand">Moodly</p>
        <p v-if="auth.user" class="app-header-user muted">
          {{ auth.user.firstName }} · {{ auth.user.team.name }}
        </p>
      </div>
      <nav class="app-header-actions" aria-label="Compte">
        <RouterLink
          to="/donnees"
          class="button button-secondary app-header-icon"
          aria-label="Vos données"
          title="Vos données"
        >
          <span class="emoji" aria-hidden="true">🔒</span>
        </RouterLink>
        <button type="button" class="button button-secondary app-header-logout" @click="logout">
          Déconnexion
        </button>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--color-bg-translucent);
  backdrop-filter: blur(10px);
  border-bottom: var(--border-width) solid var(--color-border);
}

.app-header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  max-width: var(--page-width);
  margin: 0 auto;
  padding: 8px 16px;
  padding-top: calc(8px + env(safe-area-inset-top));
}

@media (min-width: 960px) {
  .app-header-content.wide {
    max-width: var(--page-width-wide);
    padding-inline: var(--space-md);
  }
}

.app-header-identity {
  min-width: 0;
}

.app-header-brand {
  font-family: var(--font-display);
  font-size: 1.4rem;
  font-weight: 900;
  letter-spacing: -0.02em;
  color: var(--color-primary);
  line-height: 1.2;
}

.app-header-user {
  overflow: hidden;
  font-size: var(--text-sm);
  font-weight: 700;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.app-header-actions {
  display: flex;
  flex-shrink: 0;
  gap: var(--space-2xs);
}

.app-header-icon {
  width: var(--tap-size);
  padding: 0;
  text-decoration: none;
}

.app-header-logout {
  flex-shrink: 0;
  font-size: 0.9rem;
}
</style>
