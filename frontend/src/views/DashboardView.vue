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

/** The average card takes the soft color of its mood level */
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
  <AppHeader wide />

  <main class="page dashboard">
    <p v-if="loading" class="muted center" role="status">Chargement des statistiques…</p>

    <section v-else-if="error" class="card stack reveal">
      <p class="alert" role="alert">{{ error }}</p>
      <button type="button" class="button button-secondary" @click="load">Réessayer</button>
    </section>

    <div v-else-if="stats" class="dashboard-grid">
      <header class="area-title reveal">
        <h1>{{ stats.team.name }}</h1>
        <p class="muted">
          {{ stats.team.employeeCount }} employés · {{ stats.period.days }} derniers jours
        </p>
      </header>

      <section class="area-kpis indicators reveal" style="--order: 1" aria-label="Indicateurs clés">
        <div class="card indicator" :style="{ background: averageTint }">
          <p class="indicator-label">Moyenne sur {{ stats.period.days }} jours</p>
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
          <p class="indicator-label">Taux de participation</p>
          <p class="indicator-value">{{ formatPercent(stats.summary.participationRate) }}</p>
        </div>
      </section>

      <section class="area-chart card reveal" style="--order: 2">
        <h2>L’humeur, jour par jour</h2>
        <p v-if="isEmpty" class="muted center empty">
          Pas encore assez de réponses pour afficher la courbe.
        </p>
        <TeamMoodChart v-else class="chart" :daily="stats.daily" :threshold="stats.threshold" />
        <p class="notice chart-note">
          <span class="emoji" aria-hidden="true">🔒</span>
          <span>
            Les jours avec moins de {{ stats.threshold }} réponses sont masqués pour protéger
            l’anonymat.
          </span>
        </p>
      </section>

      <section class="area-concerns card stack reveal" style="--order: 3">
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

      <section class="area-tags card stack reveal" style="--order: 4">
        <div>
          <h2>Thèmes les plus cités</h2>
          <p class="muted small">Toutes humeurs confondues</p>
        </div>
        <ol v-if="stats.summary.topTags?.length" class="ranking">
          <li v-for="(item, index) in stats.summary.topTags" :key="item.tag">
            <span class="ranking-position">{{ index + 1 }}</span>
            <span class="ranking-label">{{ tagLabel(item.tag) }}</span>
            <span class="ranking-count muted">{{ item.count }} mentions</span>
          </li>
        </ol>
        <p v-else class="muted">Pas assez de réponses sur la période.</p>
      </section>
    </div>
  </main>
</template>

<style scoped>
/* Mobile: one column, in reading order (title, key figures, chart, rankings) */
.dashboard-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--space-sm);
}

/* Desktop: chart wide with the key figures beside it, the two rankings side by side */
@media (min-width: 960px) {
  .page.dashboard {
    max-width: var(--page-width-wide);
    padding: var(--space-lg) var(--space-md) var(--space-xl);
  }

  .dashboard-grid {
    grid-template-columns: repeat(12, minmax(0, 1fr));
    gap: var(--space-md);
  }

  .area-title {
    grid-column: 1 / -1;
  }

  .area-chart {
    grid-column: 1 / 9;
    grid-row: 2;
  }

  .area-kpis {
    grid-column: 9 / -1;
    grid-row: 2;
    grid-template-columns: minmax(0, 1fr);
    grid-auto-rows: 1fr;
  }

  .area-concerns {
    grid-column: 1 / 7;
  }

  .area-tags {
    grid-column: 7 / -1;
  }

  .area-title h1 {
    font-size: var(--text-3xl);
  }

  .indicator {
    justify-content: center;
    padding: var(--space-md);
  }

  .indicator-value {
    font-size: 3.25rem;
  }
}

.stack {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.center {
  text-align: center;
}

.small {
  margin-top: var(--space-3xs);
  font-size: var(--text-sm);
}

.area-title {
  display: flex;
  flex-direction: column;
  gap: var(--space-3xs);
  padding: var(--space-3xs) var(--space-3xs) 0;
}

.area-title h1 {
  font-size: var(--text-2xl);
}

h2 {
  font-size: var(--text-lg);
}

.empty {
  padding: 56px 0;
}

.chart {
  margin-top: var(--space-xs);
}

.chart-note {
  margin-top: var(--space-xs);
}

.indicators {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-xs);
}

.indicator {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: var(--space-2xs);
  padding: 18px;
}

.indicator-label {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-muted);
}

.indicator-value {
  display: flex;
  align-items: baseline;
  gap: 2px;
  font-family: var(--font-display);
  font-size: var(--text-3xl);
  font-weight: 600;
  font-variation-settings: 'SOFT' 100;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  letter-spacing: -0.02em;
}

.indicator-value small {
  font-size: var(--text-md);
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
  gap: var(--space-xs);
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
  min-width: 0;
  font-weight: 550;
}

.ranking-count {
  flex-shrink: 0;
  font-size: var(--text-sm);
  font-variant-numeric: tabular-nums;
}
</style>
