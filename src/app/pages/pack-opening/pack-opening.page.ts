import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, map, of, switchMap } from 'rxjs';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonButton,
         IonBadge, IonSpinner, IonProgressBar } from '@ionic/angular';
import { Card } from '../../cards/card.model';
import { CardViewComponent } from '../../cards/card-view/card-view.component';
import { PlayerService } from '../../player/player.service';
import { DrawnArt, PackResult, PlayerCard, Wallet } from '../../player/player.model';

@Component({
  selector: 'app-pack-opening',
  standalone: true,
  imports: [RouterLink, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton,
            IonButton, IonBadge, IonSpinner, IonProgressBar, CardViewComponent],
  templateUrl: './pack-opening.page.html',
  styleUrls: ['./pack-opening.page.scss'],
})
export class PackOpeningPage {
  private player = inject(PlayerService);
  private router = inject(Router);

  /** Doit correspondre à GameRules.PITY_THRESHOLD côté backend. */
  readonly PITY = 10;

  wallet = signal<Wallet | null>(null);
  phase = signal<'idle' | 'opening' | 'reveal'>('idle');
  result = signal<PackResult | null>(null);
  revealed = signal<boolean[]>([]);
  error = signal('');
  private cardInfo = new Map<string, Card>();

  allRevealed = computed(() => this.revealed().length > 0 && this.revealed().every(Boolean));
  pityProgress = computed(() => Math.min(1, (this.wallet()?.packsSinceRare ?? 0) / this.PITY));

  ionViewWillEnter() { if (this.phase() === 'idle') this.refreshWallet(); }

  private refreshWallet() {
    this.player.wallet().subscribe({ next: w => this.wallet.set(w), error: e => this.handleError(e) });
  }

  open() {
    this.error.set('');
    this.phase.set('opening');
    this.player.openDaily().pipe(
      // on récupère la collection pour avoir familles / sous-titre / description des saints tirés
      switchMap(res => this.player.collection().pipe(
        catchError(() => of([] as PlayerCard[])),
        map(col => ({ res, col })),
      )),
    ).subscribe({
      next: ({ res, col }) => {
        this.cardInfo = new Map(col.map(pc => [pc.card.publicId, pc.card]));
        this.result.set(res);
        this.revealed.set(res.draws.map(() => false));
        this.wallet.set({ fragments: res.fragments, packsSinceRare: res.packsSinceRare, dailyPackAvailable: false });
        this.phase.set('reveal');
      },
      error: e => { this.phase.set('idle'); this.handleError(e); },
    });
  }

  cardOf(d: DrawnArt): Card | undefined { return this.cardInfo.get(d.art.cardPublicId); }

  reveal(i: number) { this.revealed.update(r => r.map((v, j) => (j === i ? true : v))); }
  revealAll() { this.revealed.update(r => r.map(() => true)); }

  finish() {
    this.result.set(null);
    this.phase.set('idle');
    this.refreshWallet();
  }

  private handleError(e: unknown) {
    if (e instanceof HttpErrorResponse) {
      if (e.status === 404) { this.router.navigateByUrl('/onboarding'); return; }
      if (e.status === 409) { this.error.set('Vous avez déjà ouvert votre pack du jour. Revenez demain !'); this.refreshWallet(); return; }
      if (e.status === 503) { this.error.set("Aucune illustration n'est disponible pour le moment."); return; }
    }
    this.error.set("Impossible d'ouvrir le pack.");
  }
}
