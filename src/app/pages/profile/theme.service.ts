import { Injectable, signal } from '@angular/core';

export type ThemeMode = 'system' | 'light' | 'dark';
const KEY = 'theme-mode';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private mql = window.matchMedia('(prefers-color-scheme: dark)');
  readonly mode = signal<ThemeMode>(this.read());

  constructor() {
    this.apply();
    this.mql.addEventListener('change', () => this.apply());
  }

  set(mode: ThemeMode) {
    this.mode.set(mode);
    try {
      localStorage.setItem(KEY, mode);
    } catch {}
    this.apply();
  }

  private read(): ThemeMode {
    try {
      const v = localStorage.getItem(KEY);
      return v === 'light' || v === 'dark' ? v : 'system';
    } catch {
      return 'system';
    }
  }

  private apply() {
    const m = this.mode();
    const dark = m === 'dark' || (m === 'system' && this.mql.matches);
    document.documentElement.classList.toggle('ion-palette-dark', dark);
  }
}
