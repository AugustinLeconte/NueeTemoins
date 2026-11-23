import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

interface GameClock {
  nextResetAt: number;
  serverNow: number;
}

@Injectable({ providedIn: 'root' })
export class GameClockService {
  private http = inject(HttpClient);
  private offsetMs = 0;
  private inflight: Promise<void> | null = null;
  private base = `${environment.api}`;

  readonly nextResetAt = signal<number | null>(null);

  now(): number {
    return Date.now() + this.offsetMs;
  }

  refresh(): Promise<void> {
    if (this.inflight) return this.inflight;
    const t0 = Date.now();
    this.inflight = firstValueFrom(this.http.get<GameClock>(`${this.base}clock`))
      .then((c) => {
        const t1 = Date.now();
        this.offsetMs = c.serverNow - (t0 + t1) / 2;
        this.nextResetAt.set(c.nextResetAt);
      })
      .catch(() => {})
      .finally(() => (this.inflight = null));
    return this.inflight;
  }
}
