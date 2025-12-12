import { Injectable, signal } from '@angular/core';
import { Article, ArticleMetadata } from '../models/article.model';
import { firstValueFrom, from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  private readonly DB_NAME = 'szkole-db';
  private readonly STORE_NAME = 'articles';
  private readonly DB_VERSION = 1;
  
  private db: IDBDatabase | null = null;
  
  // Signal pour la liste des articles
  articles = signal<ArticleMetadata[]>([]);

  constructor() {
    this.initDB();
  }

  /**
   * Initialise la base de données IndexedDB
   */
  private async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => {
        console.error('Erreur lors de l\'ouverture de la base de données');
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.loadArticles();
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Créer le store s'il n'existe pas
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          const objectStore = db.createObjectStore(this.STORE_NAME, { keyPath: 'id' });
          objectStore.createIndex('title', 'title', { unique: false });
          objectStore.createIndex('createdAt', 'createdAt', { unique: false });
          objectStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        }
      };
    });
  }

  /**
   * Attend que la base de données soit initialisée
   */
  private async ensureDB(): Promise<IDBDatabase> {
    if (this.db) {
      return this.db;
    }
    await this.initDB();
    if (!this.db) {
      throw new Error('Impossible d\'initialiser la base de données');
    }
    return this.db;
  }

  /**
   * Charge tous les articles depuis IndexedDB
   */
  private async loadArticles(): Promise<void> {
    try {
      const db = await this.ensureDB();
      const transaction = db.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const articles = request.result as any[];
        // Convertir les dates et créer les métadonnées
        const processedArticles = articles.map(article => {
          article.createdAt = article.createdAt instanceof Date 
            ? article.createdAt 
            : new Date(article.createdAt);
          article.updatedAt = article.updatedAt instanceof Date 
            ? article.updatedAt 
            : new Date(article.updatedAt);
          return article as Article;
        });
        const metadata = processedArticles.map(article => this.toMetadata(article));
        // Trier par date de mise à jour (plus récent en premier)
        metadata.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
        this.articles.set(metadata);
      };

      request.onerror = () => {
        console.error('Erreur lors du chargement des articles');
      };
    } catch (error) {
      console.error('Erreur lors du chargement des articles:', error);
    }
  }

  /**
   * Convertit un Article en ArticleMetadata
   */
  private toMetadata(article: Article): ArticleMetadata {
    return {
      id: article.id,
      title: article.title,
      excerpt: article.excerpt || this.generateExcerpt(article.content),
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
      category: article.category,
      tags: article.tags
    };
  }

  /**
   * Génère un extrait à partir du contenu
   */
  private generateExcerpt(content: string, maxLength: number = 150): string {
    // Supprimer le markdown basique pour l'extrait
    const plainText = content
      .replace(/#{1,6}\s+/g, '') // Titres
      .replace(/\*\*([^*]+)\*\*/g, '$1') // Gras
      .replace(/\*([^*]+)\*/g, '$1') // Italique
      .replace(/`([^`]+)`/g, '$1') // Code inline
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Liens
      .trim();

    if (plainText.length <= maxLength) {
      return plainText;
    }

    return plainText.substring(0, maxLength) + '...';
  }

  /**
   * Récupère tous les articles (métadonnées seulement)
   */
  async getAllArticles(): Promise<ArticleMetadata[]> {
    await this.ensureDB();
    return this.articles();
  }

  /**
   * Récupère un article par son ID
   */
  async getArticleById(id: string): Promise<Article | null> {
    try {
      const db = await this.ensureDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.STORE_NAME], 'readonly');
        const store = transaction.objectStore(this.STORE_NAME);
        const request = store.get(id);

        request.onsuccess = () => {
          const article = request.result as any;
          if (article) {
            // Convertir les dates string en Date (IndexedDB stocke les dates comme strings)
            article.createdAt = article.createdAt instanceof Date 
              ? article.createdAt 
              : new Date(article.createdAt);
            article.updatedAt = article.updatedAt instanceof Date 
              ? article.updatedAt 
              : new Date(article.updatedAt);
          }
          resolve(article || null);
        };

        request.onerror = () => {
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'article:', error);
      return null;
    }
  }

  /**
   * Crée un nouvel article
   */
  async createArticle(title: string, content: string, category?: string, tags?: string[]): Promise<Article> {
    const id = this.generateId();
    const now = new Date();
    
    const article: Article = {
      id,
      title,
      content,
      excerpt: this.generateExcerpt(content),
      createdAt: now,
      updatedAt: now,
      category,
      tags
    };

    await this.saveArticle(article);
    return article;
  }

  /**
   * Met à jour un article existant
   */
  async updateArticle(id: string, updates: Partial<Article>): Promise<Article | null> {
    const existing = await this.getArticleById(id);
    if (!existing) {
      return null;
    }

    const updated: Article = {
      ...existing,
      ...updates,
      id, // S'assurer que l'ID ne change pas
      updatedAt: new Date()
    };

    // Régénérer l'extrait si le contenu a changé
    if (updates.content !== undefined) {
      updated.excerpt = this.generateExcerpt(updated.content);
    }

    await this.saveArticle(updated);
    return updated;
  }

  /**
   * Sauvegarde un article dans IndexedDB
   */
  private async saveArticle(article: Article): Promise<void> {
    try {
      const db = await this.ensureDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.STORE_NAME], 'readwrite');
        const store = transaction.objectStore(this.STORE_NAME);
        const request = store.put(article);

        request.onsuccess = () => {
          this.loadArticles(); // Recharger la liste
          resolve();
        };

        request.onerror = () => {
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'article:', error);
      throw error;
    }
  }

  /**
   * Supprime un article
   */
  async deleteArticle(id: string): Promise<boolean> {
    try {
      const db = await this.ensureDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.STORE_NAME], 'readwrite');
        const store = transaction.objectStore(this.STORE_NAME);
        const request = store.delete(id);

        request.onsuccess = () => {
          this.loadArticles(); // Recharger la liste
          resolve(true);
        };

        request.onerror = () => {
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'article:', error);
      return false;
    }
  }

  /**
   * Génère un ID unique
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
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

