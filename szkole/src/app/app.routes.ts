import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'articles',
    loadComponent: () => import('./pages/articles/articles.component').then(m => m.ArticlesComponent)
  },
  {
    path: 'editor',
    loadComponent: () => import('./pages/editor/editor.component').then(m => m.EditorComponent)
  },
  {
    path: 'editor/:id',
    loadComponent: () => import('./pages/editor/editor.component').then(m => m.EditorComponent)
  },
  {
    path: 'article/:id',
    loadComponent: () => import('./pages/article/article.component').then(m => m.ArticleComponent)
  }
];
