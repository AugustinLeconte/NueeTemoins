import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export type LetterState = 'CORRECT' | 'PRESENT' | 'ABSENT';
export interface GuessRow { word: string; states: LetterState[]; }
export interface GameState {
  lang: string; wordLength: number; maxAttempts: number;
  status: 'IN_PROGRESS' | 'WON' | 'LOST';
  guesses: GuessRow[]; solution: string | null; xpAwarded: number;
}
export interface LeaderboardEntry { rank: number; player: string; won: boolean; attempts: number; xp: number; }

@Injectable({ providedIn: 'root' })
export class WordleService {
  private http = inject(HttpClient);
  private base = `${environment.api}minigames/wordle`;

  public today(lang: string): Observable<GameState> {
    return this.http.get<GameState>(`${this.base}/today`, { params: { lang } });
  }

  public guess(lang: string, guess: string): Observable<GameState> {
    return this.http.post<GameState>(`${this.base}/guess`, { guess }, { params: { lang } });
  }

  public leaderboard(): Observable<LeaderboardEntry[]> {
    return this.http.get<LeaderboardEntry[]>(`${this.base}/leaderboard`);
  }
}
