import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { LeaderboardRow } from '../minigame.model';

export interface Tile {
  index: number;
  cardId: string;
  imageUrl: string;
  name: string;
}
export interface MemoryState {
  size: number;
  status: 'IN_PROGRESS' | 'FINISHED';
  moves: number;
  matched: Tile[];
  pending: Tile | null;
  xpAwarded: number;
  durationMs: number;
}
export interface FlipResult {
  revealed: Tile;
  firstIndex: number | null;
  match: boolean | null;
  state: MemoryState;
}

@Injectable({ providedIn: 'root' })
export class MemoryService {
  private http = inject(HttpClient);
  private base = `${environment.api}minigames/memory`;

  today(lang: string): Observable<MemoryState> {
    return this.http.get<MemoryState>(`${this.base}/today`, { params: { lang } });
  }
  flip(lang: string, index: number): Observable<FlipResult> {
    return this.http.post<FlipResult>(`${this.base}/flip`, { index }, { params: { lang } });
  }
  leaderboard(): Observable<LeaderboardRow[]> {
    return this.http.get<LeaderboardRow[]>(`${this.base}/leaderboard`);
  }
}
