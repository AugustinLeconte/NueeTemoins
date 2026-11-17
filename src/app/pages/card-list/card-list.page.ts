import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonSpinner,
         IonChip, IonLabel, ModalController,
         IonSearchbar,
         IonSelect,
         IonSelectOption,
         IonSegment,
         IonSegmentButton,
         IonIcon} from '@ionic/angular';
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
import { CardFilterModal, FilterValue } from './card-filter/card-filter.modal';
import { addIcons } from 'ionicons';
import { closeCircle, optionsOutline } from 'ionicons/icons';

const norm = (s: string | null | undefined) =>
  (s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

type Ownership = 'all' | 'owned' | 'missing';

@Component({
  selector: 'app-card-list',
  standalone: true,
  imports: [RouterLink, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonSpinner,
            IonChip, IonLabel, CardViewComponent, UserAvatarComponent, NavbarComponent, TranslocoPipe, IonSearchbar,
          IonSelect, IonSelectOption, IonSegment, IonSegmentButton, CardFilterModal, IonIcon],
  templateUrl: './card-list.page.html',
  styleUrls: ['./card-list.page.scss'],
})
export class CardListPage {
  private cardsApi = inject(CardService);
  private player = inject(PlayerService);
  private profiles = inject(ProfileService);
  private modal = inject(ModalController);
  private router = inject(Router);

  public cards = signal<Card[]>([]);
  public owned = signal<Map<string, PlayerCard>>(new Map());
  public loading = signal(true);
  public error = signal('');
  public lang = 'fr';

  public search = signal('');
  public selectedFamilies = signal<string[]>([]);
  public month = signal<number | null>(null);
  public day = signal<number | null>(null);
  public months = signal<{ value: number; label: string }[]>([]);

  public ownedCount = computed(() => this.owned().size);

  public ownership = signal<Ownership>('all');

  public families = computed(() => {
    const map = new Map<string, string>();
    for (const c of this.cards()) for (const f of c.families) map.set(f.publicId, f.name);
    return [...map].map(([publicId, name]) => ({ publicId, name }))
      .sort((a, b) => a.name.localeCompare(b.name, this.lang));
  });

  private baseCards = computed(() => {
    const terms = norm(this.search()).split(/\s+/).filter(Boolean);
    const own = this.ownership();
    const owned = this.owned();
    return this.cards().filter(c => {
      if (own === 'owned' && !owned.has(c.publicId)) return false;
      if (own === 'missing' && owned.has(c.publicId)) return false;
      if (terms.length) {
        const haystack = norm(`${c.title} ${c.subtitle ?? ''} ${c.description ?? ''}`);
        if (!terms.every(t => haystack.includes(t))) return false;
      }
      return true;
    });
  });

  /** filtres de la modale : familles + date de fête */
  private matches(c: Card, f: FilterValue): boolean {
    if (f.families.length && !c.families.some(x => f.families.includes(x.publicId))) return false;
    if (f.month !== null) {
      if (c.feastMonth !== f.month) return false;
      if (f.day !== null && c.feastDay !== f.day) return false;
    }
    return true;
  }

  public filteredCards = computed(() => {
    const f = { families: this.selectedFamilies(), month: this.month(), day: this.day() };
    return this.baseCards().filter(c => this.matches(c, f));
  });

  public hasFilters = computed(() =>
  !!this.search().trim() || this.activeCount() > 0 || this.ownership() !== 'all');

  /** pastille du bouton filtre : nombre de critères de la modale actifs */
  public activeCount = computed(() => this.selectedFamilies().length + (this.month() !== null ? 1 : 0));

  /** libellé du chip date : "15 janvier" ou "janvier" */
  public dateLabel = computed(() => {
    const m = this.months().find(x => x.value === this.month());
    if (!m) return '';
    return this.day() !== null ? `${this.day()} ${m.label}` : m.label;
  });

  public familyName(id: string) { return this.families().find(f => f.publicId === id)?.name ?? ''; }

  public removeFamily(id: string) { this.selectedFamilies.update(s => s.filter(x => x !== id)); }
  public clearDate() { this.month.set(null); this.day.set(null); }

  constructor() { addIcons({ optionsOutline, closeCircle }); }

  // rechargé à chaque retour sur la page (après un pack, un équipement...)
  ionViewWillEnter() { this.load(); }

  public onSearch(e: Event) { this.search.set((e as CustomEvent).detail.value ?? ''); }

  public async openFilters() {
    const m = await this.modal.create({
      component: CardFilterModal,
      breakpoints: [0, 0.75, 1],
      initialBreakpoint: 0.75,
      componentProps: {
        families: this.families(),
        months: this.months(),
        value: { families: this.selectedFamilies(), month: this.month(), day: this.day() },
        countFn: (f: FilterValue) => this.baseCards().filter(c => this.matches(c, f)).length,
      },
    });
    await m.present();
    const { data, role } = await m.onWillDismiss<FilterValue>();
    if (role === 'apply' && data) {
      this.selectedFamilies.set(data.families);
      this.month.set(data.month);
      this.day.set(data.day);
    }
  }

  public onOwnership(e: Event) {
    this.ownership.set(((e as CustomEvent).detail.value as Ownership) ?? 'all');
  }

  public resetFilters() {
    this.search.set('');
    this.selectedFamilies.set([]);
    this.month.set(null);
    this.day.set(null);
    this.ownership.set('all');
  }

  private async load() {
    try {
      const p = await this.profiles.load();
      this.lang = p.language || 'fr';
       this.months.set(Array.from({ length: 12 }, (_, i) => ({
        value: i + 1,
        label: new Intl.DateTimeFormat(this.lang, { month: 'long' }).format(new Date(2024, i, 1)),
      })));
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

  public isOwned(c: Card) { return this.owned().has(c.publicId); }

  public levelOf(c: Card) { return this.owned().get(c.publicId)?.level ?? 0; }

  /** assez de fragments pour monter le saint d'un niveau */
  public canUpgrade(c: Card) {
    const pc = this.owned().get(c.publicId);
    return !!pc && pc.nextUpgradeCost !== null && pc.fragments >= pc.nextUpgradeCost;
  }

  /** Illustration affichée : celle équipée si possédée, sinon celle par défaut (grisée). */
  public artOf(c: Card): CardArt | null {
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
