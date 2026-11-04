// card-view.component.ts
import { Component, input, signal } from '@angular/core';

@Component({
  selector: 'app-card-view',
  standalone: true,
  templateUrl: './card-view.component.html',
  styleUrls: ['./card-view.component.scss'],
})
export class CardViewComponent {
  family = input<string>('');
  rarity = input<string>('');
  title = input<string>('');
  subtitle = input<string>('');
  description = input<string>('');
  imageUrl = input<string | null | undefined>(null);

  active = signal(false);

  // Suit le doigt / la souris : inclinaison 3D + position de l'effet holo
  onMove(e: PointerEvent) {
    const el = e.currentTarget as HTMLElement;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;   // 0 → 1
    const y = (e.clientY - r.top) / r.height;   // 0 → 1

    el.style.setProperty('--mx', `${x * 100}%`);
    el.style.setProperty('--my', `${y * 100}%`);
    el.style.setProperty('--rx', `${(0.5 - y) * 16}deg`);
    el.style.setProperty('--ry', `${(x - 0.5) * 16}deg`);
    this.active.set(true);
  }

  onLeave(e: PointerEvent) {
    const el = e.currentTarget as HTMLElement;
    ['--mx', '--my', '--rx', '--ry'].forEach(p => el.style.removeProperty(p));
    this.active.set(false);
  }
}
