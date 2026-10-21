<script setup lang="ts">
// PROTOTYPE — Login L2 "Comment ça marche": the 3 steps of Moodly as illustrated tiles, then the form
</script>

<template>
  <div class="lb-screen">
    <div class="l2">
      <header class="l2-head">
        <p class="lb-wordmark">Moodly</p>
        <h1>Le moral de l'équipe, sans surveiller personne.</h1>
      </header>
      <ol class="l2-steps">
        <li class="lb-tile l2-step l2-yellow">
          <span class="l2-num">1</span>
          <div class="l2-art">😄 🙂 😐</div>
          <p>Chaque jour, touchez l'émoji qui vous ressemble.</p>
        </li>
        <li class="lb-tile l2-step l2-mint">
          <span class="l2-num">2</span>
          <div class="l2-art l2-chips"><span>Charge de travail</span><span>Ambiance</span></div>
          <p>Ajoutez, si vous le souhaitez, ce qui joue sur votre humeur.</p>
        </li>
        <li class="lb-tile l2-step l2-lilac">
          <span class="l2-num">3</span>
          <div class="l2-art">📊 🔒</div>
          <p>Votre manager voit une moyenne d'équipe. <b>Jamais votre nom.</b></p>
        </li>
      </ol>
      <form class="lb-tile lb-form l2-form" @submit.prevent>
        <h2>C'est parti</h2>
        <label class="lb-field"
          >Email professionnel<input class="lb-input" placeholder="prenom@entreprise.fr"
        /></label>
        <label class="lb-field">Mot de passe<input class="lb-input" type="password" /></label>
        <button class="lb-btn">Se connecter</button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.l2 {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.l2-head {
  padding: 6px 6px 4px;
}
.l2-head h1 {
  margin: 6px 0 0;
  font-size: 27px;
  font-weight: 900;
  line-height: 1.15;
}
.l2-steps {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.l2-step {
  position: relative;
  display: grid;
  grid-template-columns: 92px 1fr;
  align-items: center;
  gap: 12px;
  padding: 14px 16px 14px 14px;
  border: none;
}
.l2-step p {
  margin: 0;
  font-size: 15px;
  line-height: 1.35;
}
.l2-num {
  position: absolute;
  top: 10px;
  right: 14px;
  font-size: 13px;
  font-weight: 900;
  color: rgba(0, 0, 0, 0.35);
}
.l2-art {
  display: grid;
  place-items: center;
  height: 64px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.7);
  font-size: 22px;
}
.l2-chips {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 10px;
}
.l2-chips span {
  padding: 3px 8px;
  border-radius: 8px;
  background: #7048e8;
  color: #fff;
}
.l2-yellow {
  background: #ffec99;
}
.l2-mint {
  background: #b2f2bb;
}
.l2-lilac {
  background: #e5dbff;
}

@container (min-width: 760px) {
  .l2 {
    display: grid;
    grid-template-columns: 1.3fr 1fr;
    gap: 18px 24px;
    max-width: 980px;
    margin: 40px auto 0;
  }
  .l2-head {
    grid-column: 1 / -1;
  }
  .l2-head h1 {
    max-width: 640px;
    font-size: 44px;
  }
  .l2-steps {
    grid-column: 1;
  }
  .l2-form {
    grid-column: 2;
    align-self: start;
  }
}
</style>
