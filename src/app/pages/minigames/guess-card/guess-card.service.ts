import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { LeaderboardRow } from '../minigame.model';

export interface CardName {
  id: string;
  name: string;
}
export interface Round {
  level: number;
  status: 'LOCKED' | 'IN_PROGRESS' | 'WON' | 'LOST';
  grayscale: boolean;
  rotation: number;
  zoom: number;
  originX: number;
  originY: number;
  wrongCount: number;
  imageUrl: string | null;
  wrong: CardName[];
  answer: CardName | null;
  xp: number;
}
export interface GuessState {
  status: 'IN_PROGRESS' | 'FINISHED';
  maxGuesses: number;
  currentLevel: number;
  rounds: Round[];
  xpAwarded: number;
  durationMs: number;
}

@Injectable({ providedIn: 'root' })
export class GuessCardService {
  private http = inject(HttpClient);
  private base = `${environment.api}minigames/guess-card`;

  today(lang: string): Observable<GuessState> {
    return this.http.get<GuessState>(`${this.base}/today`, { params: { lang } });
  }
  guess(lang: string, cardId: string): Observable<GuessState> {
    return this.http.post<GuessState>(`${this.base}/guess`, { cardId }, { params: { lang } });
  }
  cards(lang: string): Observable<CardName[]> {
    return this.http.get<CardName[]>(`${this.base}/cards`, { params: { lang } });
  }
  leaderboard(): Observable<LeaderboardRow[]> {
    return this.http.get<LeaderboardRow[]>(`${this.base}/leaderboard`);
  }
}
