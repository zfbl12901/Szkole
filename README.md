# Szkole - Personal Wiki

Application Angular "GitBook-like" pour la veille technologique personnelle avec backend Node.js.

## 📁 Structure du projet

```
.
├── backend/          # API Node.js/Express + SQLite
├── szkole/           # Frontend Angular
└── .github/          # GitHub Actions pour le déploiement
```

## 🚀 Démarrage rapide

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Le backend démarre sur `http://localhost:3000`

### Frontend

```bash
cd szkole
npm install
npm start
```

Le frontend démarre sur `http://localhost:4200`

## 📦 Technologies

### Backend
- Node.js + Express
- SQLite (better-sqlite3)
- CORS pour la communication avec le frontend

### Frontend
- Angular 18
- TypeScript
- Marked (rendu Markdown)
- Highlight.js (coloration syntaxique)

## 🚢 Déploiement

### Backend
Le backend peut être déployé sur :
- **Railway** : Configuration automatique via `railway.json` + GitHub Actions
- **Render** : Configuration automatique via `render.yaml` + GitHub Actions
- **Heroku**, **Vercel**, **DigitalOcean**, etc.

**Déploiement automatique** : Le workflow `.github/workflows/deploy-backend.yml` déploie automatiquement le backend sur Railway ou Render à chaque push sur `main`.

Voir [backend/DEPLOY.md](./backend/DEPLOY.md) pour les instructions détaillées.

### Frontend
Le frontend est déployé automatiquement sur **GitHub Pages** via GitHub Actions (`.github/workflows/deploy.yml`).

## 🔧 Configuration

### Variables d'environnement (Backend)

Créez un fichier `backend/.env` :

```env
PORT=3000
FRONTEND_URL=http://localhost:4200
DATABASE_PATH=./data/articles.db
NODE_ENV=development
```

### Variables d'environnement (Frontend)

Modifiez `szkole/src/environments/environment.prod.ts` avec l'URL de votre backend déployé.

## 📝 API Endpoints

- `GET /api/health` - Vérifier l'état de l'API
- `GET /api/articles` - Récupérer tous les articles
- `GET /api/articles/:id` - Récupérer un article
- `POST /api/articles` - Créer un article
- `PUT /api/articles/:id` - Mettre à jour un article
- `DELETE /api/articles/:id` - Supprimer un article

## 🎯 Fonctionnalités

- ✍️ Éditeur Markdown avec prévisualisation
- 📚 Gestion d'articles avec catégories et tags
- 🌙 Thème sombre/clair
- 🔍 Recherche et filtrage
- 📖 Vue de lecture optimisée
- 💾 Stockage persistant (SQLite)
- 📤 Import/Export de fichiers .md

## 📄 Licence

Projet personnel.

