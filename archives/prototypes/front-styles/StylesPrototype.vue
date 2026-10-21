<script setup lang="ts">
// PROTOTYPE (throwaway): five visual directions for the 3 screens, side by side,
// switchable with ?variant=A..E or the floating bar. Demo data from api/mock.ts, no API call.
import { computed, onMounted, ref, type Component } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { mock } from '@/api/mock'
import type { TeamStats } from '@/types/api'
import PrototypeSwitcher from './PrototypeSwitcher.vue'
import VariantA from './VariantA.vue'
import VariantB from './VariantB.vue'
import VariantC from './VariantC.vue'
import VariantD from './VariantD.vue'
import VariantE from './VariantE.vue'
import VariantF from './VariantF.vue'
import VariantG from './VariantG.vue'

const variants: { key: string; name: string; pitch: string; component: Component }[] = [
  {
    key: 'A',
    name: 'Clair & pro',
    pitch:
      'Fond blanc, bleu cobalt, humeurs en liste, indicateurs en bandeau. Sobre, façon outil de travail (Notion, Linear).',
    component: VariantA,
  },
  {
    key: 'B',
    name: 'Nuit',
    pitch:
      'Fond sombre, pastels lumineux, un grand émoji et un curseur pour choisir. Calme et premium.',
    component: VariantB,
  },
  {
    key: 'C',
    name: 'Ludique',
    pitch:
      'Couleurs franches, grosses bulles, boutons épais, ton tutoyé. Chaleureux, façon Duolingo / Headspace.',
    component: VariantC,
  },
  {
    key: 'D',
    name: 'Une question à la fois',
    pitch:
      'Très grande typographie, saisie en 2 étapes, dashboard qui commence par une phrase. Éditorial, façon Typeform.',
    component: VariantD,
  },
  {
    key: 'E',
    name: 'Bento',
    pitch: 'Tout en tuiles arrondies de tailles différentes. Moderne, façon widgets iPhone.',
    component: VariantE,
  },
  {
    key: 'F',
    name: 'Bento ludique (C + E)',
    pitch:
      'La mise en page en tuiles du E, avec les couleurs, la police ronde et les boutons épais du C, sur les 3 écrans.',
    component: VariantF,
  },
  {
    key: 'G',
    name: 'Ludique + bento (C pour les employés, E pour le manager)',
    pitch:
      'Connexion et saisie ludiques du C pour le quotidien des employés, dashboard bento plus posé du E pour le manager.',
    component: VariantG,
  },
]

const route = useRoute()
const router = useRouter()
const current = computed(() => variants.find((v) => v.key === route.query.variant) ?? variants[0]!)
const stats = ref<TeamStats | null>(null)

function select(key: string) {
  void router.replace({ query: { variant: key } })
}

onMounted(async () => {
  stats.value = await mock.getTeamStats(30)
})
</script>

<template>
  <div class="proto">
    <header class="proto-head">
      <p class="proto-tag">Prototype · style {{ current.key }} / {{ variants.length }}</p>
      <h1>{{ current.name }}</h1>
      <p>{{ current.pitch }}</p>
      <p class="proto-help">
        ← → pour changer de style · les écrans sont cliquables (données de démo)
      </p>
    </header>
    <component :is="current.component" v-if="stats" :key="current.key" :stats="stats" />
    <PrototypeSwitcher
      :variants="variants.map(({ key, name }) => ({ key, name }))"
      :current="current.key"
      @change="select"
    />
  </div>
</template>

<style scoped>
.proto {
  min-height: 100vh;
  padding: 28px 16px 110px;
  background: #e6e6ea;
  font-family: system-ui, sans-serif;
}

.proto-head {
  max-width: 760px;
  margin: 0 auto 28px;
  text-align: center;
  color: #222222;
}

.proto-head h1 {
  margin: 4px 0 8px;
  font:
    700 30px/1.1 system-ui,
    sans-serif;
}

.proto-head p {
  margin: 0;
}

.proto-tag {
  font-size: 13px;
  font-weight: 700;
  color: #666666;
}

.proto-help {
  margin-top: 8px !important;
  font-size: 13px;
  color: #777777;
}
</style>
