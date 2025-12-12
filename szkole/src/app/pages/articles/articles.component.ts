import { Component, OnInit, signal, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ArticleService } from '../../services/article.service';
import { ArticleMetadata } from '../../models/article.model';

@Component({
  selector: 'app-articles',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './articles.component.html',
  styleUrl: './articles.component.scss'
})
export class ArticlesComponent implements OnInit {
  allArticles = signal<ArticleMetadata[]>([]);
  loading = signal(true);
  
  // Filtres
  searchQuery = signal('');
  selectedCategory = signal<string | null>(null);
  selectedTag = signal<string | null>(null);
  
  // Vue organisée par catégories
  viewMode = signal<'list' | 'categories'>('list');
  
  // Articles filtrés
  filteredArticles = computed(() => {
    let articles = this.allArticles();
    
    // Filtre par recherche
    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      articles = articles.filter(article => 
        article.title.toLowerCase().includes(query) ||
        article.excerpt?.toLowerCase().includes(query) ||
        article.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Filtre par catégorie
    const category = this.selectedCategory();
    if (category) {
      articles = articles.filter(article => article.category === category);
    }
    
    // Filtre par tag
    const tag = this.selectedTag();
    if (tag) {
      articles = articles.filter(article => 
        article.tags?.includes(tag)
      );
    }
    
    return articles;
  });
  
  // Articles groupés par catégorie
  articlesByCategory = computed(() => {
    const articles = this.filteredArticles();
    const grouped = new Map<string, ArticleMetadata[]>();
    
    articles.forEach(article => {
      const category = article.category || 'Sans catégorie';
      if (!grouped.has(category)) {
        grouped.set(category, []);
      }
      grouped.get(category)!.push(article);
    });
    
    // Convertir en tableau trié
    return Array.from(grouped.entries())
      .map(([category, articles]) => ({ category, articles }))
      .sort((a, b) => a.category.localeCompare(b.category));
  });
  
  // Liste des catégories uniques
  categories = computed(() => {
    const cats = new Set<string>();
    this.allArticles().forEach(article => {
      if (article.category) {
        cats.add(article.category);
      }
    });
    return Array.from(cats).sort();
  });
  
  // Liste des tags uniques
  tags = computed(() => {
    const tagSet = new Set<string>();
    this.allArticles().forEach(article => {
      article.tags?.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  });

  private articleService = inject(ArticleService);

  constructor() {
    // S'abonner aux changements du service avec effect
    effect(() => {
      const articles = this.articleService.articles();
      this.allArticles.set(articles);
      if (!this.loading()) {
        this.loading.set(false);
      }
    });
  }

  async ngOnInit() {
    await this.loadArticles();
  }

  private async loadArticles() {
    try {
      const articles = await this.articleService.getAllArticles();
      this.allArticles.set(articles);
    } catch (error) {
      console.error('Erreur lors du chargement des articles:', error);
    } finally {
      this.loading.set(false);
    }
  }

  onSearchChange(value: string): void {
    this.searchQuery.set(value);
  }

  onCategoryChange(category: string | null): void {
    this.selectedCategory.set(category);
  }

  onTagChange(tag: string | null): void {
    this.selectedTag.set(tag);
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.selectedCategory.set(null);
    this.selectedTag.set(null);
  }

  toggleViewMode(): void {
    this.viewMode.set(this.viewMode() === 'list' ? 'categories' : 'list');
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}

