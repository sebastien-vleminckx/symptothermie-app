# 📋 Brief Projet — Symptothermie

## Infos générales
- **Repo GitHub :** sebastien-vleminckx/symptothermie-app
- **Canal Discord :** #symptothermie (ID: 1496591917318668420)
- **Dernier push :** 2025-04-16

## Stack technique
### Frontend (`/frontend`)
- **Framework :** React + Vite
- **Routing :** React Router DOM
- **Charts :** Recharts
- **HTTP :** Axios
- **Dates :** date-fns

### API (`/api`)
- **Runtime :** Node.js + Express
- **Auth :** JWT + bcryptjs
- **Base de données :** Supabase (`@supabase/supabase-js`)
- **CORS :** configuré

### Déploiement
- **Vercel :** monorepo (vercel.json à la racine)
- **Build :** `npm run build` (concurrently frontend + api)

## Branches
- `main` → production
- `develop` → intégration (à créer)
- `feature/*` → développement

## CI/CD
- `.github/workflows/ci.yml` → lint + build frontend & api
- Notification Discord → #ci-status

## Conventions
- Branches : `feature/nom-court`, `fix/nom-court`, `chore/nom-court`
- Commits : conventionnal commits (`feat:`, `fix:`, `chore:`, `docs:`)
- PRs : toujours vers `develop`, jamais directement vers `main`

## Notes agent
<!-- L'agent met à jour cette section automatiquement -->
