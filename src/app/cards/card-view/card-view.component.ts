import { Component, computed, input, signal } from '@angular/core';
import { Family } from '../../families/family.model';

@Component({
  selector: 'app-card-view',
  standalone: true,
  templateUrl: './card-view.component.html',
  styleUrls: ['./card-view.component.scss'],
})
export class CardViewComponent {
  families = input<Family[]>([]);
  rarity = input<string>('');
  title = input<string>('');
  subtitle = input<string>('');
  description = input<string>('');
  imageUrl = input<string | null | undefined>(null);

  feastMonth = input<number | null | undefined>(null);
  feastDay = input<number | null | undefined>(null);
  locale = input<string>('fr');

  // slug de la première famille : sert au style (couleur, bordure...)
  primaryFamily = computed(() => this.families()[0]?.publicId ?? '');

  // tous les slugs séparés par des espaces : permet [data-families~="fire"] en CSS
  familySlugs = computed(() => this.families().map(f => f.publicId).join(' '));

  feastLabel = computed(() => {
    const m = this.feastMonth();
    const d = this.feastDay();
    if (!m || !d) return '';
    const date = new Date(2000, m - 1, d);
    if (date.getMonth() !== m - 1) return '';
    return new Intl.DateTimeFormat(this.locale(), { day: 'numeric', month: 'long' }).format(date);
  });

  active = signal(false);

  onMove(e: PointerEvent) {
    const el = e.currentTarget as HTMLElement;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;

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
