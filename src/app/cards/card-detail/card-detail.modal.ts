import { Component, Input, OnInit, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonBadge,
         IonSpinner, IonProgressBar, ModalController } from '@ionic/angular';
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
            IonSpinner, IonProgressBar, CardViewComponent],
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
  /** état du saint côté joueur (copie locale, mise à jour après montée de niveau) */
  pc = signal<PlayerCard | null>(null);
  upgrading = signal(false);
  error = signal('');
  private owned = new Set<string>();
  private changed = false;

  sorted = computed(() => [...this.arts()].sort((a, b) =>
    Number(this.isOwned(b)) - Number(this.isOwned(a)) ||
    RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity)));

  ownedCount = computed(() => this.arts().filter(a => this.isOwned(a)).length);

  current = computed<CardArt | null>(() =>
    this.arts().find(a => a.publicId === this.equippedId()) ?? this.card.defaultArt ?? null);

  progress = computed(() => {
    const p = this.pc();
    return p && p.nextUpgradeCost ? Math.min(1, p.fragments / p.nextUpgradeCost) : 1;
  });

  canUpgrade = computed(() => {
    const p = this.pc();
    return !!p && p.nextUpgradeCost !== null && p.fragments >= p.nextUpgradeCost;
  });

  ngOnInit() {
    this.pc.set(this.playerCard);
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
    if (!this.pc() || !this.isOwned(a) || this.isEquipped(a)) return;
    this.player.equip(this.card.publicId, a.publicId).subscribe(() => {
      this.equippedId.set(a.publicId);
      this.changed = true;
    });
  }

  upgrade() {
    if (!this.canUpgrade() || this.upgrading()) return;
    this.upgrading.set(true);
    this.error.set('');
    this.player.upgrade(this.card.publicId).subscribe({
      next: r => {
        this.pc.update(p => p && { ...p, level: r.level, fragments: r.fragments, nextUpgradeCost: r.nextUpgradeCost });
        this.changed = true;
        this.upgrading.set(false);
      },
      error: (e: HttpErrorResponse) => {
        this.upgrading.set(false);
        this.error.set(e.status === 409 ? 'Fragments insuffisants ou niveau maximum atteint.' : 'Erreur serveur.');
      },
    });
  }

  close() { this.modal.dismiss(null, this.changed ? 'changed' : 'cancel'); }
}
