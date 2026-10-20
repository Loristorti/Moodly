# Moodly

Application mobile de suivi du moral des salariés, dans une démarche RSE.

- Les **employés** renseignent leur humeur du jour en quelques secondes.
- Les **managers** consultent l'humeur moyenne de leur équipe sur les 30 derniers jours.
- Les réponses sont **anonymes par conception** : un manager ne voit que des moyennes d'équipe.

> Projet en cours de développement. Ce README sera complété au fil des étapes.

## Stack

| Couche | Technologie |
|---|---|
| Front | Vue 3, TypeScript, Vite, Pinia, Chart.js |
| Mobile | Capacitor (Android) |
| Back | NestJS, TypeScript, Prisma |
| Base de données | PostgreSQL (Docker Compose) |

## Structure

```
backend/    API NestJS
frontend/   application Vue 3 + Capacitor
docs/       tutoriel utilisateur, note RGPD et éthique
docker/     scripts d'initialisation de PostgreSQL
```

## Démarrer la base de données

Prérequis : Docker Desktop.

```bash
docker compose up -d
```

Cela lance PostgreSQL sur `localhost:5432` (utilisateur `moodly`, mot de passe `moodly`) avec deux bases :

- `moodly` : base de développement ;
- `moodly_test` : base utilisée par les tests e2e.

La base `moodly_test` est créée par `docker/init.sql`, qui ne s'exécute qu'au **premier** démarrage. Pour repartir de zéro :

```bash
docker compose down -v
docker compose up -d
```

## Lancer le back

Prérequis : Node.js 22 LTS ou plus récent, et la base de données démarrée (voir ci-dessus).

```bash
cd backend
cp .env.example .env        # puis remplacer JWT_SECRET par une longue chaîne aléatoire
npm install                 # génère aussi le client Prisma
npx prisma migrate dev      # crée les tables
npm run seed                # remplit la base avec les données de démo
npm run start:dev           # http://localhost:3000/api
```

Vérification : `http://localhost:3000/api/health` doit répondre `{"status":"ok"}`.

Documentation de l'API (Swagger) : `http://localhost:3000/api/docs`.

### Tests e2e

Les tests e2e utilisent la base `moodly_test`, qui est vidée puis remplie à chaque lancement :

```bash
cp .env.test.example .env.test
npm run test:e2e
```

| Commande | Rôle |
|---|---|
| `npm run build` | compile le projet |
| `npm run lint` | vérifie le code (oxlint) |
| `npm test` | tests unitaires (Vitest) |
| `npm run test:e2e` | tests de bout en bout |
| `npm run seed` | vide puis remplit la base de démo |

## Comptes de test

Créés par `npm run seed`. Mot de passe commun : **`Moodly2026!`**

| Email | Rôle | Équipe |
|---|---|---|
| `manager.produit@moodly.dev` | Manager | Équipe Produit |
| `manager.support@moodly.dev` | Manager | Équipe Support |
| `alice@moodly.dev` | Employée | Équipe Produit (n'a pas encore répondu aujourd'hui : idéale pour la démo) |
| `thomas`, `camille`, `hugo`, `lea`, `julien` `@moodly.dev` | Employés | Équipe Produit |
| `sarah`, `lucas`, `emma`, `nicolas`, `chloe`, `maxime` `@moodly.dev` | Employés | Équipe Support |

Les données couvrent les 30 derniers jours ouvrés (aujourd'hui exclu) :

- une **semaine « rush »** en milieu de période, avec une baisse nette du moral et le tag « Charge de travail » très présent, puis une remontée ;
- deux jours avec moins de 3 réponses pour l'Équipe Support, **masqués** dans le graphe pour protéger l'anonymat.
