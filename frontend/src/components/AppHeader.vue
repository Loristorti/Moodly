<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

function logout() {
  auth.logout()
  void router.replace('/login')
}
</script>

<template>
  <header class="app-header">
    <div class="app-header-content">
      <div class="app-header-identity">
        <p class="app-header-brand">Moodly</p>
        <p v-if="auth.user" class="app-header-user muted">
          {{ auth.user.firstName }} · {{ auth.user.team.name }}
        </p>
      </div>
      <button type="button" class="button button-secondary app-header-logout" @click="logout">
        Déconnexion
      </button>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: rgb(247 242 234 / 85%);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--color-border);
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

.app-header-identity {
  min-width: 0;
}

.app-header-brand {
  font-family: var(--font-display);
  font-size: 1.35rem;
  font-weight: 700;
  font-variation-settings: 'SOFT' 100;
  letter-spacing: -0.02em;
  color: var(--color-primary);
  line-height: 1.2;
}

.app-header-user {
  overflow: hidden;
  font-size: 0.85rem;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.app-header-logout {
  flex-shrink: 0;
  font-size: 0.9rem;
}
</style>
