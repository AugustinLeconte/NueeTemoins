import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, map, of, switchMap } from 'rxjs';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonButton,
         IonBadge, IonSpinner, IonProgressBar } from '@ionic/angular';
import { Card } from '../../cards/card.model';
import { CardViewComponent } from '../../cards/card-view/card-view.component';
import { LevelBarComponent } from '../../player/level-bar/level-bar.component';
import { PlayerService } from '../../player/player.service';
import { DrawnItem, PackResult, PlayerCard, PlayerProgress, Wallet } from '../../player/player.model';

@Component({
  selector: 'app-pack-opening',
  standalone: true,
  imports: [RouterLink, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton,
            IonButton, IonBadge, IonSpinner, IonProgressBar, CardViewComponent, LevelBarComponent],
  templateUrl: './pack-opening.page.html',
  styleUrls: ['./pack-opening.page.scss'],
})
export class PackOpeningPage {
  private player = inject(PlayerService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  /** Doit correspondre à GameRules.PITY_THRESHOLD côté backend. */
  readonly PITY = 10;

  wallet = signal<Wallet | null>(null);
  progress = signal<PlayerProgress | null>(null);
  /** défini quand on arrive depuis la boutique (/packs?level=N) : pack de niveau au lieu du pack quotidien */
  levelPack = signal<number | null>(null);
  phase = signal<'idle' | 'opening' | 'reveal'>('idle');
  result = signal<PackResult | null>(null);
  revealed = signal<boolean[]>([]);
  error = signal('');
  private cardInfo = new Map<string, Card>();

  allRevealed = computed(() => this.revealed().length > 0 && this.revealed().every(Boolean));
  pityProgress = computed(() => Math.min(1, (this.wallet()?.packsSinceRare ?? 0) / this.PITY));
  leveledUp = computed(() => {
    const r = this.result();
    return !!r && r.progress.level > r.levelBefore;
  });

  ionViewWillEnter() {
    if (this.phase() !== 'idle') return;
    const l = this.route.snapshot.queryParamMap.get('level');
    this.levelPack.set(l ? Number(l) : null);
    this.refresh();
  }

  private refresh() {
    this.player.wallet().subscribe({ next: w => this.wallet.set(w), error: e => this.handleError(e) });
    this.player.progress().subscribe({ next: p => this.progress.set(p), error: () => {} });
  }

  open() {
    this.error.set('');
    this.phase.set('opening');
    const level = this.levelPack();
    const call$ = level ? this.player.openLevelPack(level) : this.player.openDaily();

    call$.pipe(
      // collection : familles / sous-titre / description des saints tirés
      switchMap(res => this.player.collection().pipe(
        catchError(() => of([] as PlayerCard[])),
        map(col => ({ res, col })),
      )),
    ).subscribe({
      next: ({ res, col }) => {
        this.cardInfo = new Map(col.map(pc => [pc.card.publicId, pc.card]));
        this.result.set(res);
        this.revealed.set(res.draws.map(() => false));
        this.wallet.update(w => ({
          coins: res.coins,
          packsSinceRare: res.packsSinceRare,
          dailyPackAvailable: level ? (w?.dailyPackAvailable ?? false) : false,
        }));
        this.progress.set(res.progress);
        this.phase.set('reveal');
      },
      error: e => { this.phase.set('idle'); this.handleError(e); },
    });
  }

  cardOf(d: DrawnItem): Card | undefined {
    return d.art ? this.cardInfo.get(d.art.cardPublicId) : undefined;
  }

  canUpgrade(d: DrawnItem) {
    return d.nextUpgradeCost !== null && d.cardFragments !== null && d.cardFragments >= d.nextUpgradeCost;
  }

  reveal(i: number) { this.revealed.update(r => r.map((v, j) => (j === i ? true : v))); }
  revealAll() { this.revealed.update(r => r.map(() => true)); }

  finish() {
    this.result.set(null);
    this.phase.set('idle');
    if (this.levelPack()) { this.router.navigateByUrl('/shop'); return; }
    this.refresh();
  }

  private handleError(e: unknown) {
    if (e instanceof HttpErrorResponse) {
      if (e.status === 404) { this.router.navigateByUrl('/onboarding'); return; }
      if (e.status === 403) { this.error.set("Ce pack n'est pas encore débloqué."); return; }
      if (e.status === 409) {
        this.error.set(this.levelPack()
          ? 'Ce pack de niveau a déjà été ouvert.'
          : 'Vous avez déjà ouvert votre pack du jour. Revenez demain !');
        this.refresh();
        return;
      }
      if (e.status === 503) { this.error.set("Aucune illustration n'est disponible pour le moment."); return; }
    }
    this.error.set("Impossible d'ouvrir le pack.");
  }
}
