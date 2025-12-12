import { Injectable } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js';

// Configuration de marked avec highlight.js
marked.use(markedHighlight({
  langPrefix: 'hljs language-',
  highlight(code: string, lang: string) {
    const language = hljs.getLanguage(lang) ? lang : 'plaintext';
    try {
      return hljs.highlight(code, { language }).value;
    } catch (err) {
      return hljs.highlight(code, { language: 'plaintext' }).value;
    }
  }
}));

// Fonction pour ajouter des IDs aux titres dans le HTML
function addIdsToHeadings(html: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
  
  headings.forEach((heading) => {
    if (!heading.id) {
      const text = heading.textContent || '';
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim() || `heading-${heading.tagName.toLowerCase()}-${Math.random().toString(36).substring(2, 11)}`;
      heading.id = id;
    }
  });
  
  return doc.body.innerHTML;
}

// Configuration des options de marked
marked.setOptions({
  breaks: true, // Convertit les retours à la ligne en <br>
  gfm: true, // Active GitHub Flavored Markdown
});

@Injectable({
  providedIn: 'root'
})
export class MarkdownService {
  constructor(private sanitizer: DomSanitizer) {}

  /**
   * Convertit du Markdown en HTML sécurisé
   * Note: bypassSecurityTrustHtml est utilisé car marked génère du HTML sûr
   * Pour une sécurité renforcée, considérez l'utilisation de DOMPurify
   */
  render(markdown: string): SafeHtml {
    if (!markdown) {
      return this.sanitizer.bypassSecurityTrustHtml('');
    }

    const html = marked.parse(markdown) as string;
    // Ajouter des IDs aux titres pour la navigation
    const htmlWithIds = typeof document !== 'undefined' 
      ? addIdsToHeadings(html)
      : html;
    
    return this.sanitizer.bypassSecurityTrustHtml(htmlWithIds);
  }

  /**
   * Convertit du Markdown en HTML (non sécurisé, à utiliser avec précaution)
   */
  renderUnsafe(markdown: string): string {
    if (!markdown) {
      return '';
    }
    return marked.parse(markdown) as string;
  }
}

