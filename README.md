# Symptothermie App

Application web de suivi symptothermique pour contraception naturelle.

## Architecture

Monorepo avec :
- **Frontend** : React + Vite + Tailwind CSS (`/frontend`)
- **Backend** : Express.js serverless API (`/api`)
- **Database** : PostgreSQL via Supabase

## Déploiement

### Vercel (Frontend + Backend)

1. Connecter le repo à Vercel
2. Variables d'environnement :
   ```
   JWT_SECRET=your-secret-key
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_KEY=your-service-key
   ```

### Supabase (Database)

Exécuter `database/schema.sql` dans l'éditeur SQL Supabase.

## Développement local

```bash
# Frontend
cd frontend && npm install && npm run dev

# Backend
cd api && npm install && npm run dev
```

## API Endpoints

- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/entries` - Liste des entrées
- `POST /api/entries` - Créer une entrée
- `GET /api/cycles` - Liste des cycles
- `GET /api/health` - Health check
