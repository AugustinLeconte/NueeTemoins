import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonButton,
         IonBadge, IonSpinner, IonChip, IonLabel } from '@ionic/angular';
import { CardViewComponent } from '../../cards/card-view/card-view.component';
import { LevelBarComponent } from '../../player/level-bar/level-bar.component';
import { PlayerService } from '../../player/player.service';
import { PackOffer, PlayerProgress, ShopItem, Wallet } from '../../player/player.model';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonButton,
            IonBadge, IonSpinner, IonChip, IonLabel, CardViewComponent, LevelBarComponent],
  templateUrl: './shop.page.html',
  styleUrls: ['./shop.page.scss'],
})
export class ShopPage {
  private player = inject(PlayerService);
  private router = inject(Router);

  loading = signal(true);
  error = signal('');
  wallet = signal<Wallet | null>(null);
  progress = signal<PlayerProgress | null>(null);
  offers = signal<PackOffer[]>([]);
  items = signal<ShopItem[]>([]);
  buying = signal<string | null>(null);

  available = computed(() => this.offers().filter(o => o.status === 'AVAILABLE'));
  locked = computed(() => this.offers().filter(o => o.status === 'LOCKED'));
  openedCount = computed(() => this.offers().filter(o => o.status === 'OPENED').length);

  ionViewWillEnter() { this.load(); }

  private load() {
    forkJoin({
      wallet: this.player.wallet(),
      progress: this.player.progress(),
      offers: this.player.packOffers(),
      items: this.player.shop(),
    }).subscribe({
      next: r => {
        this.wallet.set(r.wallet);
        this.progress.set(r.progress);
        this.offers.set(r.offers);
        this.items.set(r.items);
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

  canBuy(it: ShopItem) { return !it.owned && (this.wallet()?.coins ?? 0) >= it.price && !this.buying(); }

  buy(it: ShopItem) {
    if (!this.canBuy(it)) return;
    this.buying.set(it.art.publicId);
    this.player.buy(it.art.publicId).subscribe({
      next: () => { this.buying.set(null); this.load(); },
      error: (e: HttpErrorResponse) => {
        this.buying.set(null);
        this.error.set(e.status === 409 ? 'Pièces insuffisantes ou illustration déjà possédée.' : "Achat impossible.");
      },
    });
  }
}
