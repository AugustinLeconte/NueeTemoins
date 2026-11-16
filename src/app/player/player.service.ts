import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { PackOffer, PackResult, PlayerCard, PlayerProgress, ShopItem, UpgradeResult, Wallet } from './player.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PlayerService {
  private http = inject(HttpClient);
  private base = `${environment.api}me`;

  progress() { return this.http.get<PlayerProgress>(`${this.base}/progress`); }
  wallet() { return this.http.get<Wallet>(`${this.base}/wallet`); }
  collection() { return this.http.get<PlayerCard[]>(`${this.base}/collection`); }

  equip(cardPublicId: string, artPublicId: string) {
    return this.http.put<void>(`${this.base}/cards/${cardPublicId}/equipped-art`, { artPublicId });
  }

  upgrade(cardPublicId: string) {
    return this.http.post<UpgradeResult>(`${this.base}/cards/${cardPublicId}/upgrade`, {});
  }

  openDaily() { return this.http.post<PackResult>(`${this.base}/packs/daily`, {}); }

  packOffers() { return this.http.get<PackOffer[]>(`${this.base}/shop/packs`); }
  openLevelPack(level: number) {
    return this.http.post<PackResult>(`${this.base}/shop/packs/${level}/open`, {});
  }

  shop() { return this.http.get<ShopItem[]>(`${this.base}/shop`); }
  buy(artPublicId: string) { return this.http.post<Wallet>(`${this.base}/shop/arts/${artPublicId}/buy`, {}); }
}
