import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

interface Summary { friendRequests: number; }

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private http = inject(HttpClient);
  private base = `${environment.api}notifications`;
  private timer?: ReturnType<typeof setInterval>;

  readonly friendRequests = signal(0);

  start() {
    if (this.timer) return;
    this.refresh();
    this.timer = setInterval(() => { if (!document.hidden) this.refresh(); }, 30_000);
    document.addEventListener('visibilitychange', this.onVisibility);
  }

  stop() {
    clearInterval(this.timer);
    this.timer = undefined;
    document.removeEventListener('visibilitychange', this.onVisibility);
    this.friendRequests.set(0);
  }

  async refresh() {
    try {
      const s = await firstValueFrom(this.http.get<Summary>(`${this.base}/summary`));
      this.friendRequests.set(s.friendRequests);
    } catch { }
  }

  private onVisibility = () => { if (!document.hidden) this.refresh(); };
}
