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
