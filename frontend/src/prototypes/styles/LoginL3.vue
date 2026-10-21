<script setup lang="ts">
// PROTOTYPE — Login L3 "Essayez tout de suite": a tiny mood picker to touch before even logging in
import { computed, ref } from 'vue'
import { MOOD_SCORES } from '@/constants/mood'

const FILL = ['#ffc9c9', '#ffd8a8', '#fff3bf', '#d3f9d8', '#c3fae8']
const REPLY = [
  'Courage. Votre réponse aidera à améliorer les choses.',
  "Merci de le dire, c'est comme ça que l'équipe progresse.",
  "Une journée comme une autre, et c'est bien de le noter.",
  'Plutôt bien, tant mieux !',
  'Super journée, on adore !',
]
const score = ref<number | null>(null)
const tint = computed(() => (score.value === null ? '#ffffff' : FILL[score.value - 1]))
</script>

<template>
  <div class="lb-screen">
    <div class="l3">
      <p class="lb-wordmark l3-word">Moodly</p>
      <section class="lb-tile l3-try" :style="{ background: tint }">
        <p class="l3-kicker">Essayez</p>
        <h1>Comment allez-vous aujourd'hui ?</h1>
        <div class="l3-faces">
          <button
            v-for="m in MOOD_SCORES"
            :key="m.score"
            :class="{ on: score === m.score }"
            :aria-label="m.label"
            @click="score = m.score"
          >
            {{ m.emoji }}
          </button>
        </div>
        <p class="l3-reply">
          <template v-if="score !== null"
            >{{ REPLY[score - 1] }} <b>Connectez-vous pour l'enregistrer, anonymement.</b></template
          >
          <template v-else>C'est tout ce qu'on vous demandera, une fois par jour.</template>
        </p>
      </section>
      <form class="lb-tile lb-form l3-form" @submit.prevent>
        <label class="lb-field"
          >Email professionnel<input class="lb-input" placeholder="prenom@entreprise.fr"
        /></label>
        <label class="lb-field">Mot de passe<input class="lb-input" type="password" /></label>
        <button class="lb-btn">Se connecter</button>
        <p class="lb-help">🔒 Votre manager ne voit que des moyennes d'équipe.</p>
      </form>
    </div>
  </div>
</template>

<style scoped>
.l3 {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.l3-word {
  padding: 4px 6px;
}
.l3-try {
  border: none;
  transition: background-color 0.4s;
}
.l3-kicker {
  margin: 0;
  font-size: 13px;
  font-weight: 900;
  color: #7048e8;
}
.l3-try h1 {
  margin: 4px 0 16px;
  font-size: 26px;
  font-weight: 900;
  line-height: 1.15;
}
.l3-faces {
  display: flex;
  justify-content: space-between;
  gap: 6px;
}
.l3-faces button {
  flex: 1;
  height: 64px;
  border: 3px solid rgba(0, 0, 0, 0.06);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.75);
  font-size: 30px;
  cursor: pointer;
  transition: transform 0.15s;
}
.l3-faces button.on {
  border-color: #212529;
  background: #fff;
  transform: translateY(-3px);
}
.l3-reply {
  min-height: 44px;
  margin: 14px 0 0;
  font-size: 15px;
  line-height: 1.4;
}

@container (min-width: 760px) {
  .l3 {
    display: grid;
    grid-template-columns: 1.25fr 1fr;
    gap: 18px 24px;
    max-width: 980px;
    margin: 30px auto 0;
  }
  .l3-word {
    grid-column: 1 / -1;
    font-size: 28px;
  }
  .l3-try {
    padding: 32px;
  }
  .l3-try h1 {
    font-size: 40px;
  }
  .l3-faces button {
    height: 86px;
    font-size: 42px;
  }
  .l3-form {
    align-self: start;
  }
}
</style>
