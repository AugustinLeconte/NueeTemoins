import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, HostListener, OnInit, computed, inject, signal } from '@angular/core';
import {
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonNote,
  IonTitle,
  IonToolbar,
  ToastController,
} from '@ionic/angular';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco'; // ancienne version : '@ngneat/transloco'
import { firstValueFrom } from 'rxjs';
import { GameState, LeaderboardEntry, LetterState, WordleService } from './wordle.service';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';
import { UserAvatarComponent } from '../../../shared/user-avatar/user-avatar.component';
import { injectCountdown } from '../../../shared/countdown';
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

// Codes d'erreur connus (clés sous wordle.errors.*) + repli sur le statut HTTP
const KNOWN_ERRORS = ['WRONG_LENGTH', 'UNKNOWN_WORD', 'ALREADY_FINISHED', 'FINISH_FIRST'];
const STATUS_TO_ERROR: Record<number, string> = { 400: 'WRONG_LENGTH', 409: 'ALREADY_FINISHED', 422: 'UNKNOWN_WORD' };

@Component({
  selector: 'app-wordle',
  standalone: true,
  imports: [
    CommonModule,
    TranslocoPipe,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonListHeader,
    IonItem,
    IonLabel,
    IonNote,
    NavbarComponent,
    UserAvatarComponent,
    IonButtons,
  ],
  templateUrl: './wordle.page.html',
  styleUrls: ['./wordle.page.scss'],
})
export class WordlePage implements OnInit {
  private api = inject(WordleService);
  private toast = inject(ToastController);
  private i18n = inject(TranslocoService);
  private destroyRef = inject(DestroyRef);

  /** Langue de l'appli (ex. "fr", "en-US" -> "en"). Le serveur retombe sur l'anglais si non supportée. */
  lang = (this.i18n.getActiveLang() || 'en').slice(0, 2);

  state = signal<GameState | null>(null);
  typed = signal('');
  busy = signal(false);
  leaderboard = signal<LeaderboardEntry[]>([]);

  finished = computed(() => (this.state()?.status ?? 'IN_PROGRESS') !== 'IN_PROGRESS');
  layout = computed(() => LAYOUTS[this.state()?.lang ?? this.lang] ?? LAYOUTS['en']);

  countdown = injectCountdown();

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

  constructor() {}

  ngOnInit() {
    this.api.today(this.lang).subscribe((s) => {
      this.state.set(s);
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
    const message = await firstValueFrom(this.i18n.selectTranslate(`wordle.errors.${code}`));
    (await this.toast.create({ message, duration: 1500, position: 'top' })).present();
  }
}
