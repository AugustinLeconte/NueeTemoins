import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { IonButtons, IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';
import { UserAvatarComponent } from '../../../shared/user-avatar/user-avatar.component';
import { MinigameLeaderboardComponent } from '../minigame-leaderboard/minigame-leaderboard.component';
import { MinigameResultComponent } from '../minigame-result/minigame-result.component';
import { CardName, GuessCardService, GuessState } from './guess-card.service';
import { MinigameToast } from '../minigame-toast.service';
import { LeaderboardRow, norm } from '../minigame.model';

@Component({
  selector: 'app-guess-card',
  standalone: true,
  imports: [
    TranslocoPipe,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    NavbarComponent,
    UserAvatarComponent,
    MinigameLeaderboardComponent,
    MinigameResultComponent,
  ],
  templateUrl: './guess-card.page.html',
  styleUrls: ['./guess-card.page.scss'],
})
export class GuessCardPage implements OnInit {
  private api = inject(GuessCardService);
  private i18n = inject(TranslocoService);
  private toast = inject(MinigameToast);

  lang = (this.i18n.getActiveLang() || 'en').slice(0, 2);

  state = signal<GuessState | null>(null);
  names = signal<CardName[]>([]);
  leaderboard = signal<LeaderboardRow[]>([]);
  query = signal('');
  selected = signal<CardName | null>(null);
  busy = signal(false);
  viewLevel = signal<number | null>(null);

  finished = computed(() => this.state()?.status === 'FINISHED');
  shown = computed(() => {
    const s = this.state();
    if (!s) return null;
    const lvl = this.viewLevel() ?? (s.currentLevel || s.rounds.length);
    return s.rounds[lvl - 1];
  });
  found = computed(() => this.state()?.rounds.filter((r) => r.status === 'WON').length ?? 0);

  suggestions = computed(() => {
    const q = norm(this.query());
    if (!q || this.selected()) return [];
    const wrong = new Set(this.shown()?.wrong.map((w) => w.id));
    return this.names()
      .filter((n) => !wrong.has(n.id) && norm(n.name).includes(q))
      .sort((a, b) => +norm(b.name).startsWith(q) - +norm(a.name).startsWith(q))
      .slice(0, 6);
  });

  ngOnInit() {
    this.api.cards(this.lang).subscribe((n) => this.names.set(n));
    this.api.today(this.lang).subscribe((s) => {
      this.state.set(s);
      if (s.status === 'FINISHED') this.loadLeaderboard();
    });
  }

  onInput(value: string) {
    this.query.set(value);
    this.selected.set(null);
  }
  pick(n: CardName) {
    this.selected.set(n);
    this.query.set(n.name);
  }

  submit() {
    if (this.busy() || this.shown()?.status !== 'IN_PROGRESS') return;
    const n = this.selected() ?? this.names().find((x) => norm(x.name) === norm(this.query()));
    if (!n) {
      void this.toast.say('UNKNOWN_CARD');
      return;
    }

    this.busy.set(true);
    const lvl = this.shown()!.level;
    this.api.guess(this.lang, n.id).subscribe({
      next: (s) => {
        this.state.set(s);
        this.viewLevel.set(lvl); // on reste sur le niveau pour voir le résultat
        this.query.set('');
        this.selected.set(null);
        this.busy.set(false);
        if (s.status === 'FINISHED') this.loadLeaderboard();
      },
      error: (err: HttpErrorResponse) => {
        this.busy.set(false);
        this.toast.fromError(err);
      },
    });
  }

  private loadLeaderboard() {
    this.api.leaderboard().subscribe((l) => this.leaderboard.set(l));
  }
}
