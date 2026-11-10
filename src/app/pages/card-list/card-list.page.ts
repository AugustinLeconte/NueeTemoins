import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { addIcons } from 'ionicons';
import { add } from 'ionicons/icons';
import { IonButtons, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonTitle, IonToolbar } from '@ionic/angular';
import { CardService } from '../../cards/card.service';
import { CardViewComponent } from '../../cards/card-view/card-view.component';
import { UserAvatarComponent } from '../../shared/user-avatar/user-avatar.component';

@Component({
  selector: 'app-card-list',
  standalone: true,
  imports: [AsyncPipe, RouterLink, IonHeader, IonToolbar, IonTitle, IonContent, IonFab, IonFabButton, IonIcon, CardViewComponent, IonButtons, UserAvatarComponent],
  templateUrl: './card-list.page.html',
  styleUrls: ['./card-list.page.scss'],
})
export class CardListPage {
  cards$ = inject(CardService).getAll();
  constructor() { addIcons({ add }); }
}
