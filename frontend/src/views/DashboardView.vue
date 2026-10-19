<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ApiError } from '@/api/client'
import { getTeamStats } from '@/api/stats'
import AppHeader from '@/components/AppHeader.vue'
import TeamMoodChart from '@/components/TeamMoodChart.vue'
import { moodSoftColor, tagLabel } from '@/constants/mood'
import type { TeamStats } from '@/types/api'
import { emojiFor, formatAverage, formatPercent } from '@/utils/format'

const DAYS = 30

const stats = ref<TeamStats | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

/** No visible day at all: nothing to draw yet */
const isEmpty = computed(() => stats.value?.daily.every((day) => day.hidden) ?? true)

const averageTint = computed(() => {
  const average = stats.value?.summary.average
  return average == null ? 'var(--color-surface)' : moodSoftColor(Math.round(average))
})

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

    <section v-else-if="error" class="card stack reveal">
      <p class="alert" role="alert">{{ error }}</p>
      <button type="button" class="button button-secondary" @click="load">Réessayer</button>
    </section>

    <template v-else-if="stats">
      <header class="dashboard-title reveal">
        <p class="eyebrow">Tableau de bord · {{ stats.period.days }} derniers jours</p>
        <h1>{{ stats.team.name }}</h1>
        <p class="muted">{{ stats.team.employeeCount }} employés</p>
      </header>

      <section class="indicators reveal" style="--order: 1" aria-label="Indicateurs clés">
        <div class="card indicator" :style="{ background: averageTint }">
          <p class="indicator-label">Moyenne</p>
          <p class="indicator-value">
            <template v-if="stats.summary.average !== null">
              {{ formatAverage(stats.summary.average) }}<small>/5</small>
              <span class="emoji indicator-emoji" aria-hidden="true">
                {{ emojiFor(stats.summary.average) }}
              </span>
            </template>
            <template v-else>—</template>
          </p>
        </div>

        <div class="card indicator">
          <p class="indicator-label">Participation</p>
          <p class="indicator-value">{{ formatPercent(stats.summary.participationRate) }}</p>
        </div>
      </section>

      <section class="card reveal" style="--order: 2">
        <h2>L’humeur, jour par jour</h2>
        <p v-if="isEmpty" class="muted center empty">
          Pas encore assez de réponses pour afficher la courbe.
        </p>
        <TeamMoodChart v-else class="chart" :daily="stats.daily" />
        <p class="notice chart-note">
          <span class="emoji" aria-hidden="true">🔒</span>
          <span>
            Les jours avec moins de {{ stats.threshold }} réponses sont masqués pour protéger
            l’anonymat.
          </span>
        </p>
      </section>

      <section class="card stack reveal" style="--order: 3">
        <div>
          <h2>Principales préoccupations</h2>
          <p class="muted small">Les thèmes cités quand l’humeur est basse (1 ou 2 sur 5)</p>
        </div>
        <ol v-if="stats.summary.topConcerns?.length" class="ranking ranking-concerns">
          <li v-for="(item, index) in stats.summary.topConcerns" :key="item.tag">
            <span class="ranking-position">{{ index + 1 }}</span>
            <span class="ranking-label">{{ tagLabel(item.tag) }}</span>
            <span class="ranking-count muted">{{ item.count }} mentions</span>
          </li>
        </ol>
        <p v-else class="muted">Aucune préoccupation à signaler sur la période.</p>
      </section>

      <section class="card stack reveal" style="--order: 4">
        <h2>Thèmes les plus cités</h2>
        <ol v-if="stats.summary.topTags?.length" class="ranking">
          <li v-for="(item, index) in stats.summary.topTags" :key="item.tag">
            <span class="ranking-position">{{ index + 1 }}</span>
            <span class="ranking-label">{{ tagLabel(item.tag) }}</span>
            <span class="ranking-count muted">{{ item.count }} mentions</span>
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
  gap: 14px;
}

.center {
  text-align: center;
}

.small {
  margin-top: 4px;
  font-size: 0.85rem;
}

.dashboard-title {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 4px 4px 0;
}

.dashboard-title h1 {
  font-size: 2rem;
}

h2 {
  font-size: 1.2rem;
}

.empty {
  padding: 56px 0;
}

.chart {
  margin-top: 12px;
}

.chart-note {
  margin-top: 14px;
}

.indicators {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.indicator {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 8px;
  padding: 18px;
}

.indicator-label {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.indicator-value {
  display: flex;
  align-items: baseline;
  gap: 2px;
  font-family: var(--font-display);
  font-size: 2.4rem;
  font-weight: 600;
  font-variation-settings: 'SOFT' 100;
  line-height: 1;
  letter-spacing: -0.02em;
}

.indicator-value small {
  font-size: 1rem;
  color: var(--color-text-muted);
}

.indicator-emoji {
  margin-left: auto;
  font-size: 1.6rem;
}

.ranking {
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  list-style: none;
}

.ranking li {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: var(--tap-size);
  border-top: 1px solid var(--color-border);
}

.ranking li:first-child {
  border-top: none;
}

.ranking-position {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--color-primary-soft);
  font-family: var(--font-display);
  font-weight: 700;
  color: var(--color-primary);
}

.ranking-concerns .ranking-position {
  background: var(--mood-1-soft);
  color: var(--color-danger);
}

.ranking-label {
  flex: 1;
  font-weight: 550;
}

.ranking-count {
  font-size: 0.85rem;
  font-variant-numeric: tabular-nums;
}
</style>
