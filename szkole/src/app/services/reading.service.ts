import { Injectable } from '@angular/core';

export interface TableOfContentsItem {
  id: string;
  text: string;
  level: number;
  element?: HTMLElement;
}

@Injectable({
  providedIn: 'root'
})
export class ReadingService {
  /**
   * Génère une table des matières à partir du contenu HTML
   */
  generateTableOfContents(htmlContent: HTMLElement): TableOfContentsItem[] {
    const headings = htmlContent.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const toc: TableOfContentsItem[] = [];
    let idCounter = 0;

    headings.forEach((heading) => {
      const level = parseInt(heading.tagName.charAt(1));
      const text = heading.textContent || '';
      
      // Générer un ID unique si nécessaire
      let id = heading.id;
      if (!id) {
        id = `heading-${idCounter++}`;
        heading.id = id;
      }

      toc.push({
        id,
        text,
        level,
        element: heading as HTMLElement
      });
    });

    return toc;
  }

  /**
   * Calcule le temps de lecture estimé (mots par minute)
   */
  estimateReadingTime(content: string, wordsPerMinute: number = 200): number {
    const words = content.trim().split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  }

  /**
   * Calcule la progression de lecture
   */
  calculateReadingProgress(element: HTMLElement): number {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollBottom = scrollTop + windowHeight;
    
    const articleTop = element.offsetTop;
    const articleHeight = element.offsetHeight;
    const articleBottom = articleTop + articleHeight;

    if (scrollTop < articleTop) {
      return 0;
    }
    if (scrollBottom > articleBottom) {
      return 100;
    }

    const scrolled = scrollBottom - articleTop;
    return Math.min(100, Math.max(0, (scrolled / articleHeight) * 100));
  }

  /**
   * Scroll vers un élément avec animation
   */
  scrollToElement(element: HTMLElement, offset: number = 100): void {
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + (window.scrollY || window.pageYOffset || 0) - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }
}

