<script setup lang="ts">
import { computed } from 'vue'
import { WEATHER } from '@/constants/weather'
import type { TeamWeather } from '@/types/api'

const props = defineProps<{
  weather: TeamWeather
  /** One-line version, for the dashboard header */
  compact?: boolean
}>()

const info = computed(() => (props.weather.weather ? WEATHER[props.weather.weather] : null))
</script>

<template>
  <p v-if="compact" class="weather-pill" :style="{ background: info?.tile }">
    <template v-if="info">
      <span class="emoji" aria-hidden="true">{{ info.emoji }}</span>
      <span>
        <strong>{{ info.label }}</strong> · météo des 7 derniers jours
      </span>
    </template>
    <span v-else class="muted">Météo : pas assez de réponses cette semaine</span>
  </p>

  <section
    v-else
    class="weather"
    :style="{ background: info?.tile ?? 'var(--color-surface)' }"
    aria-labelledby="weather-title"
  >
    <span v-if="info" class="weather-emoji emoji" aria-hidden="true">{{ info.emoji }}</span>
    <div class="weather-text">
      <h2 id="weather-title">La météo de l’équipe</h2>
      <template v-if="info">
        <p class="weather-label">{{ info.label }}</p>
        <p>{{ info.text }}</p>
      </template>
      <p v-else>Pas encore assez de réponses cette semaine pour afficher la météo.</p>
      <p class="weather-note">7 derniers jours, sans votre réponse du jour</p>
    </div>
  </section>
</template>

<style scoped>
.weather {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm);
  border-radius: var(--radius);
}

.weather-emoji {
  flex-shrink: 0;
  font-size: 3.5rem;
  line-height: 1;
  animation: float 4s ease-in-out infinite;
}

.weather-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.weather h2 {
  font-size: var(--text-sm);
  font-weight: 800;
  color: var(--color-text-soft);
}

.weather-label {
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: 900;
}

.weather-note {
  margin-top: var(--space-3xs);
  font-size: var(--text-sm);
  color: var(--color-text-soft);
}

.weather-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: var(--radius-pill);
  background: var(--color-surface);
  font-size: var(--text-sm);
}

/* Gentle float; turned off with prefers-reduced-motion in assets/main.css */
@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-6px);
  }
}
</style>
