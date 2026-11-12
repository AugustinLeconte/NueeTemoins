import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { IonButtons, IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular';
import { CardService } from '../../cards/card.service';
import { CardViewComponent } from '../../cards/card-view/card-view.component';
import { UserAvatarComponent } from '../../shared/user-avatar/user-avatar.component';

@Component({
  selector: 'app-card-list',
  standalone: true,
  imports: [AsyncPipe, IonHeader, IonToolbar, IonTitle, IonContent, CardViewComponent, IonButtons, UserAvatarComponent],
  templateUrl: './card-list.page.html',
  styleUrls: ['./card-list.page.scss'],
})
export class CardListPage {
  cards$ = inject(CardService).getAll();
}
