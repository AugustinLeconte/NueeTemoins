// src/app/saint/saint-banner.component.ts
import { Component, inject, signal } from '@angular/core';
import { IonIcon, IonSkeletonText } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { sunnyOutline, openOutline } from 'ionicons/icons';
import { SaintDuJour, SaintService } from '../saint.service';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-saint-banner',
  imports: [IonIcon, IonSkeletonText, TranslocoPipe],
  templateUrl: './saint-banner.component.html',
  styleUrls: ['./saint-banner.component.scss'],
})
export class SaintBannerComponent {
  private service = inject(SaintService);

  saint = signal<SaintDuJour | null>(null);
  error = signal(false);

  constructor() {
    this.service.getSaintDuJour().subscribe({
      next: (s) => this.saint.set(s),
      error: () => this.error.set(true),
    });
  }
}
