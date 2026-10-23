<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ApiError } from '@/api/client'
import { getTeamStats } from '@/api/stats'
import { getTeamWeather } from '@/api/weather'
import AppHeader from '@/components/AppHeader.vue'
import TeamMessageEditor from '@/components/TeamMessageEditor.vue'
import TeamWeather from '@/components/TeamWeather.vue'
import TeamMoodChart from '@/components/TeamMoodChart.vue'
import { moodSoftColor, tagLabel } from '@/constants/mood'
import type { TeamStats, TeamWeather as Weather } from '@/types/api'
import { alertMessage } from '@/utils/alerts'
import { emojiFor, formatAverage, formatPercent } from '@/utils/format'

/** Periods the manager can choose (the API accepts 7 to 90 days) */
const PERIODS = [7, 30, 90]

const days = ref(30)
const stats = ref<TeamStats | null>(null)
const loading = ref(true)
/** Reloading after a period change: the current figures stay on screen meanwhile */
const refreshing = ref(false)
const error = ref<string | null>(null)

/** No visible day at all: nothing to draw yet */
const isEmpty = computed(() => stats.value?.daily.every((day) => day.hidden) ?? true)

/** The average card takes the soft color of its mood level */
const averageTint = computed(() => {
  const average = stats.value?.summary.average
  return average == null ? 'var(--color-surface)' : moodSoftColor(Math.round(average))
})

/** Change of the average compared with the previous period, null if one of them is hidden */
const trend = computed(() => {
  const summary = stats.value?.summary
  if (summary?.average == null || summary.previousAverage == null) {
    return null
  }
  const change = Math.round((summary.average - summary.previousAverage) * 10) / 10
  const days = stats.value?.period.days
  const amount = `${formatAverage(Math.abs(change))} ${Math.abs(change) >= 2 ? 'points' : 'point'}`
  const previous = `par rapport aux ${days} jours précédents`
  if (change > 0) {
    return {
      tone: 'up',
      value: `▲ +${formatAverage(change)}`,
      label: `En hausse de ${amount} ${previous}`,
    }
  }
  if (change < 0) {
    return {
      tone: 'down',
      value: `▼ −${formatAverage(-change)}`,
      label: `En baisse de ${amount} ${previous}`,
    }
  }
  return { tone: 'flat', value: '= stable', label: `Stable ${previous}` }
})

const alerts = computed(() =>
  (stats.value?.summary.alerts ?? []).map((alert) => ({
    ...alertMessage(alert, stats.value?.period.days ?? 30),
    key: alert.type,
  })),
)

async function load() {
  if (stats.value) {
    refreshing.value = true
  } else {
    loading.value = true
  }
  error.value = null
  try {
    stats.value = await getTeamStats(days.value)
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : 'Une erreur est survenue.'
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

function selectPeriod(period: number) {
  if (period !== days.value) {
    days.value = period
    void load()
  }
}

/** Same weather as the employees see; the dashboard works without it */
const weather = ref<Weather | null>(null)

async function loadWeather() {
  try {
    weather.value = await getTeamWeather()
  } catch {
    weather.value = null
  }
}

onMounted(() => {
  void load()
  void loadWeather()
})
</script>

<template>
  <AppHeader wide />

  <main class="page dashboard">
    <p v-if="loading" class="muted center" role="status">Chargement des statistiques…</p>

    <section v-else-if="error" class="card stack reveal">
      <p class="alert" role="alert">{{ error }}</p>
      <button type="button" class="button button-secondary" @click="load">Réessayer</button>
    </section>

    <div v-else-if="stats" class="dashboard-grid" :class="{ refreshing }" :aria-busy="refreshing">
      <header class="area-title reveal">
        <div>
          <h1>{{ stats.team.name }}</h1>
          <p class="muted">
            {{ stats.team.employeeCount }} employés · {{ stats.period.days }} derniers jours
          </p>
          <TeamWeather v-if="weather" :weather="weather" compact class="title-weather" />
        </div>
        <div class="period" role="radiogroup" aria-label="Période affichée">
          <button
            v-for="period in PERIODS"
            :key="period"
            type="button"
            role="radio"
            class="period-option"
            :class="{ active: days === period }"
            :aria-checked="days === period"
            :disabled="refreshing"
            @click="selectPeriod(period)"
          >
            {{ period }} j
          </button>
        </div>
      </header>

      <section class="area-alerts card reveal" style="--order: 1" aria-labelledby="alerts-title">
        <h2 id="alerts-title"><span class="emoji" aria-hidden="true">🧭</span> À surveiller</h2>
        <ul v-if="alerts.length" class="alerts">
          <li
            v-for="alert in alerts"
            :key="alert.key"
            class="alert-item"
            :class="`tone-${alert.tone}`"
          >
            <span class="emoji alert-emoji" aria-hidden="true">{{ alert.emoji }}</span>
            <span>{{ alert.text }}</span>
          </li>
        </ul>
        <p v-else class="muted">Rien de particulier à signaler sur la période.</p>
      </section>

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
          <p v-if="trend" class="indicator-trend" :class="`trend-${trend.tone}`">
            <span class="trend-text" aria-hidden="true"
              ><strong>{{ trend.value }}</strong>
              <span class="trend-period">vs {{ stats.period.days }} j avant</span></span
            >
            <span class="sr-only">{{ trend.label }}</span>
          </p>
        </div>

        <div class="card indicator indicator-mint">
          <p class="indicator-label">Taux de participation</p>
          <p class="indicator-value">{{ formatPercent(stats.summary.participationRate) }}</p>
        </div>
      </section>

      <section class="area-chart card reveal" style="--order: 2">
        <h2><span class="emoji" aria-hidden="true">📈</span> L’humeur, jour par jour</h2>
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
          <h2><span class="emoji" aria-hidden="true">😟</span> Principales préoccupations</h2>
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
          <h2><span class="emoji" aria-hidden="true">💬</span> Thèmes les plus cités</h2>
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

      <TeamMessageEditor class="area-message card reveal" style="--order: 5" />
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

  .area-title,
  .area-alerts,
  .area-message {
    grid-column: 1 / -1;
  }

  .area-chart {
    grid-column: 1 / 9;
    grid-row: 3;
  }

  /* Same specificity as the base rules below would lose: stacked tiles beside the chart */
  .indicators.area-kpis {
    grid-column: 9 / -1;
    grid-row: 3;
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

  .card.indicator {
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
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-xs);
  padding: var(--space-3xs) var(--space-3xs) 0;
}

.title-weather {
  margin-top: var(--space-2xs);
}

/* Period switch: three segments in a rounded track */
.period {
  display: flex;
  gap: var(--space-3xs);
  padding: var(--space-3xs);
  border-radius: var(--radius-small);
  background: var(--color-surface);
  border: var(--border-width) solid var(--color-border);
}

.period-option {
  min-width: 56px;
  min-height: var(--tap-size);
  padding: 0 var(--space-xs);
  border: none;
  border-radius: 12px;
  background: transparent;
  color: var(--color-text-soft);
  font-weight: 800;
  cursor: pointer;
}

.period-option.active {
  background: var(--color-primary);
  color: var(--color-on-primary);
}

.refreshing {
  opacity: 0.6;
  transition: opacity var(--dur-short) var(--ease-out);
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

/* Key figures: colored tiles without border */
.indicator {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: var(--space-2xs);
  min-height: 124px;
  padding: 18px;
  border: none;
}

.indicator-mint {
  background: var(--tile-mint);
}

.indicator-label {
  font-size: var(--text-sm);
  font-weight: 800;
  color: var(--color-text-soft);
}

.indicator-value {
  display: flex;
  align-items: baseline;
  gap: 2px;
  font-family: var(--font-display);
  font-size: var(--text-3xl);
  font-weight: 900;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  letter-spacing: -0.02em;
}

.indicator-value small {
  font-size: var(--text-md);
  color: var(--color-text-soft);
}

.indicator-emoji {
  margin-left: auto;
  font-size: 1.6rem;
}

/* Hidden on screen, read by screen readers */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

.indicator-trend {
  align-self: flex-start;
  padding: 2px 10px;
  border-radius: var(--radius-pill);
  background: var(--color-surface);
  font-size: var(--text-sm);
  font-weight: 800;
}

/* On a narrow screen, the pill wraps between the value and the period */
.trend-text {
  display: flex;
  flex-wrap: wrap;
  column-gap: 0.3em;
}

.indicator-trend strong,
.trend-period {
  white-space: nowrap;
}

.trend-period {
  font-weight: 700;
}

.trend-up {
  color: var(--color-success);
}

.trend-down {
  color: var(--color-danger);
}

.trend-flat {
  color: var(--color-text-soft);
}

/* "À surveiller": one short fact per line, tinted by tone */
.alerts {
  display: flex;
  flex-direction: column;
  gap: var(--space-2xs);
  margin: var(--space-xs) 0 0;
  padding: 0;
  list-style: none;
}

.alert-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-small);
  font-weight: 700;
}

.alert-emoji {
  flex-shrink: 0;
}

.tone-warning {
  background: var(--mood-2-soft);
}

.tone-info {
  background: var(--tile-lilac);
}

.tone-positive {
  background: var(--mood-4-soft);
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
  border-top: 2px solid var(--color-border);
}

.ranking li:first-child {
  border-top: none;
}

.ranking-position {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: var(--tile-lilac);
  font-family: var(--font-display);
  font-weight: 900;
  color: var(--color-primary-edge);
}

.ranking-concerns .ranking-position {
  background: var(--mood-1-soft);
  color: var(--color-danger);
}

.ranking-label {
  flex: 1;
  min-width: 0;
  font-weight: 800;
}

.ranking-count {
  flex-shrink: 0;
  font-size: var(--text-sm);
  font-variant-numeric: tabular-nums;
}
</style>
