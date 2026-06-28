import { Injectable, signal } from '@angular/core';

export type Theme = 'dark' | 'topnav' | 'minimal';
const THEMES: Theme[] = ['dark', 'topnav', 'minimal'];
const KEY = 'pp-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly _theme = signal<Theme>(this.load());
  readonly theme = this._theme.asReadonly();

  constructor() { this.apply(this._theme()); }

  cycle(): void {
    const next = THEMES[(THEMES.indexOf(this._theme()) + 1) % THEMES.length];
    this._theme.set(next);
    localStorage.setItem(KEY, next);
    this.apply(next);
  }

  private load(): Theme {
    const saved = localStorage.getItem(KEY) as Theme;
    return THEMES.includes(saved) ? saved : 'dark';
  }

  private apply(theme: Theme): void {
    const html = document.documentElement;
    THEMES.forEach(t => html.classList.remove(`theme-${t}`));
    html.classList.add(`theme-${theme}`);
  }
}
