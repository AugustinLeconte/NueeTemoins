import { firstValueFrom } from 'rxjs';
import { CardName, GuessCardService } from '../../minigames/guess-card/guess-card.service';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { Component, computed, inject, input, OnInit, output, signal } from '@angular/core';
import { ProfileService } from '../profile.service';
import { norm } from '../../minigames/minigame.model';

@Component({
  selector: 'app-patron-picker',
  standalone: true,
  imports: [TranslocoPipe],
  templateUrl: './patron-picker.component.html',
  styleUrls: ['./patron-picker.component.scss'],
})
export class PatronPickerComponent implements OnInit {
  private cards = inject(GuessCardService);
  private profiles = inject(ProfileService);
  private i18n = inject(TranslocoService);
  private lang = (this.i18n.getActiveLang() || 'en').slice(0, 2);

  current = input<string | null>(null);
  changed = output<string | null>();

  names = signal<CardName[]>([]);
  query = signal('');
  selected = signal<CardName | null>(null);
  saving = signal(false);

  currentName = computed(() => this.names().find((n) => n.id === this.current())?.name ?? null);

  suggestions = computed(() => {
    const q = norm(this.query());
    if (!q || this.selected()) return [];
    return this.names()
      .filter((n) => norm(n.name).includes(q))
      .sort((a, b) => +norm(b.name).startsWith(q) - +norm(a.name).startsWith(q))
      .slice(0, 6);
  });

  ngOnInit() {
    this.cards.cards(this.lang).subscribe((n) => this.names.set(n));
  }

  onInput(v: string) {
    this.query.set(v);
    this.selected.set(null);
  }
  pick(n: CardName) {
    this.selected.set(n);
    this.query.set(n.name);
  }

  save() {
    const n = this.selected();
    if (n) this.apply(n.id);
  }
  clear() {
    this.apply(null);
  }

  private async apply(id: string | null) {
    this.saving.set(true);
    try {
      await firstValueFrom(this.profiles.setPatron(id));
      this.changed.emit(id);
      this.query.set('');
      this.selected.set(null);
    } finally {
      this.saving.set(false);
    }
  }
}
