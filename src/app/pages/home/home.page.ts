import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonToolbar } from '@ionic/angular';
import { SaintBannerComponent } from '../../saint/saint-banner/saint-banner.component';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { UserAvatarComponent } from '../../shared/user-avatar/user-avatar.component';
import { TutorialOverlayComponent } from '../../tutorial/tutorial-overlay/tutorial-overlay.component';
import { TutorialService } from '../../tutorial/tutorial.service';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  imports: [
    IonContent,
    SaintBannerComponent,
    CommonModule,
    FormsModule,
    NavbarComponent,
    IonHeader,
    IonToolbar,
    IonButtons,
    UserAvatarComponent,
    TutorialOverlayComponent,
    IonButton,
    IonIcon,
    TranslocoPipe,
  ],
})
export class HomePage implements OnInit {
  protected tutorial = inject(TutorialService);
  constructor() {}

  ngOnInit() {}
}
