<script setup lang="ts">
// PROTOTYPE: one screen shown at phone width, so the 3 screens sit side by side
defineProps<{ label: string }>()
</script>

<template>
  <section class="column">
    <p class="column-label">{{ label }}</p>
    <div class="column-screen">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.column {
  flex: 0 0 390px;
  max-width: 100%;
}

.column-label {
  margin: 0 0 8px 4px;
  font:
    600 13px/1 system-ui,
    sans-serif;
  color: #555555;
}

.column-screen {
  position: relative;
  height: 780px;
  overflow: hidden auto;
  border-radius: 18px;
  box-shadow:
    0 0 0 1px rgb(0 0 0 / 8%),
    0 18px 40px -20px rgb(0 0 0 / 35%);
}
</style>
