import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { Capacitor } from '@capacitor/core';
import { AdMob, RewardAdPluginEvents } from '@capacitor-community/admob';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton,
         IonBadge, IonSpinner, IonChip, IonLabel } from '@ionic/angular';
import { CardViewComponent } from '../../cards/card-view/card-view.component';
import { PlayerService } from '../../player/player.service';
import { PackOffer, Wallet } from '../../player/player.model';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { environment } from '../../../environments/environment';
import { ShopService } from './shop.service';
import { FreeOffers, ShopItem } from './shop.model';
import { AdProvider } from '../../ads/ad-provider';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButton,
            IonBadge, IonSpinner, IonChip, IonLabel, CardViewComponent, NavbarComponent],
  templateUrl: './shop.page.html',
  styleUrls: ['./shop.page.scss'],
})
export class ShopPage {
  private player = inject(PlayerService);
  private shop = inject(ShopService);
  private router = inject(Router);
  public ads = inject(AdProvider);

  public loading = signal(true);
  public error = signal('');
  public wallet = signal<Wallet | null>(null);
  public offers = signal<PackOffer[]>([]);
  public items = signal<ShopItem[]>([]);
  public free = signal<FreeOffers | null>(null);

  public buying = signal<string | null>(null);
  public claiming = signal(false);
  public adLoading = signal(false);

  public isNative = Capacitor.isNativePlatform();

  available = computed(() => this.offers().filter(o => o.status === 'AVAILABLE'));
  locked = computed(() => this.offers().filter(o => o.status === 'LOCKED'));
  openedCount = computed(() => this.offers().filter(o => o.status === 'OPENED').length);

  ionViewWillEnter() { this.load(); }

  private load() {
    forkJoin({
      wallet: this.player.wallet(),
      offers: this.player.packOffers(),
      items: this.shop.items(),
      free: this.shop.freeOffers(),
    }).subscribe({
      next: r => {
        this.wallet.set(r.wallet);
        this.offers.set(r.offers);
        this.items.set(r.items);
        this.free.set(r.free);
        this.error.set('');
        this.loading.set(false);
      },
      error: (e: HttpErrorResponse) => {
        if (e.status === 404) { this.router.navigateByUrl('/onboarding'); return; }
        this.error.set('Impossible de charger la boutique.');
        this.loading.set(false);
      },
    });
  }

  packLabel(o: PackOffer) { return o.packType === 'PREMIUM' ? 'Pack premium' : 'Pack standard'; }

  openPack(o: PackOffer) {
    this.router.navigate(['/packs'], { queryParams: { level: o.level } });
  }

  // ----- Illustrations -----
  canBuy(it: ShopItem) { return !it.owned && (this.wallet()?.coins ?? 0) >= it.price && !this.buying(); }

  buy(it: ShopItem) {
    if (!this.canBuy(it)) return;
    this.buying.set(it.art.publicId);
    this.shop.buy(it.art.publicId).subscribe({
      next: () => { this.buying.set(null); this.load(); },
      error: (e: HttpErrorResponse) => {
        this.buying.set(null);
        this.error.set(e.status === 409
          ? 'Pièces insuffisantes ou illustration déjà possédée.'
          : 'Achat impossible.');
      },
    });
  }

  // ----- Offres gratuites -----
  claimDaily() {
    if (this.claiming()) return;
    this.claiming.set(true);
    this.shop.claimDaily().subscribe({
      next: () => { this.claiming.set(false); this.load(); },
      error: () => {
        this.claiming.set(false);
        this.error.set('Déjà récupéré aujourd’hui.');
      },
    });
  }

  async watchAd() {
    if (this.adLoading()) return;
    this.adLoading.set(true);
    try {
      const rewarded = await this.ads.showRewarded();
      if (!rewarded) {
        this.error.set('Aucune récompense : regardez la pub jusqu’au bout.');
        return;
      }
      this.shop.claimAd().subscribe({
        next: () => this.load(),
        error: (e: HttpErrorResponse) => this.error.set(
          e.status === 429 ? 'Patientez un peu avant la prochaine pub.'
          : e.status === 409 ? 'Limite de pubs atteinte pour aujourd’hui.'
          : 'Récompense indisponible pour le moment.'),
      });
    } finally {
      this.adLoading.set(false);
    }
  }
}
