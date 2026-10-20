<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ApiError } from '@/api/client'
import { getTeamStats } from '@/api/stats'
import AppHeader from '@/components/AppHeader.vue'
import TeamMoodChart from '@/components/TeamMoodChart.vue'
import { tagLabel } from '@/constants/mood'
import type { TeamStats } from '@/types/api'
import { emojiFor, formatAverage, formatPercent } from '@/utils/format'

const DAYS = 30

const stats = ref<TeamStats | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

/** No visible day at all: nothing to draw yet */
const isEmpty = computed(() => stats.value?.daily.every((day) => day.hidden) ?? true)

async function load() {
  loading.value = true
  error.value = null
  try {
    stats.value = await getTeamStats(DAYS)
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : 'Une erreur est survenue.'
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <AppHeader />

  <main class="page dashboard">
    <p v-if="loading" class="muted center" role="status">Chargement des statistiques…</p>

    <section v-else-if="error" class="card stack">
      <p class="alert" role="alert">{{ error }}</p>
      <button type="button" class="button button-secondary" @click="load">Réessayer</button>
    </section>

    <template v-else-if="stats">
      <header class="dashboard-title">
        <h1>{{ stats.team.name }}</h1>
        <p class="muted">
          Humeur moyenne sur les {{ stats.period.days }} derniers jours ·
          {{ stats.team.employeeCount }} employés
        </p>
      </header>

      <section class="card">
        <p v-if="isEmpty" class="muted center empty">
          Pas encore assez de réponses pour afficher la courbe.
        </p>
        <TeamMoodChart v-else :daily="stats.daily" />
        <p class="chart-note muted">
          🔒 Les jours avec moins de {{ stats.threshold }} réponses sont masqués pour protéger
          l’anonymat.
        </p>
      </section>

      <section class="indicators" aria-label="Indicateurs">
        <div class="card indicator">
          <p class="indicator-label">Moyenne sur {{ stats.period.days }} jours</p>
          <p class="indicator-value">
            <template v-if="stats.summary.average !== null">
              {{ formatAverage(stats.summary.average) }} / 5
              <span aria-hidden="true">{{ emojiFor(stats.summary.average) }}</span>
            </template>
            <template v-else>—</template>
          </p>
        </div>

        <div class="card indicator">
          <p class="indicator-label">Taux de participation</p>
          <p class="indicator-value">{{ formatPercent(stats.summary.participationRate) }}</p>
        </div>
      </section>

      <section class="card stack">
        <h2>Principales préoccupations</h2>
        <p class="muted small">Thèmes les plus cités quand l’humeur est basse (1 ou 2 sur 5)</p>
        <ol v-if="stats.summary.topConcerns?.length" class="tag-ranking">
          <li v-for="item in stats.summary.topConcerns" :key="item.tag">
            <span>{{ tagLabel(item.tag) }}</span>
            <span class="muted">{{ item.count }} mentions</span>
          </li>
        </ol>
        <p v-else class="muted">Aucune préoccupation à afficher sur la période.</p>
      </section>

      <section class="card stack">
        <h2>Thèmes les plus cités</h2>
        <ol v-if="stats.summary.topTags?.length" class="tag-ranking">
          <li v-for="item in stats.summary.topTags" :key="item.tag">
            <span>{{ tagLabel(item.tag) }}</span>
            <span class="muted">{{ item.count }} mentions</span>
          </li>
        </ol>
        <p v-else class="muted">Pas assez de réponses sur la période.</p>
      </section>
    </template>
  </main>
</template>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.center {
  text-align: center;
}

.small {
  font-size: 0.875rem;
}

.dashboard-title h1 {
  font-size: 1.5rem;
}

h2 {
  font-size: 1.05rem;
}

.empty {
  padding: 48px 0;
}

.chart-note {
  margin-top: 12px;
  font-size: 0.85rem;
}

.indicators {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.indicator {
  padding: 16px;
}

.indicator-label {
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.indicator-value {
  margin-top: 4px;
  font-size: 1.5rem;
  font-weight: 700;
}

.tag-ranking {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0;
  padding-left: 1.25rem;
}

.tag-ranking li {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}
</style>
