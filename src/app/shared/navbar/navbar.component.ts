import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IonIcon, IonLabel, IonBadge } from '@ionic/angular';
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
      'custom-wordle': 'assets/icons/wordlesolver-svgrepo-com.svg',
      'custom-friends': 'assets/icons/icons8-friends.svg',
      'custom-memory': 'assets/icons/icons8-memory-game.svg',
      'custom-guess-card': 'assets/icons/icons8-card-game.svg',
    });
  }
}
