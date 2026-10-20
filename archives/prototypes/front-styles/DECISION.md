# Prototype : style visuel du front

Prototype jetable, archivé ici après la décision. Il n'est plus branché dans l'application.

## La question

L'ambiance du premier design (fond papier beige, vert forêt, police à empattements) ne convenait pas. Quel style visuel adopter pour les trois écrans (connexion, saisie de l'humeur, tableau de bord manager) ?

## Ce qui a été comparé

| Variante | Style |
|---|---|
| A | Clair et pro : blanc, bleu cobalt, humeurs en liste |
| B | Nuit : fond sombre, curseur pour choisir l'humeur |
| C | Ludique : couleurs franches, grosses bulles, boutons épais |
| D | Une question à la fois : grande typographie, saisie en 2 étapes |
| E | Bento : tout en tuiles arrondies |
| F | Bento ludique : les tuiles de E avec la personnalité de C |
| G | C pour les employés, E pour le manager |

Puis quatre pages de connexion dans le style F : L1 (bienvenue animée), L2 (comment ça marche), L3 (essayez tout de suite), L4 (ce que voit votre manager).

## La décision

- **Style F, « Bento ludique »**, pour toute l'application : fond crème, tuiles arrondies, couleurs pastel par niveau d'humeur, police Nunito, bouton principal violet en relief.
- **Connexion L1** : grande tuile violette avec les humeurs qui flottent, trois tuiles « 10 s », « 1 × par jour », « 100 % anonyme », puis le formulaire.
- Ton : **vouvoiement**, plus adapté au contexte de l'entreprise.

Les variantes C et E ont été préférées pour leur côté chaleureux et lisible ; F les combine.

## Pour revoir le prototype

Les fichiers sont conservés tels quels. Pour les relancer, il faudrait les recopier dans `frontend/src/`, réinstaller leurs polices (`@fontsource-variable/plus-jakarta-sans`, `sora`, `nunito`, `onest`, `outfit`, `@fontsource/instrument-serif`) et rajouter leurs routes `/prototype/styles` et `/prototype/login`.
