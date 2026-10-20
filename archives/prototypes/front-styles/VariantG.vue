<script setup lang="ts">
// PROTOTYPE — Style G: playful screens for employees (C), calm bento dashboard for managers (E)
import type { TeamStats } from '@/types/api'
import VariantC from './VariantC.vue'
import VariantE from './VariantE.vue'

defineProps<{ stats: TeamStats }>()
</script>

<template>
  <div class="row">
    <VariantC :stats="stats" :only="['login', 'mood']" />
    <VariantE :stats="stats" :only="['dashboard']" />
  </div>
</template>

<style scoped>
.row {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 32px;
}
</style>
