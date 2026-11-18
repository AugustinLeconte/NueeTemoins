import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { IonButtons, IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';
import { UserAvatarComponent } from '../../../shared/user-avatar/user-avatar.component';
import { MemoryService, MemoryState, Tile } from './memory.service';
import { MinigameLeaderboardComponent } from '../minigame-leaderboard/minigame-leaderboard.component';
import { MinigameResultComponent } from '../minigame-result/minigame-result.component';
import { MinigameToast } from '../minigame-toast.service';
import { LeaderboardRow } from '../minigame.model';

interface Cell {
  index: number;
  state: 'HIDDEN' | 'SHOWN' | 'MATCHED';
  tile: Tile | null;
}

@Component({
  selector: 'app-memory',
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
  templateUrl: './memory.page.html',
  styleUrls: ['./memory.page.scss'],
})
export class MemoryPage implements OnInit {
  private api = inject(MemoryService);
  private i18n = inject(TranslocoService);
  private toast = inject(MinigameToast);

  lang = (this.i18n.getActiveLang() || 'en').slice(0, 2);

  state = signal<MemoryState | null>(null);
  shown = signal<Record<number, Tile>>({});
  busy = signal(false);
  leaderboard = signal<LeaderboardRow[]>([]);

  finished = computed(() => this.state()?.status === 'FINISHED');

  cells = computed<Cell[]>(() => {
    const s = this.state();
    if (!s) return [];
    const matched = new Map(s.matched.map((t) => [t.index, t]));
    const shown = this.shown();
    return Array.from({ length: s.size }, (_, i): Cell =>
      matched.has(i)
        ? { index: i, state: 'MATCHED', tile: matched.get(i)! }
        : shown[i]
          ? { index: i, state: 'SHOWN', tile: shown[i] }
          : { index: i, state: 'HIDDEN', tile: null },
    );
  });

  ngOnInit() {
    this.api.today(this.lang).subscribe((s) => {
      this.state.set(s);
      if (s.pending) this.shown.set({ [s.pending.index]: s.pending });
      if (s.status === 'FINISHED') this.loadLeaderboard();
    });
  }

  flip(i: number) {
    if (this.busy() || this.finished()) return;
    this.busy.set(true);
    this.api.flip(this.lang, i).subscribe({
      next: (res) => {
        this.state.set(res.state);
        this.shown.update((m) => ({ ...m, [i]: res.revealed }));

        if (res.match === false) {
          // Laisse le temps de mémoriser les 2 cartes avant de les retourner
          setTimeout(() => {
            this.hide([i, res.firstIndex!]);
            this.busy.set(false);
          }, 900);
          return;
        }
        if (res.match === true) this.hide([i, res.firstIndex!]); // elles sont dans state.matched
        this.busy.set(false);
        if (res.state.status === 'FINISHED') this.loadLeaderboard();
      },
      error: (err: HttpErrorResponse) => {
        this.busy.set(false);
        this.toast.fromError(err, { 409: 'ALREADY_FINISHED', 422: 'INVALID_TILE' });
      },
    });
  }

  private hide(indexes: number[]) {
    this.shown.update((m) => {
      const c = { ...m };
      indexes.forEach((i) => delete c[i]);
      return c;
    });
  }

  private loadLeaderboard() {
    this.api.leaderboard().subscribe((l) => this.leaderboard.set(l));
  }
}
