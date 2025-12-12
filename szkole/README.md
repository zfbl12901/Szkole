# Szkole

Application Angular "GitBook-like" pour la veille technologique personnelle.

## 🚀 Fonctionnalités

- ✍️ **Éditeur Markdown** avec prévisualisation en temps réel
- 📚 **Gestion d'articles** en format Markdown
- 🌙 **Thème sombre/clair** avec toggle
- 🔍 **Recherche et filtrage** par catégories et tags
- 📖 **Vue de lecture optimisée** avec table des matières
- 💾 **Stockage local** avec IndexedDB
- 📤 **Import/Export** de fichiers .md
- 🎨 **Interface moderne** et responsive

## 📦 Installation

```bash
cd szkole
npm install
```

## 🛠️ Développement

```bash
npm start
```

L'application sera accessible sur `http://localhost:4200`

## 🏗️ Build

```bash
# Build de production
npm run build:prod

# Build pour GitHub Pages
npm run build:gh-pages
```

## 📤 Déploiement

Le projet est configuré pour un déploiement automatique sur GitHub Pages via GitHub Actions.

### Configuration initiale

1. Activez GitHub Pages dans les paramètres de votre dépôt :
   - Settings > Pages
   - Source : sélectionnez "GitHub Actions"

2. Le déploiement se fait automatiquement à chaque push sur `main` ou `master`

### Déploiement manuel

- Allez dans Actions > Deploy to GitHub Pages > Run workflow

Voir [DEPLOY.md](./DEPLOY.md) pour plus de détails.

## 🎯 Utilisation

1. **Créer un article** : Cliquez sur "Nouvel article" dans la sidebar
2. **Éditer** : Utilisez l'éditeur Markdown avec prévisualisation
3. **Organiser** : Ajoutez des catégories et tags pour organiser vos articles
4. **Rechercher** : Utilisez la barre de recherche et les filtres
5. **Lire** : Profitez de la vue de lecture optimisée avec table des matières

## 🛠️ Technologies

- Angular 18
- TypeScript
- Marked (rendu Markdown)
- Highlight.js (coloration syntaxique)
- IndexedDB (stockage local)
- SCSS

## 📝 Licence

Ce projet est un projet personnel.
