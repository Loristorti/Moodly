<script setup lang="ts">
// PROTOTYPE: one screen at a fixed size (phone by default), so screens sit side by side
withDefaults(defineProps<{ label: string; width?: number; height?: number }>(), {
  width: 390,
  height: 780,
})
</script>

<template>
  <section class="column" :style="{ flexBasis: `${width}px`, width: `${width}px` }">
    <p class="column-label">{{ label }}</p>
    <div class="column-screen" :style="{ height: `${height}px` }">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.column {
  flex-grow: 0;
  flex-shrink: 0;
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
  overflow: hidden auto;
  border-radius: 18px;
  box-shadow:
    0 0 0 1px rgb(0 0 0 / 8%),
    0 18px 40px -20px rgb(0 0 0 / 35%);
}
</style>
