<script setup lang="ts">
// PROTOTYPE — Login L1 "Bienvenue animée": big hero tile with floating moods + 3 fact tiles
import { MOOD_SCORES } from '@/constants/mood'
</script>

<template>
  <div class="lb-screen">
    <div class="l1">
      <div class="lb-tile l1-hero">
        <span v-for="(m, i) in MOOD_SCORES" :key="m.score" class="l1-float" :style="{ '--i': i }">{{
          m.emoji
        }}</span>
        <p class="l1-word">Moodly</p>
        <p class="l1-tag">Votre humeur du jour, en 10 secondes.</p>
      </div>
      <div class="lb-tile l1-fact l1-yellow"><b>10 s</b><small>pour répondre</small></div>
      <div class="lb-tile l1-fact l1-mint"><b>1 ×</b><small>par jour</small></div>
      <div class="lb-tile l1-fact l1-pink"><b>100 %</b><small>anonyme</small></div>
      <form class="lb-tile lb-form l1-form" @submit.prevent>
        <h2>Connexion</h2>
        <label class="lb-field"
          >Email professionnel<input class="lb-input" placeholder="prenom@entreprise.fr"
        /></label>
        <label class="lb-field">Mot de passe<input class="lb-input" type="password" /></label>
        <button class="lb-btn">Se connecter</button>
        <p class="lb-help">Pas de compte ? Il est fourni par votre employeur.</p>
      </form>
    </div>
  </div>
</template>

<style scoped>
.l1 {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 10px;
}
.l1-hero {
  position: relative;
  grid-column: span 6;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  height: 260px;
  overflow: hidden;
  border: none;
  background: linear-gradient(160deg, #845ef7, #7048e8 60%, #5f3dc4);
  color: #fff;
}
.l1-float {
  position: absolute;
  top: calc(18px + var(--i) * 4%);
  left: calc(6% + var(--i) * 18%);
  font-size: 40px;
  animation: float 3.6s ease-in-out infinite;
  animation-delay: calc(var(--i) * -0.7s);
}
.l1-float:nth-child(even) {
  top: 70px;
  font-size: 32px;
}
.l1-word {
  position: relative;
  margin: 0;
  font-size: 46px;
  font-weight: 900;
  letter-spacing: -0.03em;
  line-height: 1;
}
.l1-tag {
  position: relative;
  margin: 6px 0 0;
  font-size: 17px;
  opacity: 0.92;
}
.l1-fact {
  grid-column: span 2;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  height: 96px;
  padding: 14px;
  border: none;
}
.l1-fact b {
  font-size: 26px;
  font-weight: 900;
  line-height: 1;
}
.l1-fact small {
  margin-top: 4px;
  font-size: 12px;
  font-weight: 800;
  color: #495057;
}
.l1-yellow {
  background: #ffec99;
}
.l1-mint {
  background: #b2f2bb;
}
.l1-pink {
  background: #ffc9c9;
}
.l1-form {
  grid-column: span 6;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0) rotate(-6deg);
  }
  50% {
    transform: translateY(-12px) rotate(6deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .l1-float {
    animation: none;
  }
}

@container (min-width: 760px) {
  .l1 {
    grid-template-columns: repeat(12, minmax(0, 1fr));
    grid-auto-rows: auto;
    gap: 14px;
    max-width: 980px;
    margin: 40px auto 0;
  }
  .l1-hero {
    grid-column: 1 / 8;
    grid-row: 1 / 3;
    height: auto;
    min-height: 420px;
    padding: 32px;
  }
  .l1-word {
    font-size: 72px;
  }
  .l1-tag {
    font-size: 22px;
  }
  .l1-float {
    font-size: 60px;
  }
  .l1-float:nth-child(even) {
    top: 120px;
    font-size: 48px;
  }
  .l1-form {
    grid-column: 8 / 13;
    grid-row: 1 / 3;
    justify-content: center;
  }
  .l1-fact {
    grid-column: span 4;
    height: 110px;
  }
}
</style>
