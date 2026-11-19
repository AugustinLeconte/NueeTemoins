// src/app/tutorial/tutorial-overlay.component.ts
import { Component, HostListener, OnInit, computed, effect, inject, signal } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { TutorialService, TutorialStep } from '../tutorial.service';

const PAD = 6;
const GAP = 16;

@Component({
  selector: 'app-tutorial-overlay',
  imports: [TranslocoPipe],
  templateUrl: './tutorial-overlay.component.html',
  styleUrls: ['./tutorial-overlay.component.scss'],
})
export class TutorialOverlayComponent implements OnInit {
  protected tutorial = inject(TutorialService);
  private rect = signal<DOMRect | null>(null);

  spotlightStyle = computed(() => {
    const r = this.rect();
    if (!r) return { top: '50%', left: '50%', width: '0px', height: '0px' };
    return {
      top: `${r.top - PAD}px`,
      left: `${r.left - PAD}px`,
      width: `${r.width + PAD * 2}px`,
      height: `${r.height + PAD * 2}px`,
    };
  });

  bubbleStyle = computed(() => {
    const r = this.rect();
    if (!r) return {}; // centrée (voir le CSS par défaut)

    const desktop = window.innerWidth >= 768;
    if (desktop && r.right < window.innerWidth / 3) {
      // menu latéral : la bulle s'affiche à droite de l'élément
      return { left: `${r.right + PAD + GAP}px`, top: `${Math.max(16, r.top - 20)}px`, transform: 'none' };
    }
    if (r.top > window.innerHeight / 2) {
      // élément en bas (navbar mobile) : bulle au-dessus
      return {
        left: '50%',
        top: 'auto',
        bottom: `${window.innerHeight - r.top + PAD + GAP}px`,
        transform: 'translateX(-50%)',
      };
    }
    return { left: '50%', top: `${r.bottom + PAD + GAP}px`, transform: 'translateX(-50%)' };
  });

  constructor() {
    effect((onCleanup) => {
      const step = this.tutorial.current();
      // Délai plus long quand le popup "Plus" doit finir de s'ouvrir.
      const t = setTimeout(() => this.measure(step), step?.openMore ? 350 : 0);
      onCleanup(() => clearTimeout(t));
    });
  }

  ngOnInit() {
    this.tutorial.startIfPending();
  }

  @HostListener('window:resize')
  onResize() {
    this.measure(this.tutorial.current());
  }

  private measure(step: TutorialStep | null) {
    if (!step?.target) {
      this.rect.set(null);
      return;
    }

    const rects = Array.from(document.querySelectorAll<HTMLElement>(step.target))
      .map((el) => el.getBoundingClientRect())
      .filter((r) => r.width > 0 && r.height > 0);

    if (!rects.length) {
      this.rect.set(null);
      return;
    }

    const top = Math.min(...rects.map((r) => r.top));
    const left = Math.min(...rects.map((r) => r.left));
    const right = Math.max(...rects.map((r) => r.right));
    const bottom = Math.max(...rects.map((r) => r.bottom));

    this.rect.set(new DOMRect(left, top, right - left, bottom - top));
  }
}
