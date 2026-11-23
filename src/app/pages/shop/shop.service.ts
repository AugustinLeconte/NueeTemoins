import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { tap } from 'rxjs';
import { FreeOffers, ShopItem } from './shop.model';
import { AchievementToastService } from '../../achievements/achievement-toast.service';
import { environment } from '../../../environments/environment';
import { Wallet } from '../../player/player.model';

@Injectable({ providedIn: 'root' })
export class ShopService {
  private http = inject(HttpClient);
  private toasts = inject(AchievementToastService);
  private base = `${environment.api}me/shop`;

  public items() {
    return this.http.get<ShopItem[]>(this.base);
  }

  public buy(artPublicId: string) {
    return this.http
      .post<Wallet>(`${this.base}/arts/${artPublicId}/buy`, {})
      .pipe(tap((r) => this.toasts.show(r.newAchievements)));
  }

  public freeOffers() {
    return this.http.get<FreeOffers>(`${this.base}/free`);
  }

  public claimDaily() {
    return this.http.post<Wallet>(`${this.base}/free/daily`, {});
  }

  public claimAd() {
    return this.http.post<Wallet>(`${this.base}/free/ad`, {});
  }

  public packPrice() {
    return this.http.get<{ price: number }>(`${this.base}/packs/price`);
  }

  public buyPack() {
    return this.http.post<Wallet>(`${this.base}/packs/buy`, {});
  }
}
