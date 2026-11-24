import {
  ActionSheetController,
  AlertController,
  IonAccordion,
  IonAccordionGroup,
  IonBadge,
  IonButton,
  IonButtons,
  IonChip,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonModal,
  IonSearchbar,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { Component, computed, inject, signal } from '@angular/core';
import { addIcons } from 'ionicons';
import {
  checkmarkCircleOutline,
  giftOutline,
  refreshOutline,
  shieldCheckmarkOutline,
  trashOutline,
} from 'ionicons/icons';
import { LevelBarComponent } from '../../../player/level-bar/level-bar.component';
import { AdminPlayer, AdminPlayerService } from '../admin-player.service';
import { Role } from '../../profile/profile.service';

@Component({
  selector: 'app-player-admin',
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonContent,
    IonSearchbar,
    IonAccordionGroup,
    IonAccordion,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonBadge,
    IonChip,
    IonIcon,
    IonModal,
    LevelBarComponent,
  ],
  templateUrl: './player-admin.page.html',
  styleUrl: './player-admin.page.scss',
})
export class PlayerAdminPage {
  private api = inject(AdminPlayerService);
  private alerts = inject(AlertController);
  private sheets = inject(ActionSheetController);

  players = signal<AdminPlayer[]>([]);
  private query = '';

  readonly roles: Role[] = ['USER', 'TRANSLATOR', 'ADMIN'];
  readonly roleLabels: Record<Role, string> = { USER: 'Joueur', TRANSLATOR: 'Traducteur', ADMIN: 'Admin' };
  readonly roleInfo: Record<Role, string> = {
    USER: 'n’aura plus aucun droit d’administration.',
    TRANSLATOR: 'pourra gérer les familles et les cartes.',
    ADMIN: 'pourra tout gérer, y compris les joueurs et la suppression de comptes.',
  };
  readonly permissions: Record<Role, string[]> = {
    USER: [],
    TRANSLATOR: ['Familles', 'Cartes'],
    ADMIN: ['Familles', 'Cartes', 'Joueurs'],
  };

  // --- modale de don ---
  giftTarget = signal<AdminPlayer | null>(null);
  giftPacks = signal('');
  giftCoins = signal('');
  giftXp = signal('');
  canGift = computed(() => +this.giftPacks() > 0 || +this.giftCoins() > 0 || +this.giftXp() > 0);

  constructor() {
    addIcons({ giftOutline, shieldCheckmarkOutline, refreshOutline, trashOutline, checkmarkCircleOutline });
  }

  ionViewWillEnter() {
    this.search(this.query);
  }

  search(q: string) {
    this.query = q;
    this.api.list(q).subscribe((p) => this.players.set(p));
  }

  private replace(updated: AdminPlayer) {
    this.players.update((l) => l.map((p) => (p.userId === updated.userId ? updated : p)));
  }

  // --- rôles ---
  async chooseRole(p: AdminPlayer) {
    const sheet = await this.sheets.create({
      header: `Rôle de ${p.pseudo}`,
      buttons: [
        ...this.roles.map((r) => ({
          text: this.roleLabels[r] + (r === p.role ? ' (actuel)' : ''),
          disabled: r === p.role,
          handler: () => {
            this.confirmRole(p, r);
          },
        })),
        { text: 'Annuler', role: 'cancel' },
      ],
    });
    await sheet.present();
  }

  private async confirmRole(p: AdminPlayer, role: Role) {
    const alert = await this.alerts.create({
      header: 'Changer le rôle ?',
      message: `${p.pseudo} passera de « ${this.roleLabels[p.role]} » à « ${this.roleLabels[role]} » et ${this.roleInfo[role]}`,
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        {
          text: 'Confirmer',
          role: role === 'ADMIN' ? 'destructive' : undefined,
          handler: () => {
            this.api.setRole(p.userId, role).subscribe(() => this.replace({ ...p, role }));
          },
        },
      ],
    });
    await alert.present();
  }

  // --- dons ---
  openGift(p: AdminPlayer) {
    this.giftPacks.set('');
    this.giftCoins.set('');
    this.giftXp.set('');
    this.giftTarget.set(p);
  }

  closeGift() {
    this.giftTarget.set(null);
  }

  sendGift() {
    const p = this.giftTarget();
    if (!p || !this.canGift()) return;
    const g = { packs: +this.giftPacks() || 0, coins: +this.giftCoins() || 0, xp: +this.giftXp() || 0 };
    this.api.gift(p.userId, g).subscribe((u) => {
      this.replace(u);
      this.closeGift();
    });
  }

  // --- autres actions ---
  resetDaily(p: AdminPlayer) {
    this.api.resetDaily(p.userId).subscribe((u) => this.replace(u));
  }

  async remove(p: AdminPlayer) {
    const alert = await this.alerts.create({
      header: 'Supprimer le compte ?',
      message: `${p.pseudo} perdra définitivement son compte et sa collection.`,
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        {
          text: 'Supprimer',
          role: 'destructive',
          handler: () => {
            this.api
              .remove(p.userId)
              .subscribe(() => this.players.update((l) => l.filter((x) => x.userId !== p.userId)));
          },
        },
      ],
    });
    await alert.present();
  }
}
