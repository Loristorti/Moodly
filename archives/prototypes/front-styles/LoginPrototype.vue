<script setup lang="ts">
// PROTOTYPE (throwaway): four login pages in style F, each shown on a phone and on a desktop,
// switchable with ?variant=L1..L4 or the floating bar.
import '@fontsource-variable/nunito'
import './login-base.css'
import { computed, type Component } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import LoginL1 from './LoginL1.vue'
import LoginL2 from './LoginL2.vue'
import LoginL3 from './LoginL3.vue'
import LoginL4 from './LoginL4.vue'
import PrototypeSwitcher from './PrototypeSwitcher.vue'
import ScreenColumn from './ScreenColumn.vue'

const variants: { key: string; name: string; pitch: string; component: Component }[] = [
  {
    key: 'L1',
    name: 'Bienvenue animée',
    pitch:
      'Une grande tuile violette où flottent les humeurs, et 3 chiffres qui disent tout : 10 s, 1 fois par jour, 100 % anonyme.',
    component: LoginL1,
  },
  {
    key: 'L2',
    name: 'Comment ça marche',
    pitch:
      "Les 3 étapes de Moodly en tuiles illustrées : on comprend l'app avant même de se connecter.",
    component: LoginL2,
  },
  {
    key: 'L3',
    name: 'Essayez tout de suite',
    pitch:
      'Une mini-saisie à toucher directement : la page change de couleur et répond. Impact immédiat.',
    component: LoginL3,
  },
  {
    key: 'L4',
    name: 'Ce que voit votre manager',
    pitch: "La promesse d'anonymat en image : ce que le manager voit, et ce qu'il ne voit jamais.",
    component: LoginL4,
  },
]

const route = useRoute()
const router = useRouter()
const current = computed(() => variants.find((v) => v.key === route.query.variant) ?? variants[0]!)

function select(key: string) {
  void router.replace({ query: { variant: key } })
}
</script>

<template>
  <div class="proto">
    <header class="proto-head">
      <p class="proto-tag">Prototype connexion · {{ current.key }} / {{ variants.length }}</p>
      <h1>{{ current.name }}</h1>
      <p>{{ current.pitch }}</p>
      <p class="proto-help">
        ← → pour changer de version · sur téléphone à gauche, sur ordinateur à droite
      </p>
    </header>
    <div class="proto-row">
      <ScreenColumn label="Téléphone">
        <component :is="current.component" :key="`m-${current.key}`" />
      </ScreenColumn>
      <ScreenColumn label="Ordinateur" :width="1040" :height="680">
        <component :is="current.component" :key="`d-${current.key}`" />
      </ScreenColumn>
    </div>
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
.proto-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: flex-start;
  gap: 32px;
}
</style>
