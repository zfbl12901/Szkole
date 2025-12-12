import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MarkdownService } from '../../services/markdown.service';
import { ArticleService } from '../../services/article.service';
import { Article } from '../../models/article.model';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.scss'
})
export class EditorComponent implements OnInit {
  articleId = signal<string | null>(null);
  articleTitle = signal<string>('');
  markdownContent = signal('');
  articleCategory = signal<string>('');
  articleTags = signal<string>('');
  isSaving = signal(false);
  isNewArticle = signal(true);
  
  // HTML rendu calculé à partir du contenu Markdown
  renderedHtml = computed(() => this.markdownService.render(this.markdownContent()));

  constructor(
    private markdownService: MarkdownService,
    private articleService: ArticleService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    
    if (id) {
      // Mode édition : charger l'article existant
      this.articleId.set(id);
      this.isNewArticle.set(false);
      await this.loadArticle(id);
    } else {
      // Mode création : contenu par défaut
      this.markdownContent.set(`# Nouvel article

Commencez à rédiger votre article ici...

## Exemple de formatage

Voici quelques **exemples** de *formatage* Markdown :

### Code

Code inline : \`console.log('Hello')\`

Bloc de code :

\`\`\`typescript
function greet(name: string) {
  return \`Hello, \${name}!\`;
}
\`\`\`

### Liste

- Item 1
- Item 2
- Item 3

### Citation

> Ceci est une citation importante.

### Lien

[Angular](https://angular.io) est un framework incroyable !`);
      this.articleTitle.set('Nouvel article');
    }
  }

  async loadArticle(id: string) {
    try {
      const article = await this.articleService.getArticleById(id);
      if (article) {
        this.articleTitle.set(article.title);
        this.markdownContent.set(article.content);
        this.articleCategory.set(article.category || '');
        this.articleTags.set(article.tags?.join(', ') || '');
      } else {
        alert('Article non trouvé');
        this.router.navigate(['/articles']);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'article:', error);
      alert('Erreur lors du chargement de l\'article');
    }
  }

  onContentChange(value: string): void {
    this.markdownContent.set(value);
  }

  onTitleChange(value: string): void {
    this.articleTitle.set(value);
  }

  async saveArticle(): Promise<void> {
    const title = this.articleTitle().trim();
    const content = this.markdownContent().trim();

    if (!title) {
      alert('Veuillez saisir un titre');
      return;
    }

    if (!content) {
      alert('Le contenu ne peut pas être vide');
      return;
    }

    this.isSaving.set(true);

    try {
      // Parser les tags (séparés par des virgules)
      const tags = this.articleTags()
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
      
      const category = this.articleCategory().trim() || undefined;

      let article: Article;

      if (this.isNewArticle()) {
        // Créer un nouvel article
        article = await this.articleService.createArticle(title, content, category, tags);
        this.articleId.set(article.id);
        this.isNewArticle.set(false);
        // Mettre à jour l'URL sans recharger
        this.router.navigate(['/editor', article.id], { replaceUrl: true });
      } else {
        // Mettre à jour l'article existant
        const id = this.articleId();
        if (!id) return;
        
        const updatedArticle = await this.articleService.updateArticle(id, {
          title,
          content,
          category,
          tags
        });
        
        if (!updatedArticle) {
          throw new Error('Erreur lors de la mise à jour');
        }
        
        article = updatedArticle;
      }

      alert('Article enregistré avec succès !');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde de l\'article');
    } finally {
      this.isSaving.set(false);
    }
  }

  async importFile(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (!file) return;

    if (!file.name.endsWith('.md')) {
      alert('Veuillez sélectionner un fichier .md');
      return;
    }

    try {
      const article = await this.articleService.importArticle(file);
      this.articleId.set(article.id);
      this.articleTitle.set(article.title);
      this.markdownContent.set(article.content);
      this.isNewArticle.set(false);
      this.router.navigate(['/editor', article.id], { replaceUrl: true });
      alert('Article importé avec succès !');
    } catch (error) {
      console.error('Erreur lors de l\'import:', error);
      alert('Erreur lors de l\'import de l\'article');
    }

    // Réinitialiser l'input
    input.value = '';
  }
}

