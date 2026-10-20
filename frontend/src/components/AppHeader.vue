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
      <div>
        <p class="app-header-brand">Moodly</p>
        <p v-if="auth.user" class="app-header-user muted">
          {{ auth.user.firstName }} · {{ auth.user.team.name }}
        </p>
      </div>
      <button type="button" class="button button-secondary" @click="logout">Se déconnecter</button>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  background: var(--color-surface);
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
}

.app-header-brand {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--color-primary);
}

.app-header-user {
  font-size: 0.875rem;
}
</style>
