import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, forkJoin, map, of, switchMap, timer } from 'rxjs';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonBadge,
  IonSpinner,
  IonProgressBar,
  IonButtons,
} from '@ionic/angular';
import { Card } from '../../cards/card.model';
import { CardViewComponent } from '../../cards/card-view/card-view.component';
import { PlayerService } from '../../player/player.service';
import { DrawnItem, PackOffer, PackResult, PlayerCard, PlayerProgress, Wallet } from '../../player/player.model';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { UserAvatarComponent } from '../../shared/user-avatar/user-avatar.component';
import { injectCountdown } from '../../shared/countdown';

@Component({
  selector: 'app-pack-opening',
  standalone: true,
  imports: [
    RouterLink,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonBadge,
    IonSpinner,
    IonProgressBar,
    CardViewComponent,
    NavbarComponent,
    TranslocoPipe,
    IonButtons,
    UserAvatarComponent,
  ],
  templateUrl: './pack-opening.page.html',
  styleUrls: ['./pack-opening.page.scss'],
})
export class PackOpeningPage {
  private player = inject(PlayerService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private transloco = inject(TranslocoService);

  private static readonly MIN_OPENING_MS = 1400;
  private static readonly BURST_MS = 450;
  private cardInfo = new Map<string, Card>();

  readonly PITY = 10;

  wallet = signal<Wallet | null>(null);
  progress = signal<PlayerProgress | null>(null);
  levelPack = signal<number | null>(null);
  stored = signal<PackOffer[]>([]);
  phase = signal<'idle' | 'opening' | 'burst' | 'reveal'>('idle');
  result = signal<PackResult | null>(null);
  revealed = signal<boolean[]>([]);
  error = signal('');

  countdown = injectCountdown(() => this.refresh());

  storedCount = computed(() => this.stored().length);
  allRevealed = computed(() => this.revealed().length > 0 && this.revealed().every(Boolean));
  pityProgress = computed(() => Math.min(1, (this.wallet()?.packsSinceRare ?? 0) / this.PITY));
  leveledUp = computed(() => {
    const r = this.result();
    return !!r && r.progress.level > r.levelBefore;
  });

  ionViewWillEnter() {
    if (this.phase() === 'opening' || this.phase() === 'burst') return;

    if (this.phase() === 'reveal' && !this.allRevealed()) {
      this.refresh();
      return;
    }

    this.result.set(null);
    this.revealed.set([]);
    this.error.set('');
    this.levelPack.set(null);
    this.phase.set('idle');
    this.refresh();
  }

  private refresh() {
    this.player.wallet().subscribe({ next: (w) => this.wallet.set(w), error: (e) => this.handleError(e) });
    this.player.progress().subscribe({ next: (p) => this.progress.set(p), error: () => {} });
    this.player.packOffers().subscribe({
      next: (offers) => this.stored.set(offers.filter((o) => o.status === 'CLAIMED')),
      error: () => {},
    });
  }

  public open(): void {
    this.error.set('');
    this.phase.set('opening');
    const level = this.levelPack();
    const call$ = level ? this.player.openLevelPack(level) : this.player.openDaily();

    const data$ = call$.pipe(
      switchMap((res) =>
        this.player.collection().pipe(
          catchError(() => of([] as PlayerCard[])),
          map((col) => ({ res, col })),
        ),
      ),
    );

    forkJoin([data$, timer(PackOpeningPage.MIN_OPENING_MS)])
      .pipe(map(([data]) => data))
      .subscribe({
        next: ({ res, col }) => {
          this.cardInfo = new Map(col.map((pc) => [pc.card.publicId, pc.card]));
          this.result.set(res);
          this.revealed.set(res.draws.map(() => false));
          this.wallet.update((w) => ({
            coins: res.coins,
            packsSinceRare: res.packsSinceRare,
            dailyPackAvailable: level ? (w?.dailyPackAvailable ?? false) : false,
          }));
          this.progress.set(res.progress);

          if (level) this.stored.update((s) => s.filter((o) => o.level !== level));

          this.phase.set('burst');
          setTimeout(() => this.phase.set('reveal'), PackOpeningPage.BURST_MS);
        },
        error: (e) => {
          this.phase.set('idle');
          this.handleError(e);
          this.levelPack.set(null);
        },
      });
  }

  cardOf(d: DrawnItem): Card | undefined {
    return d.art ? this.cardInfo.get(d.art.cardPublicId) : undefined;
  }

  canUpgrade(d: DrawnItem) {
    return d.nextUpgradeCost !== null && d.cardFragments !== null && d.cardFragments >= d.nextUpgradeCost;
  }

  reveal(i: number) {
    this.revealed.update((r) => r.map((v, j) => (j === i ? true : v)));
  }
  revealAll() {
    this.revealed.update((r) => r.map(() => true));
  }

  public finish() {
    this.result.set(null);
    this.revealed.set([]);
    this.levelPack.set(null);
    this.phase.set('idle');
    this.refresh();
  }

  private handleError(e: unknown) {
    const t = (key: string) => this.transloco.translate(key);

    if (e instanceof HttpErrorResponse) {
      if (e.status === 404) {
        this.router.navigateByUrl('/onboarding');
        return;
      }
      if (e.status === 403) {
        this.error.set(t('packs.errors.notUnlocked'));
        return;
      }
      if (e.status === 409) {
        this.error.set(t(this.levelPack() ? 'packs.errors.levelAlreadyOpened' : 'packs.errors.dailyAlreadyOpened'));
        this.refresh();
        return;
      }
      if (e.status === 503) {
        this.error.set(t('packs.errors.noArtwork'));
        return;
      }
    }
    this.error.set(t('packs.errors.openFailed'));
  }

  openStored() {
    const next = this.stored()[0]; // le plus bas niveau d'abord
    if (!next || this.phase() !== 'idle') return;
    this.levelPack.set(next.level);
    this.open();
  }
}
