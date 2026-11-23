import {
  AlertController,
  IonAccordion,
  IonAccordionGroup,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonSearchbar,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { LevelBarComponent } from '../../../player/level-bar/level-bar.component';
import { Component, inject, signal } from '@angular/core';
import { AdminPlayer, AdminPlayerService } from '../admin-player.service';
import { UserAvatarComponent } from '../../../shared/user-avatar/user-avatar.component';

@Component({
  selector: 'app-player-admin',
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonSearchbar,
    IonAccordionGroup,
    IonAccordion,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    LevelBarComponent,
    UserAvatarComponent,
    IonButtons,
  ], // ajuste l'import de LevelBarComponent
  templateUrl: './player-admin.page.html',
})
export class PlayerAdminPage {
  private api = inject(AdminPlayerService);
  private alerts = inject(AlertController);
  players = signal<AdminPlayer[]>([]);

  ionViewWillEnter() {
    this.search('');
  }

  search(q: string) {
    this.api.list(q).subscribe((p) => this.players.set(p));
  }

  private replace(updated: AdminPlayer) {
    this.players.update((l) => l.map((p) => (p.userId === updated.userId ? updated : p)));
  }

  gift(p: AdminPlayer, packs: IonInput, coins: IonInput, xp: IonInput) {
    const g = { packs: +(packs.value ?? 0) || 0, coins: +(coins.value ?? 0) || 0, xp: +(xp.value ?? 0) || 0 };
    this.api.gift(p.userId, g).subscribe((u) => {
      this.replace(u);
      packs.value = coins.value = xp.value = '';
    });
  }

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
          handler: () =>
            this.api
              .remove(p.userId)
              .subscribe(() => this.players.update((l) => l.filter((x) => x.userId !== p.userId))),
        },
      ],
    });
    await alert.present();
  }
}
