import { Component, Input, OnInit, computed, inject, signal } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonBadge,
         IonSpinner, ModalController } from '@ionic/angular';
import { Card, CardArt } from '../card.model';
import { CardArtService } from '../card-art.service';
import { CardViewComponent } from '../card-view/card-view.component';
import { PlayerCard } from '../../player/player.model';
import { PlayerService } from '../../player/player.service';

const RARITY_ORDER = ['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY'];
const SOURCE_LABEL: Record<string, string> = {
  DEFAULT: 'Par défaut', PACK: 'Packs', SHOP: 'Boutique', EVENT: 'Événement',
};

@Component({
  selector: 'app-card-detail-modal',
  standalone: true,
  templateUrl: './card-detail.modal.html',
  styleUrls: ['./card-detail.modal.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonBadge,
            IonSpinner, CardViewComponent],
})
export class CardDetailModal implements OnInit {
  @Input({ required: true }) card!: Card;
  @Input() playerCard: PlayerCard | null = null;
  @Input() lang = 'fr';

  private artsApi = inject(CardArtService);
  private player = inject(PlayerService);
  private modal = inject(ModalController);

  loading = signal(true);
  arts = signal<CardArt[]>([]);
  equippedId = signal<string | null>(null);
  private owned = new Set<string>();
  private changed = false;

  // owned d'abord, puis par rareté croissante
  sorted = computed(() => [...this.arts()].sort((a, b) =>
    Number(this.isOwned(b)) - Number(this.isOwned(a)) ||
    RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity)));

  ownedCount = computed(() => this.arts().filter(a => this.isOwned(a)).length);

  current = computed<CardArt | null>(() =>
    this.arts().find(a => a.publicId === this.equippedId()) ?? this.card.defaultArt ?? null);

  ngOnInit() {
    this.owned = new Set(this.playerCard?.ownedArts.map(a => a.publicId) ?? []);
    this.equippedId.set(this.playerCard?.equippedArt.publicId ?? null);
    this.artsApi.getByCard(this.card.publicId, this.lang).subscribe({
      next: a => { this.arts.set(a); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  isOwned(a: CardArt) { return this.owned.has(a.publicId); }
  isEquipped(a: CardArt) { return this.equippedId() === a.publicId; }
  sourceLabel(a: CardArt) { return SOURCE_LABEL[a.source] ?? a.source; }

  feastLabel() {
    const { feastMonth: m, feastDay: d } = this.card;
    if (!m || !d) return '';
    return new Intl.DateTimeFormat(this.lang, { day: 'numeric', month: 'long' }).format(new Date(2000, m - 1, d));
  }

  equip(a: CardArt) {
    if (!this.playerCard || !this.isOwned(a) || this.isEquipped(a)) return;
    this.player.equip(this.card.publicId, a.publicId).subscribe(() => {
      this.equippedId.set(a.publicId);
      this.changed = true;
    });
  }

  close() { this.modal.dismiss(null, this.changed ? 'changed' : 'cancel'); }
}
