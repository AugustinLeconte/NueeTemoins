import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  IonSplitPane,
  IonMenu,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonButtons,
  IonBackButton,
} from '@ionic/angular';
import { UserAvatarComponent } from '../../shared/user-avatar/user-avatar.component';
import { ProfileService } from '../profile/profile.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
  imports: [
    RouterLink,
    RouterLinkActive,
    IonSplitPane,
    IonMenu,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonIcon,
    IonLabel,
    IonRouterOutlet,
    IonButtons,
    UserAvatarComponent,
    IonBackButton,
  ],
})
export class AdminPage {
  protected profiles = inject(ProfileService);
}
