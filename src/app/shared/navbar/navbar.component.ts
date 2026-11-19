import { Component, effect, HostListener, inject, signal, untracked } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { IonIcon, IonLabel, IonBadge } from '@ionic/angular';
import { TranslocoPipe } from '@jsverse/transloco';
import { addIcons } from 'ionicons';
import { ellipsisHorizontal } from 'ionicons/icons';
import { NotificationsService } from '../../notifications/notifications.service';
import { TutorialService } from '../../tutorial/tutorial.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  imports: [RouterLink, RouterLinkActive, IonIcon, IonLabel, TranslocoPipe, IonBadge],
})
export class NavbarComponent {
  protected notifs = inject(NotificationsService);
  private router = inject(Router);
  private tutorial = inject(TutorialService);

  moreOpen = signal(false);

  private secondaryRoutes = ['/minigames/wordle', '/minigames/memory', '/minigames/guess-card', '/shop'];

  constructor() {
    this.notifs.start();
    addIcons({
      ellipsisHorizontal,
      'custom-collection': 'assets/icons/collection-solid-svgrepo-com.svg',
      'custom-packs': 'assets/icons/poker-cards-svgrepo-com.svg',
      'custom-shop': 'assets/icons/shop-cart-svgrepo-com.svg',
      'custom-wordle': 'assets/icons/wordlesolver-svgrepo-com.svg',
      'custom-friends': 'assets/icons/icons8-friends.svg',
      'custom-memory': 'assets/icons/icons8-memory-game.svg',
      'custom-guess-card': 'assets/icons/icons8-card-game.svg',
    });

    effect(() => {
      const force = this.tutorial.forceMore();
      untracked(() => this.moreOpen.set(force));
    });
  }

  toggleMore() {
    this.moreOpen.update((v) => !v);
  }

  closeMore() {
    this.moreOpen.set(false);
  }

  isSecondaryActive(): boolean {
    return this.secondaryRoutes.some((r) => this.router.url.startsWith(r));
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.closeMore();
  }
}
