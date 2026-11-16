import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonSpinner,
         IonChip, IonLabel, ModalController } from '@ionic/angular';
import { CardService } from '../../cards/card.service';
import { Card, CardArt } from '../../cards/card.model';
import { CardViewComponent } from '../../cards/card-view/card-view.component';
import { CardDetailModal } from '../../cards/card-detail/card-detail.modal';
import { ProfileService } from '../../auth/profile.service';
import { UserAvatarComponent } from '../../shared/user-avatar/user-avatar.component';
import { PlayerService } from '../../player/player.service';
import { PlayerCard } from '../../player/player.model';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-card-list',
  standalone: true,
  imports: [RouterLink, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonSpinner,
            IonChip, IonLabel, CardViewComponent, UserAvatarComponent, NavbarComponent, TranslocoPipe],
  templateUrl: './card-list.page.html',
  styleUrls: ['./card-list.page.scss'],
})
export class CardListPage {
  private cardsApi = inject(CardService);
  private player = inject(PlayerService);
  private profiles = inject(ProfileService);
  private modal = inject(ModalController);
  private router = inject(Router);

  cards = signal<Card[]>([]);
  owned = signal<Map<string, PlayerCard>>(new Map());
  loading = signal(true);
  error = signal('');
  lang = 'fr';

  ownedCount = computed(() => this.owned().size);

  // rechargé à chaque retour sur la page (après un pack, un équipement...)
  ionViewWillEnter() { this.load(); }

  private async load() {
    try {
      const p = await this.profiles.load();
      this.lang = p.language || 'fr';
      const [cards, collection] = await Promise.all([
        firstValueFrom(this.cardsApi.getAll(this.lang, p.country)),
        firstValueFrom(this.player.collection()),
      ]);
      this.cards.set(cards);
      this.owned.set(new Map(collection.map(pc => [pc.card.publicId, pc])));
      this.error.set('');
    } catch (e) {
      if (e instanceof HttpErrorResponse && e.status === 404) {
        this.router.navigateByUrl('/onboarding');
        return;
      }
      this.error.set('card-list.loadError');
    } finally {
      this.loading.set(false);
    }
  }

  isOwned(c: Card) { return this.owned().has(c.publicId); }

  levelOf(c: Card) { return this.owned().get(c.publicId)?.level ?? 0; }

  /** assez de fragments pour monter le saint d'un niveau */
  canUpgrade(c: Card) {
    const pc = this.owned().get(c.publicId);
    return !!pc && pc.nextUpgradeCost !== null && pc.fragments >= pc.nextUpgradeCost;
  }

  /** Illustration affichée : celle équipée si possédée, sinon celle par défaut (grisée). */
  artOf(c: Card): CardArt | null {
    return this.owned().get(c.publicId)?.equippedArt ?? c.defaultArt ?? null;
  }

  async openDetail(c: Card) {
    const m = await this.modal.create({
      component: CardDetailModal,
      componentProps: { card: c, playerCard: this.owned().get(c.publicId) ?? null, lang: this.lang },
    });
    await m.present();
    const { role } = await m.onWillDismiss();
    if (role === 'changed') this.load();
  }
}
