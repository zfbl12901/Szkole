# Guide de démarrage - Szkole

## 🚀 Installation complète

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# Modifiez .env si nécessaire
npm run dev
```

Le backend sera accessible sur `http://localhost:3000`

### 2. Frontend

```bash
cd szkole
npm install
npm start
```

Le frontend sera accessible sur `http://localhost:4200`

## 🔧 Configuration

### Backend (.env)

```env
PORT=3000
FRONTEND_URL=http://localhost:4200
DATABASE_PATH=./data/articles.db
NODE_ENV=development
```

### Frontend (environment.prod.ts)

Avant de déployer en production, modifiez `szkole/src/environments/environment.prod.ts` avec l'URL de votre backend déployé :

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://votre-backend.railway.app/api'
};
```

## 🚢 Déploiement

### Backend sur Railway

1. Créez un compte sur [Railway](https://railway.app)
2. Nouveau projet > Deploy from GitHub repo
3. Sélectionnez votre dépôt
4. Railway détectera automatiquement le dossier `backend/`
5. Ajoutez les variables d'environnement :
   - `FRONTEND_URL` : URL de votre frontend déployé
   - `NODE_ENV` : `production`
   - `DATABASE_PATH` : `/tmp/data/articles.db` (ou un volume persistant)

### Backend sur Render

1. Créez un compte sur [Render](https://render.com)
2. New > Web Service
3. Connectez votre dépôt GitHub
4. Configuration :
   - Build Command : `cd backend && npm install`
   - Start Command : `cd backend && npm start`
5. Ajoutez les variables d'environnement

### Frontend

Le frontend se déploie automatiquement sur GitHub Pages via GitHub Actions.

**Important** : Après avoir déployé le backend, mettez à jour `szkole/src/environments/environment.prod.ts` avec l'URL de votre backend.

## ✅ Vérification

1. Backend : `http://localhost:3000/api/health` devrait retourner `{"status":"ok"}`
2. Frontend : Ouvrez `http://localhost:4200` et créez un article
3. Vérifiez que l'article apparaît dans la liste

## 🐛 Dépannage

### CORS Error

Si vous avez une erreur CORS, vérifiez que `FRONTEND_URL` dans `.env` correspond à l'URL de votre frontend.

### Base de données

La base de données SQLite est créée automatiquement dans `backend/data/articles.db` au premier démarrage.

### Port déjà utilisé

Changez le `PORT` dans `backend/.env` si le port 3000 est déjà utilisé.

