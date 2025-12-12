import { Injectable, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'szkole-theme';
  private readonly defaultTheme: Theme = 'dark';
  
  // Signal pour le thème actuel
  currentTheme = signal<Theme>(this.getStoredTheme());

  constructor() {
    this.applyTheme(this.currentTheme());
  }

  /**
   * Récupère le thème stocké dans localStorage ou retourne le thème par défaut
   */
  private getStoredTheme(): Theme {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = localStorage.getItem(this.THEME_KEY) as Theme;
      return stored && (stored === 'light' || stored === 'dark') ? stored : this.defaultTheme;
    }
    return this.defaultTheme;
  }

  /**
   * Applique le thème au document
   */
  private applyTheme(theme: Theme): void {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
  }

  /**
   * Change le thème
   */
  setTheme(theme: Theme): void {
    this.currentTheme.set(theme);
    this.applyTheme(theme);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(this.THEME_KEY, theme);
    }
  }

  /**
   * Toggle entre light et dark
   */
  toggleTheme(): void {
    const newTheme = this.currentTheme() === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
  }
}


