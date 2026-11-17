import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IonTabBar, IonTabButton, IonIcon, IonLabel, IonBadge } from '@ionic/angular'; // On garde la structure visuelle via ion-tab-bar si tu veux conserver le look natif, ou des div.
import { TranslocoPipe } from '@jsverse/transloco';
import { addIcons } from 'ionicons';
import { NotificationsService } from '../../notifications/notifications.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  imports: [RouterLink, RouterLinkActive, IonIcon, IonLabel, TranslocoPipe, IonBadge],
})
export class NavbarComponent {
  private notifs = inject(NotificationsService);

  constructor() {
    this.notifs.start();
    addIcons({
      'custom-collection': 'assets/icons/collection-solid-svgrepo-com.svg',
      'custom-packs': 'assets/icons/poker-cards-svgrepo-com.svg',
      'custom-shop': 'assets/icons/shop-cart-svgrepo-com.svg',
      'custom-logo': 'assets/icons/logo.svg',
      'custom-wordle': 'assets/icons/wordlesolver-svgrepo-com.svg',
      'custom-friends': 'assets/icons/friends-svgrepo-com.svg'
    });
  }
}
