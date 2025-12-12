import { Component, OnInit, AfterViewInit, AfterViewChecked, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MarkdownService } from '../../services/markdown.service';
import { ArticleService } from '../../services/article.service';
import { ReadingService, TableOfContentsItem } from '../../services/reading.service';
import { Article, ArticleMetadata } from '../../models/article.model';

@Component({
  selector: 'app-article',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './article.component.html',
  styleUrl: './article.component.scss'
})
export class ArticleComponent implements OnInit, AfterViewInit, AfterViewChecked, OnDestroy {
  articleId = signal<string | null>(null);
  article = signal<Article | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  
  // Navigation
  previousArticle = signal<ArticleMetadata | null>(null);
  nextArticle = signal<ArticleMetadata | null>(null);
  
  // Vue de lecture
  tableOfContents = signal<TableOfContentsItem[]>([]);
  readingTime = signal<number>(0);
  readingProgress = signal<number>(0);
  focusMode = signal<boolean>(false);
  readingWidth = signal<'narrow' | 'medium' | 'wide'>('medium');
  showTOC = signal<boolean>(true);
  
  private scrollListener?: () => void;
  private articleElement?: HTMLElement;
  private tocGenerated = false;
  
  // HTML rendu calculé à partir du contenu Markdown
  renderedHtml = computed(() => {
    const article = this.article();
    return article ? this.markdownService.render(article.content) : '';
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private markdownService: MarkdownService,
    private articleService: ArticleService,
    private readingService: ReadingService
  ) {
    this.articleId.set(this.route.snapshot.paramMap.get('id'));
  }

  async ngOnInit() {
    const id = this.articleId();
    if (!id) {
      this.error.set('ID d\'article manquant');
      this.loading.set(false);
      return;
    }

    try {
      const article = await this.articleService.getArticleById(id);
      if (article) {
        this.article.set(article);
        
        // Calculer le temps de lecture
        const time = this.readingService.estimateReadingTime(article.content);
        this.readingTime.set(time);
        
        // Charger les articles précédent/suivant
        await this.loadNavigationArticles(id);
      } else {
        this.error.set('Article non trouvé');
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'article:', error);
      this.error.set('Erreur lors du chargement de l\'article');
    } finally {
      this.loading.set(false);
    }
  }

  ngAfterViewInit() {
    // Attendre que le contenu soit rendu
    setTimeout(() => {
      this.setupReadingProgress();
      this.generateTOC();
    }, 200);
  }

  ngAfterViewChecked() {
    // Régénérer la TOC si le contenu a changé
    if (!this.tocGenerated && this.renderedHtml() && typeof document !== 'undefined') {
      const articleElement = document.querySelector('.article-content') as HTMLElement;
      if (articleElement && articleElement.children.length > 0) {
        this.generateTOC();
        this.tocGenerated = true;
      }
    }
  }

  ngOnDestroy() {
    if (this.scrollListener) {
      window.removeEventListener('scroll', this.scrollListener);
    }
  }

  private async loadNavigationArticles(currentId: string) {
    try {
      const allArticles = await this.articleService.getAllArticles();
      const currentIndex = allArticles.findIndex(a => a.id === currentId);
      
      if (currentIndex > 0) {
        this.previousArticle.set(allArticles[currentIndex - 1]);
      }
      if (currentIndex < allArticles.length - 1) {
        this.nextArticle.set(allArticles[currentIndex + 1]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la navigation:', error);
    }
  }

  private generateTOC() {
    const articleElement = document.querySelector('.article-content') as HTMLElement;
    if (articleElement && articleElement.children.length > 0) {
      const toc = this.readingService.generateTableOfContents(articleElement);
      this.tableOfContents.set(toc);
      this.articleElement = articleElement;
      this.tocGenerated = true;
    }
  }

  private setupReadingProgress() {
    this.scrollListener = () => {
      if (this.articleElement) {
        const progress = this.readingService.calculateReadingProgress(this.articleElement);
        this.readingProgress.set(progress);
      }
    };
    window.addEventListener('scroll', this.scrollListener, { passive: true });
    this.scrollListener(); // Calculer immédiatement
  }

  scrollToHeading(item: TableOfContentsItem) {
    if (item.element) {
      this.readingService.scrollToElement(item.element, 100);
    }
  }

  toggleFocusMode() {
    this.focusMode.set(!this.focusMode());
    if (this.focusMode()) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  setReadingWidth(width: 'narrow' | 'medium' | 'wide') {
    this.readingWidth.set(width);
  }

  toggleTOC() {
    this.showTOC.set(!this.showTOC());
  }

  async deleteArticle() {
    const id = this.articleId();
    if (!id) return;

    if (confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
      const success = await this.articleService.deleteArticle(id);
      if (success) {
        // Rediriger vers la liste des articles
        this.router.navigate(['/articles']);
      }
    }
  }

  async exportArticle() {
    const id = this.articleId();
    if (!id) return;

    try {
      await this.articleService.exportArticle(id);
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      alert('Erreur lors de l\'export de l\'article');
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

