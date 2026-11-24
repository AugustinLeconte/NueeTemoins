import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { addIcons } from 'ionicons';
import { add, createOutline, trashOutline, imagesOutline } from 'ionicons/icons';
import {
  IonButtons,
  IonMenuButton,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonThumbnail,
  AlertController,
} from '@ionic/angular';
import { CardService } from '../../../cards/card.service';
import { Card } from '../../../cards/card.model';

@Component({
  selector: 'app-card-admin',
  standalone: true,
  templateUrl: './card-admin.page.html',
  styleUrls: ['./card-admin.page.scss'],
  imports: [
    RouterLink,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonMenuButton,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonButton,
    IonIcon,
    IonFab,
    IonFabButton,
    IonThumbnail,
  ],
})
export class CardAdminPage {
  private cardService = inject(CardService);
  private alert = inject(AlertController);

  cards = signal<Card[]>([]);

  constructor() {
    addIcons({ add, createOutline, trashOutline, imagesOutline });
  }

  ionViewWillEnter() {
    this.load();
  }

  load() {
    this.cardService.getAll().subscribe((c) => this.cards.set(c));
  }

  familyNames(c: Card) {
    return c.families.map((f) => f.name).join(', ') || '—';
  }

  async remove(c: Card) {
    const a = await this.alert.create({
      header: 'Supprimer la carte ?',
      message: `« ${c.title} » et toutes ses illustrations seront définitivement supprimées.`,
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        {
          text: 'Supprimer',
          role: 'destructive',
          handler: () =>
            this.cardService.delete(c.publicId).subscribe({
              next: () => this.load(),
              error: async (e: HttpErrorResponse) => {
                const err = await this.alert.create({
                  header: 'Suppression impossible',
                  message: e.status === 409 ? 'Cette carte est déjà possédée par des joueurs.' : 'Erreur serveur.',
                  buttons: ['OK'],
                });
                await err.present();
              },
            }),
        },
      ],
    });
    await a.present();
  }
}
