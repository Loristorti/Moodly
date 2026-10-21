<script setup lang="ts">
// PROTOTYPE — Login L4 "Ce que voit votre manager": the anonymity promise shown as a picture
</script>

<template>
  <div class="lb-screen">
    <div class="l4">
      <section class="l4-promise">
        <p class="l4-word">Moodly</p>
        <h1>Anonyme par conception.</h1>
        <div class="l4-pair">
          <div class="lb-tile l4-sees">
            <p class="l4-label">Ce que voit votre manager</p>
            <p class="l4-stat"><b>3,4</b> /5 🙂</p>
            <p class="l4-small">Moyenne de l'équipe</p>
            <p class="l4-chip">Charge de travail</p>
            <p class="l4-small">Thème le plus cité</p>
          </div>
          <div class="lb-tile l4-never">
            <p class="l4-label">Ce qu'il ne voit jamais</p>
            <p class="l4-no">✕ Votre nom</p>
            <p class="l4-no">✕ Votre réponse</p>
            <p class="l4-no">✕ L'heure à laquelle vous répondez</p>
            <p class="l4-no">✕ Un jour avec moins de 3 réponses</p>
          </div>
        </div>
      </section>
      <form class="lb-tile lb-form l4-form" @submit.prevent>
        <h2>Connexion</h2>
        <label class="lb-field"
          >Email professionnel<input class="lb-input" placeholder="prenom@entreprise.fr"
        /></label>
        <label class="lb-field">Mot de passe<input class="lb-input" type="password" /></label>
        <button class="lb-btn">Se connecter</button>
        <p class="lb-help">Votre humeur du jour, en 10 secondes.</p>
      </form>
    </div>
  </div>
</template>

<style scoped>
.l4 {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.l4-promise {
  padding: 20px 16px 16px;
  border-radius: 26px;
  background: #7048e8;
  color: #fff;
}
.l4-word {
  margin: 0;
  font-size: 20px;
  font-weight: 900;
  opacity: 0.85;
}
.l4-promise h1 {
  margin: 6px 0 16px;
  font-size: 30px;
  font-weight: 900;
  line-height: 1.1;
}
.l4-pair {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}
.l4-pair .lb-tile {
  padding: 14px;
  border: none;
  color: #212529;
}
.l4-sees {
  background: #d3f9d8;
}
.l4-never {
  background: #ffe3e3;
}
.l4-label {
  margin: 0 0 10px;
  font-size: 12px;
  font-weight: 900;
  line-height: 1.2;
}
.l4-stat {
  margin: 0;
  font-size: 15px;
}
.l4-stat b {
  font-size: 30px;
  font-weight: 900;
}
.l4-small {
  margin: 0 0 10px;
  font-size: 11px;
  color: #495057;
}
.l4-chip {
  display: inline-block;
  margin: 0;
  padding: 4px 8px;
  border-radius: 8px;
  background: #fff;
  font-size: 12px;
}
.l4-no {
  margin: 0 0 8px;
  font-size: 13px;
  color: #c92a2a;
}

@container (min-width: 760px) {
  .l4 {
    display: grid;
    grid-template-columns: 1.4fr 1fr;
    gap: 24px;
    align-items: center;
    max-width: 980px;
    margin: 30px auto 0;
  }
  .l4-promise {
    padding: 32px;
  }
  .l4-promise h1 {
    font-size: 46px;
  }
  .l4-pair {
    gap: 14px;
  }
  .l4-pair .lb-tile {
    padding: 20px;
  }
  .l4-stat b {
    font-size: 42px;
  }
  .l4-no {
    font-size: 15px;
  }
}
</style>
