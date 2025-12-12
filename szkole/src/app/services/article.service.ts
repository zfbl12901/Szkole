import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Article, ArticleMetadata } from '../models/article.model';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  // URL de l'API backend
  private readonly API_URL = environment.apiUrl;
  
  // Signal pour la liste des articles
  articles = signal<ArticleMetadata[]>([]);

  constructor(private http: HttpClient) {
    this.loadArticles();
  }

  /**
   * Charge tous les articles depuis l'API
   */
  private async loadArticles(): Promise<void> {
    try {
      const articles = await firstValueFrom(
        this.http.get<ArticleMetadata[]>(`${this.API_URL}/articles`)
      );
      // Convertir les dates string en Date
      const processedArticles = articles.map(article => ({
        ...article,
        createdAt: new Date(article.createdAt),
        updatedAt: new Date(article.updatedAt)
      }));
      this.articles.set(processedArticles);
    } catch (error) {
      console.error('Erreur lors du chargement des articles:', error);
      this.articles.set([]);
    }
  }

  /**
   * Récupère tous les articles (métadonnées seulement)
   */
  async getAllArticles(): Promise<ArticleMetadata[]> {
    await this.loadArticles();
    return this.articles();
  }

  /**
   * Récupère un article par son ID
   */
  async getArticleById(id: string): Promise<Article | null> {
    try {
      const article = await firstValueFrom(
        this.http.get<Article>(`${this.API_URL}/articles/${id}`)
      );
      // Convertir les dates string en Date
      return {
        ...article,
        createdAt: new Date(article.createdAt),
        updatedAt: new Date(article.updatedAt)
      };
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'article:', error);
      return null;
    }
  }

  /**
   * Crée un nouvel article
   */
  async createArticle(title: string, content: string, category?: string, tags?: string[]): Promise<Article> {
    try {
      const article = await firstValueFrom(
        this.http.post<Article>(`${this.API_URL}/articles`, {
          title,
          content,
          category: category || '',
          tags: tags || []
        })
      );
      // Convertir les dates
      const processedArticle = {
        ...article,
        createdAt: new Date(article.createdAt),
        updatedAt: new Date(article.updatedAt)
      };
      await this.loadArticles(); // Recharger la liste
      return processedArticle;
    } catch (error) {
      console.error('Erreur lors de la création de l\'article:', error);
      throw error;
    }
  }

  /**
   * Met à jour un article existant
   */
  async updateArticle(id: string, updates: Partial<Omit<Article, 'id' | 'createdAt'>>): Promise<Article | null> {
    try {
      const article = await firstValueFrom(
        this.http.put<Article>(`${this.API_URL}/articles/${id}`, {
          title: updates.title,
          content: updates.content,
          category: updates.category || '',
          tags: updates.tags || []
        })
      );
      // Convertir les dates
      const processedArticle = {
        ...article,
        createdAt: new Date(article.createdAt),
        updatedAt: new Date(article.updatedAt)
      };
      await this.loadArticles(); // Recharger la liste
      return processedArticle;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'article:', error);
      return null;
    }
  }

  /**
   * Supprime un article
   */
  async deleteArticle(id: string): Promise<boolean> {
    try {
      await firstValueFrom(
        this.http.delete(`${this.API_URL}/articles/${id}`)
      );
      await this.loadArticles(); // Recharger la liste
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'article:', error);
      return false;
    }
  }

  /**
   * Exporte un article en fichier .md
   */
  async exportArticle(id: string): Promise<void> {
    const article = await this.getArticleById(id);
    if (!article) {
      throw new Error('Article non trouvé');
    }

    const blob = new Blob([article.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.sanitizeFilename(article.title)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Importe un fichier .md comme nouvel article
   */
  async importArticle(file: File): Promise<Article> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          const title = file.name.replace(/\.md$/, '');
          const article = await this.createArticle(title, content);
          resolve(article);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => {
        reject(new Error('Erreur lors de la lecture du fichier'));
      };

      reader.readAsText(file);
    });
  }

  /**
   * Nettoie un nom de fichier pour qu'il soit valide
   */
  private sanitizeFilename(filename: string): string {
    return filename
      .replace(/[^a-z0-9]/gi, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase();
  }
}
