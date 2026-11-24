import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom, forkJoin } from 'rxjs';
import { Capacitor } from '@capacitor/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonBadge,
  IonSpinner,
  IonButtons,
} from '@ionic/angular';
import { CardViewComponent } from '../../cards/card-view/card-view.component';
import { PlayerService } from '../../player/player.service';
import { PackOffer, Wallet } from '../../player/player.model';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { ShopService } from './shop.service';
import { FreeOffers, ShopItem } from './shop.model';
import { AdProvider } from '../../ads/ad-provider';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { UserAvatarComponent } from '../../shared/user-avatar/user-avatar.component';
import { CurrencyBarComponent } from '../../shared/currency-bar/currency-bar.component';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonBadge,
    IonSpinner,
    IonButtons,
    CardViewComponent,
    NavbarComponent,
    TranslocoPipe,
    UserAvatarComponent,
    CurrencyBarComponent,
  ],
  templateUrl: './shop.page.html',
  styleUrls: ['./shop.page.scss'],
})
export class ShopPage {
  private player = inject(PlayerService);
  private shop = inject(ShopService);
  private router = inject(Router);
  private transloco = inject(TranslocoService);
  public ads = inject(AdProvider);

  public loading = signal(true);
  public error = signal('');
  public wallet = signal<Wallet | null>(null);
  public offers = signal<PackOffer[]>([]);
  public items = signal<ShopItem[]>([]);
  public free = signal<FreeOffers | null>(null);
  public claimingLevel = signal<number | null>(null);
  public packPrice = signal(0);
  public buyingPack = signal(false);

  public buying = signal<string | null>(null);
  public claiming = signal(false);
  public adLoading = signal(false);

  public isNative = Capacitor.isNativePlatform();

  public claimed = computed(() => this.offers().filter((o) => o.status === 'CLAIMED'));
  public available = computed(() => this.offers().filter((o) => o.status === 'AVAILABLE'));
  public locked = computed(() => this.offers().filter((o) => o.status === 'LOCKED'));

  ionViewWillEnter() {
    this.load();
  }

  private load() {
    forkJoin({
      wallet: this.player.wallet(),
      offers: this.player.packOffers(),
      items: this.shop.items(),
      free: this.shop.freeOffers(),
      price: this.shop.packPrice(),
    }).subscribe({
      next: (r) => {
        this.wallet.set(r.wallet);
        this.offers.set(r.offers);
        this.items.set(r.items);
        this.free.set(r.free);
        this.error.set('');
        this.packPrice.set(r.price.price);
        this.loading.set(false);
      },
      error: (e: HttpErrorResponse) => {
        if (e.status === 404) {
          this.router.navigateByUrl('/onboarding');
          return;
        }
        this.error.set(this.transloco.translate('shop.errors.loadFailed'));
        this.loading.set(false);
      },
    });
  }

  packLabel(o: PackOffer) {
    return o.packType === 'PREMIUM'
      ? this.transloco.translate('shop.packs.premium')
      : this.transloco.translate('shop.packs.standard');
  }

  claimPack(o: PackOffer) {
    if (this.claimingLevel() !== null) return;
    this.claimingLevel.set(o.level);
    this.player.claimLevelPack(o.level).subscribe({
      next: (offers) => {
        this.offers.set(offers);
        this.wallet.update((w) => (w ? { ...w, packs: w.packs + 1 } : w));
        this.claimingLevel.set(null);
      },
      error: () => {
        this.claimingLevel.set(null);
        this.error.set(this.transloco.translate('shop.errors.claimFailed'));
        this.load();
      },
    });
  }

  canBuyPack() {
    return !this.buyingPack() && (this.wallet()?.coins ?? 0) >= this.packPrice();
  }

  buyPack() {
    if (!this.canBuyPack()) return;
    this.buyingPack.set(true);
    this.shop.buyPack().subscribe({
      next: (w) => {
        this.wallet.set(w);
        this.player.walletState.set(w); // met à jour l'en-tête
        this.buyingPack.set(false);
      },
      error: (e: HttpErrorResponse) => {
        this.buyingPack.set(false);
        this.error.set(
          this.transloco.translate(e.status === 409 ? 'shop.errors.notEnoughCoins' : 'shop.errors.buyFailed'),
        );
      },
    });
  }

  // ----- Illustrations -----
  canBuy(it: ShopItem) {
    return !it.owned && (this.wallet()?.coins ?? 0) >= it.price && !this.buying();
  }

  buy(it: ShopItem) {
    if (!this.canBuy(it)) return;
    this.buying.set(it.art.publicId);
    this.shop.buy(it.art.publicId).subscribe({
      next: () => {
        this.buying.set(null);
        this.load();
      },
      error: (e: HttpErrorResponse) => {
        this.buying.set(null);
        this.error.set(
          e.status === 409
            ? this.transloco.translate('shop.errors.alreadyOwnedOrPoor')
            : this.transloco.translate('shop.errors.buyFailed'),
        );
      },
    });
  }

  // ----- Offres gratuites -----
  claimDaily() {
    if (this.claiming()) return;
    this.claiming.set(true);
    this.shop.claimDaily().subscribe({
      next: () => {
        this.claiming.set(false);
        this.load();
      },
      error: () => {
        this.claiming.set(false);
        this.error.set(this.transloco.translate('shop.errors.alreadyClaimed'));
      },
    });
  }

  async watchAd() {
    if (this.adLoading()) return;
    this.adLoading.set(true);
    try {
      const result = await this.ads.showRewarded();
      if (result !== 'rewarded') {
        this.error.set(
          this.transloco.translate(result === 'dismissed' ? 'shop.errors.adNotCompleted' : 'shop.errors.adUnavailable'),
        );
        return;
      }
      await firstValueFrom(this.shop.claimAd());
      this.load();
    } catch (e) {
      const status = (e as HttpErrorResponse).status;
      this.error.set(
        this.transloco.translate(
          status === 429
            ? 'shop.errors.adWait'
            : status === 409
              ? 'shop.errors.adLimitReached'
              : 'shop.errors.adUnavailable',
        ),
      );
    } finally {
      this.adLoading.set(false);
    }
  }
}
