// src/app/tutorial/tutorial.service.ts
import { Injectable, computed, signal } from '@angular/core';

export interface TutorialStep {
  id: string;
  target?: string; // sélecteur CSS de l'élément à mettre en lumière
  openMore?: boolean; // ouvre le popup "Plus" (mobile) pendant cette étape
}

const ALL_STEPS: TutorialStep[] = [
  { id: 'welcome' },
  { id: 'collection', target: '[data-tour="collection"]' },
  { id: 'packs', target: '[data-tour="packs"]' },
  { id: 'friends', target: '[data-tour="friends"]' },
  { id: 'shop', target: '[data-tour="shop"]', openMore: true },
  {
    id: 'minigames',
    target: '[data-tour="wordle"], [data-tour="memory"], [data-tour="guess-card"]',
    openMore: true,
  },
  { id: 'outro' },
];

const KEY = 'tutorial:pending';

@Injectable({ providedIn: 'root' })
export class TutorialService {
  private steps = signal<TutorialStep[]>([]);

  readonly active = signal(false);
  readonly index = signal(0);

  readonly current = computed(() => (this.active() ? (this.steps()[this.index()] ?? null) : null));
  readonly total = computed(() => this.steps().length);
  readonly isFirst = computed(() => this.index() === 0);
  readonly isLast = computed(() => this.index() === this.steps().length - 1);
  readonly forceMore = computed(() => !!this.current()?.openMore);

  /** À appeler à la fin de l'onboarding. */
  markPending() {
    try {
      localStorage.setItem(KEY, '1');
    } catch {
      /* ignore */
    }
  }

  /** Relancer le tuto à la demande (ex. depuis le profil). */
  replay() {
    this.active.set(false);
    this.markPending();
    this.startIfPending();
  }

  startIfPending() {
    let pending = false;
    try {
      pending = localStorage.getItem(KEY) === '1';
    } catch {
      /* ignore */
    }
    if (this.active() || !pending) return;

    // Petit délai : laisse la navbar se rendre avant de chercher les cibles.
    setTimeout(() => {
      // On ignore les étapes dont l'élément n'existe pas dans le DOM.
      this.steps.set(ALL_STEPS.filter((s) => !s.target || document.querySelector(s.target)));
      this.index.set(0);
      this.active.set(true);
    }, 600);
  }

  next() {
    if (this.isLast()) this.finish();
    else this.index.update((i) => i + 1);
  }

  prev() {
    this.index.update((i) => Math.max(0, i - 1));
  }

  finish() {
    this.active.set(false);
    try {
      localStorage.removeItem(KEY);
    } catch {}
  }
}
