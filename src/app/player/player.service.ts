import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Achievement, PackOffer, PackResult, PlayerCard, PlayerProgress, UpgradeResult, Wallet } from './player.model';
import { environment } from '../../environments/environment';
import { AchievementToastService } from '../achievements/achievement-toast.service';
import { tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PlayerService {
  private http = inject(HttpClient);
  private base = `${environment.api}me`;
  private toasts = inject(AchievementToastService);

  readonly walletState = signal<Wallet | null>(null);

  public progress() {
    return this.http.get<PlayerProgress>(`${this.base}/progress`);
  }
  public wallet() {
    return this.http.get<Wallet>(`${this.base}/wallet`).pipe(tap((w) => this.walletState.set(w)));
  }
  public collection() {
    return this.http.get<PlayerCard[]>(`${this.base}/collection`);
  }
  public achievements() {
    return this.http.get<Achievement[]>(`${this.base}/achievements`);
  }

  public equip(cardPublicId: string, artPublicId: string) {
    return this.http.put<void>(`${this.base}/cards/${cardPublicId}/equipped-art`, { artPublicId });
  }

  public upgrade(cardPublicId: string) {
    return this.http
      .post<UpgradeResult>(`${this.base}/cards/${cardPublicId}/upgrade`, {})
      .pipe(tap((r) => this.toasts.show(r.newAchievements)));
  }

  public openDaily() {
    return this.http
      .post<PackResult>(`${this.base}/packs/daily`, {})
      .pipe(tap((r) => this.toasts.show(r.newAchievements)));
  }

  public packOffers() {
    return this.http.get<PackOffer[]>(`${this.base}/shop/packs`);
  }

  public openFromStock() {
    return this.http
      .post<PackResult>(`${this.base}/packs/open`, {})
      .pipe(tap((r) => this.toasts.show(r.newAchievements)));
  }

  public claimLevelPack(level: number) {
    return this.http
      .post<PackOffer[]>(`${this.base}/shop/packs/${level}/claim`, {})
      .pipe(tap(() => this.wallet().subscribe()));
  }
}
