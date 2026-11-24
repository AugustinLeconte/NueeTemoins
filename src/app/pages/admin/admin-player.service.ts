import { inject, Injectable } from '@angular/core';
import { PlayerProgress } from '../../player/player.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Role } from '../profile/profile.service';

export interface AdminPlayer {
  userId: string;
  pseudo: string;
  country: string;
  coins: number;
  packs: number;
  xp: number;
  progress: PlayerProgress;
  dailyAvailable: boolean;
  role: Role;
}

@Injectable({ providedIn: 'root' })
export class AdminPlayerService {
  private http = inject(HttpClient);
  private base = `${environment.api}admin/players`;
  list(q = '', page = 0) {
    return this.http.get<AdminPlayer[]>(this.base, { params: { q, page } });
  }
  gift(id: string, g: { packs: number; coins: number; xp: number }) {
    return this.http.post<AdminPlayer>(`${this.base}/${id}/gifts`, g);
  }
  resetDaily(id: string) {
    return this.http.post<AdminPlayer>(`${this.base}/${id}/reset-daily`, {});
  }
  remove(id: string) {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
  setRole(id: string, role: Role) {
    return this.http.put<void>(`${this.base}/${id}/role`, { role });
  }
}
