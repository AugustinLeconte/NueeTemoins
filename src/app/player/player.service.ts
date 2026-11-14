import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { PackResult, PlayerCard, ShopItem, Wallet } from './player.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PlayerService {
  private http = inject(HttpClient);
  private base = `${environment.api}me`;

  wallet() { return this.http.get<Wallet>(`${this.base}/wallet`); }
  collection() { return this.http.get<PlayerCard[]>(`${this.base}/collection`); }

  equip(cardPublicId: string, artPublicId: string) {
    return this.http.put<void>(`${this.base}/cards/${cardPublicId}/equipped-art`, { artPublicId });
  }

  upgrade(cardPublicId: string) {
    return this.http.post<{ level: number; fragments: number }>(`${this.base}/cards/${cardPublicId}/upgrade`, {});
  }

  openDaily() { return this.http.post<PackResult>(`${this.base}/packs/daily`, {}); }

  shop() { return this.http.get<ShopItem[]>(`${this.base}/shop`); }
  buy(artPublicId: string) { return this.http.post<Wallet>(`${this.base}/shop/arts/${artPublicId}/buy`, {}); }
}
