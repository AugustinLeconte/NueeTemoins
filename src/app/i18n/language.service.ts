import { inject, Injectable, signal } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { firstValueFrom } from 'rxjs';

export const LANGUAGES = [
  { code: 'fr', label: 'Français' },
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
] as const;

const STORAGE_KEY = 'lang';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private transloco = inject(TranslocoService);
  readonly supported = LANGUAGES;
  readonly current = signal<string>('fr');

  init() {
    const lang = this.detect();
    this.apply(lang);
    return firstValueFrom(this.transloco.load(lang));
  }

  set(lang: string) {
    if (!this.isSupported(lang)) return;
    localStorage.setItem(STORAGE_KEY, lang);
    this.apply(lang);
  }

  private apply(lang: string) {
    this.transloco.setActiveLang(lang);
    this.current.set(lang);
    document.documentElement.lang = lang;
  }

  private detect(): string {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && this.isSupported(saved)) return saved;
    for (const l of navigator.languages ?? [navigator.language]) {
      const code = l.slice(0, 2).toLowerCase();
      if (this.isSupported(code)) return code;
    }
    return 'fr';
  }

  private isSupported(code: string) {
    return this.supported.some((l) => l.code === code);
  }
}
