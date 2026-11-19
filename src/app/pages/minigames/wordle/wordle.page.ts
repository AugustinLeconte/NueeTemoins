import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, HostListener, OnInit, computed, inject, signal } from '@angular/core';
import { IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, ToastController } from '@ionic/angular';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco'; // ancienne version : '@ngneat/transloco'
import { firstValueFrom } from 'rxjs';
import { GameState, LeaderboardEntry, LetterState, WordleService } from './wordle.service';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';
import { UserAvatarComponent } from '../../../shared/user-avatar/user-avatar.component';
import { MinigameLeaderboardComponent } from '../minigame-leaderboard/minigame-leaderboard.component';
import { MinigameResultComponent } from '../minigame-result/minigame-result.component';

interface Cell {
  letter: string;
  state: LetterState | 'EMPTY' | 'TYPING';
}

const LAYOUTS: Record<string, string[]> = {
  fr: ['AZERTYUIOP', 'QSDFGHJKLM', 'WXCVBN'],
  es: ['QWERTYUIOP', 'ASDFGHJKLÑ', 'ZXCVBNM'],
  en: ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'],
};
const RANK: Record<string, number> = { ABSENT: 1, PRESENT: 2, CORRECT: 3 };

// Codes d'erreur connus (clés sous minigames.errors.*) + repli sur le statut HTTP
const KNOWN_ERRORS = ['WRONG_LENGTH', 'UNKNOWN_WORD', 'ALREADY_FINISHED', 'FINISH_FIRST'];
const STATUS_TO_ERROR: Record<number, string> = { 400: 'WRONG_LENGTH', 409: 'ALREADY_FINISHED', 422: 'UNKNOWN_WORD' };

@Component({
  selector: 'app-wordle',
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
    MinigameResultComponent,
    MinigameLeaderboardComponent,
  ],
  templateUrl: './wordle.page.html',
  styleUrls: ['./wordle.page.scss'],
})
export class WordlePage implements OnInit {
  private api = inject(WordleService);
  private toast = inject(ToastController);
  private i18n = inject(TranslocoService);
  private destroyRef = inject(DestroyRef);

  private now = signal(Date.now());
  private syncedAt = signal(Date.now());

  lang = (this.i18n.getActiveLang() || 'en').slice(0, 2);

  state = signal<GameState | null>(null);
  typed = signal('');
  busy = signal(false);
  leaderboard = signal<LeaderboardEntry[]>([]);

  finished = computed(() => (this.state()?.status ?? 'IN_PROGRESS') !== 'IN_PROGRESS');
  layout = computed(() => LAYOUTS[this.state()?.lang ?? this.lang] ?? LAYOUTS['en']);

  board = computed<Cell[][]>(() => {
    const s = this.state();
    if (!s) return [];
    return Array.from({ length: s.maxAttempts }, (_, r) => {
      if (r < s.guesses.length) {
        const g = s.guesses[r];
        return [...g.word].map((letter, i) => ({ letter, state: g.states[i] }));
      }
      const typing = r === s.guesses.length && !this.finished() ? this.typed() : '';
      return Array.from(
        { length: s.wordLength },
        (_, i) => ({ letter: typing[i] ?? '', state: typing[i] ? 'TYPING' : 'EMPTY' }) as Cell,
      );
    });
  });

  keyStates = computed(() => {
    const map: Record<string, LetterState> = {};
    for (const g of this.state()?.guesses ?? []) {
      [...g.word].forEach((l, i) => {
        if (!map[l] || RANK[g.states[i]] > RANK[map[l]]) map[l] = g.states[i];
      });
    }
    return map;
  });

  ngOnInit() {
    const timer = setInterval(() => this.now.set(Date.now()), 1000);
    this.destroyRef.onDestroy(() => clearInterval(timer));

    this.api.today(this.lang).subscribe((s) => {
      this.setState(s);
      if (this.isDone(s)) this.loadLeaderboard();
    });
  }

  @HostListener('window:keydown', ['$event'])
  onKeydown(e: KeyboardEvent) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === 'Enter') this.press('ENTER');
    else if (e.key === 'Backspace') this.press('DEL');
    else if (e.key.length === 1) this.press(e.key.normalize('NFD').replace(/\p{M}/gu, '').toUpperCase());
  }

  press(key: string) {
    const s = this.state();
    if (!s || this.finished() || this.busy()) return;
    if (key === 'DEL') this.typed.update((t) => t.slice(0, -1));
    else if (key === 'ENTER') this.submit();
    else if (/^[A-ZÑ]$/.test(key) && this.typed().length < s.wordLength) this.typed.update((t) => t + key);
  }

  private submit(): void {
    const s = this.state()!;
    if (this.typed().length !== s.wordLength) {
      void this.say('WRONG_LENGTH');
      return;
    }
    this.busy.set(true);
    this.api.guess(this.lang, this.typed()).subscribe({
      next: (ns) => {
        this.state.set(ns);
        this.typed.set('');
        this.busy.set(false);
        if (this.isDone(ns)) this.loadLeaderboard();
      },
      error: (err: HttpErrorResponse) => {
        this.busy.set(false);
        const code = err.error?.message ?? err.error?.reason;
        void this.say(KNOWN_ERRORS.includes(code) ? code : (STATUS_TO_ERROR[err.status] ?? 'ERROR'));
      },
    });
  }

  private isDone(s: GameState) {
    return s.status !== 'IN_PROGRESS';
  }
  private loadLeaderboard() {
    this.api.leaderboard().subscribe((l) => this.leaderboard.set(l));
  }

  private async say(code: string): Promise<void> {
    const message = await firstValueFrom(this.i18n.selectTranslate(`minigames.errors.${code}`));
    (await this.toast.create({ message, duration: 1500, position: 'top' })).present();
  }

  elapsedMs = computed(() => {
    const s = this.state();
    if (!s) return 0;
    if (this.finished()) return s.durationMs;
    return s.durationMs + Math.min(this.now() - this.syncedAt(), 60_000);
  });

  private setState(s: GameState) {
    this.state.set(s);
    this.syncedAt.set(Date.now());
    this.now.set(Date.now());
  }

  fmt(ms: number): string {
    const t = Math.floor(ms / 1000);
    return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
  }
}
