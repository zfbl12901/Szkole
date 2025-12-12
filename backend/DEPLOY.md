# Déploiement du Backend

Le backend peut être déployé sur plusieurs plateformes. Voici les options disponibles.

## 🚂 Railway (Recommandé)

### Configuration automatique via GitHub Actions

1. Créez un compte sur [Railway](https://railway.app)
2. Créez un nouveau projet
3. Connectez votre dépôt GitHub
4. Railway détectera automatiquement le dossier `backend/`
5. Ajoutez les variables d'environnement :
   - `FRONTEND_URL` : URL de votre frontend déployé (ex: `https://username.github.io`)
   - `NODE_ENV` : `production`
   - `DATABASE_PATH` : `/tmp/data/articles.db` (ou utilisez un volume persistant)

### Déploiement manuel

```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

### Déploiement via GitHub Actions

1. Obtenez votre token Railway : Settings > Tokens > New Token
2. Ajoutez le secret `RAILWAY_TOKEN` dans votre dépôt GitHub (Settings > Secrets and variables > Actions)
3. Le workflow `.github/workflows/deploy-backend.yml` se déclenchera automatiquement

## 🎨 Render

### Configuration automatique via GitHub Actions

1. Créez un compte sur [Render](https://render.com)
2. Créez un nouveau Web Service
3. Connectez votre dépôt GitHub
4. Configuration :
   - **Root Directory** : `backend`
   - **Build Command** : `npm install`
   - **Start Command** : `npm start`
5. Ajoutez les variables d'environnement

### Déploiement via GitHub Actions

1. Obtenez votre API Key : Account Settings > API Keys
2. Obtenez votre Service ID depuis l'URL du service
3. Ajoutez les secrets dans GitHub :
   - `RENDER_API_KEY`
   - `RENDER_SERVICE_ID`
4. Le workflow se déclenchera automatiquement

## 🐳 Docker (Optionnel)

Si vous préférez utiliser Docker, créez un `Dockerfile` :

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 📝 Variables d'environnement requises

- `PORT` : Port du serveur (généralement défini automatiquement par la plateforme)
- `FRONTEND_URL` : URL de votre frontend déployé
- `NODE_ENV` : `production`
- `DATABASE_PATH` : Chemin de la base de données (utilisez un volume persistant en production)

## ⚠️ Important

- **Base de données** : En production, utilisez un volume persistant pour la base de données SQLite, ou migrez vers PostgreSQL/MySQL
- **CORS** : Assurez-vous que `FRONTEND_URL` correspond exactement à l'URL de votre frontend
- **HTTPS** : Les plateformes de déploiement fournissent généralement HTTPS automatiquement

## 🔗 Mise à jour du frontend

Après avoir déployé le backend, mettez à jour `szkole/src/environments/environment.prod.ts` avec l'URL de votre backend :

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://votre-backend.railway.app/api'
};
```

