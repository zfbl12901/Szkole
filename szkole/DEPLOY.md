# Guide de déploiement

Ce projet est configuré pour être déployé automatiquement sur GitHub Pages via GitHub Actions.

## Configuration requise

1. **Activer GitHub Pages** dans les paramètres du dépôt :
   - Allez dans Settings > Pages
   - Source : sélectionnez "GitHub Actions"

2. **Branche principale** : Le workflow se déclenche sur les branches `main` ou `master`

## Déploiement automatique

Le déploiement se fait automatiquement à chaque push sur la branche principale.

### Déclenchement manuel

Vous pouvez aussi déclencher le déploiement manuellement :
- Allez dans l'onglet "Actions" de votre dépôt GitHub
- Sélectionnez le workflow "Deploy to GitHub Pages"
- Cliquez sur "Run workflow"

## URL de déploiement

Une fois déployé, votre application sera accessible à :
- `https://[votre-username].github.io/szkole/`

## Configuration du baseHref

Le `baseHref` est configuré pour `/szkole/` dans le workflow. Si vous changez le nom du dépôt ou si vous déployez à la racine, vous devrez modifier :
- Le paramètre `--base-href` dans `.github/workflows/deploy.yml`
- Le `<base href="/">` dans `src/index.html` si nécessaire

## Alternatives de déploiement

### Netlify

1. Connectez votre dépôt GitHub à Netlify
2. Configuration automatique via `netlify.toml`
3. Build command : `npm run build:prod`
4. Publish directory : `dist/szkole/browser`

### Vercel

1. Connectez votre dépôt GitHub à Vercel
2. Configuration automatique via `vercel.json`
3. Vercel détectera automatiquement Angular

## Notes importantes

- Le fichier `404.html` est automatiquement créé pour gérer le routing Angular (SPA)
- Le fichier `.nojekyll` est créé pour désactiver Jekyll sur GitHub Pages
- Les données stockées dans IndexedDB sont locales au navigateur et ne sont pas synchronisées entre les appareils
- Pour un déploiement en production avec persistance des données, considérez l'utilisation d'un backend
- Si vous changez le nom du dépôt, modifiez le `base-href` dans le workflow GitHub Actions

