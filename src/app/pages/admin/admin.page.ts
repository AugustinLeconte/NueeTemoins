import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { addIcons } from 'ionicons';
import { albumsOutline, layersOutline } from 'ionicons/icons';
import { IonSplitPane, IonMenu, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem,
         IonIcon, IonLabel, IonRouterOutlet } from '@ionic/angular';

@Component({
  selector: 'app-admin',
  standalone: true,
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
  imports: [RouterLink, RouterLinkActive, IonSplitPane, IonMenu, IonHeader, IonToolbar, IonTitle,
            IonContent, IonList, IonItem, IonIcon, IonLabel, IonRouterOutlet],
})
export class AdminPage {
  constructor() { addIcons({ albumsOutline, layersOutline }); }
}
