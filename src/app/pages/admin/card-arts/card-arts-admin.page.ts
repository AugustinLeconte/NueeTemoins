import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { addIcons } from 'ionicons';
import { add, createOutline, trashOutline } from 'ionicons/icons';
import { IonButtons, IonBackButton, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonTitle,
         IonToolbar, IonList, IonItem, IonLabel, IonButton, IonThumbnail, IonBadge,
         AlertController } from '@ionic/angular';
import { UserAvatarComponent } from '../../../shared/user-avatar/user-avatar.component';
import { CardService } from '../../../cards/card.service';
import { CardArtService } from '../../../cards/card-art.service';
import { Card, CardArt } from '../../../cards/card.model';

@Component({
  selector: 'app-card-arts-admin',
  standalone: true,
  templateUrl: './card-arts-admin.page.html',
  styleUrls: ['./card-arts-admin.page.scss'],
  imports: [RouterLink, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonContent, IonList,
            IonItem, IonLabel, IonButton, IonIcon, IonFab, IonFabButton, IonThumbnail, IonBadge,
            UserAvatarComponent],
})
export class CardArtsAdminPage {
  private route = inject(ActivatedRoute);
  private cardsApi = inject(CardService);
  private artsApi = inject(CardArtService);
  private alert = inject(AlertController);

  readonly cardPublicId = this.route.snapshot.paramMap.get('cardPublicId')!;
  card = signal<Card | null>(null);
  arts = signal<CardArt[]>([]);

  constructor() { addIcons({ add, createOutline, trashOutline }); }

  ionViewWillEnter() { this.load(); }

  load() {
    forkJoin({
      card: this.cardsApi.getOne(this.cardPublicId),
      arts: this.artsApi.getByCard(this.cardPublicId),
    }).subscribe(({ card, arts }) => { this.card.set(card); this.arts.set(arts); });
  }

  async remove(a: CardArt) {
    const dialog = await this.alert.create({
      header: 'Supprimer l’illustration ?',
      message: 'Cette action est définitive.',
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        { text: 'Supprimer', role: 'destructive', handler: () => this.artsApi.delete(a.publicId).subscribe({
            next: () => this.load(),
            error: async (e: HttpErrorResponse) => {
              const err = await this.alert.create({
                header: 'Suppression impossible',
                message: e.status === 409
                  ? 'Illustration par défaut ou déjà possédée par des joueurs (décoche « Obtenable » à la place).'
                  : 'Erreur serveur.',
                buttons: ['OK'],
              });
              await err.present();
            },
          }) },
      ],
    });
    await dialog.present();
  }
}
