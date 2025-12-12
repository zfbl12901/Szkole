# Szkole Backend API

API REST pour la gestion des articles de Szkole.

## Installation

```bash
cd backend
npm install
```

## Configuration

Copiez le fichier `.env.example` vers `.env` et configurez les variables :

```bash
cp .env.example .env
```

Variables d'environnement :
- `PORT` : Port du serveur (défaut: 3000)
- `FRONTEND_URL` : URL du frontend pour CORS (défaut: http://localhost:4200)
- `DATABASE_PATH` : Chemin de la base de données SQLite (défaut: ./data/articles.db)
- `NODE_ENV` : Environnement (development, production)

## Développement

```bash
npm run dev
```

Le serveur démarre sur `http://localhost:3000`

## Production

```bash
npm start
```

## Base de données

La base de données SQLite est créée automatiquement au premier démarrage dans le dossier `data/`.

## API Endpoints

### GET /api/health
Vérifier l'état de l'API

### GET /api/articles
Récupérer tous les articles (métadonnées)

### GET /api/articles/:id
Récupérer un article par ID

### POST /api/articles
Créer un nouvel article
```json
{
  "title": "Titre",
  "content": "Contenu Markdown",
  "category": "Catégorie",
  "tags": ["tag1", "tag2"]
}
```

### PUT /api/articles/:id
Mettre à jour un article

### DELETE /api/articles/:id
Supprimer un article

## Déploiement

Le backend peut être déployé sur :
- Railway
- Render
- Heroku
- Vercel (avec configuration serverless)
- DigitalOcean App Platform

