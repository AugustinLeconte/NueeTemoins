// friends/friends.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';

export interface Friend { id: number; pseudo: string; country: string; }
export interface FriendsOverview { friends: Friend[]; incoming: Friend[]; outgoing: Friend[]; }

@Injectable({ providedIn: 'root' })
export class FriendsService {
  private http = inject(HttpClient);
  private base = `${environment.api}friends`;

  overview()               { return this.http.get<FriendsOverview>(this.base); }
  sendRequest(pseudo: string) { return this.http.post<void>(`${this.base}/requests`, { pseudo }); }
  accept(id: number)       { return this.http.post<void>(`${this.base}/${id}/accept`, {}); }
  remove(id: number)       { return this.http.delete<void>(`${this.base}/${id}`); }
  search(q: string) { return this.http.get<string[]>(`${this.base}/search`, { params: { q } }); }
}
