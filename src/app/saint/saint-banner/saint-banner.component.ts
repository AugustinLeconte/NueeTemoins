import { Component, computed, inject, signal } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { SaintOfTheDay, SaintService } from '../saint.service';
import { IonIcon, IonSkeletonText } from '@ionic/angular';

const NOMINIS_URL = 'https://nominis.cef.fr/';

@Component({
  selector: 'app-saint-banner',
  imports: [IonIcon, IonSkeletonText, TranslocoPipe],
  templateUrl: './saint-banner.component.html',
  styleUrls: ['./saint-banner.component.scss'],
})
export class SaintBannerComponent {
  private service = inject(SaintService);

  saint = signal<SaintOfTheDay | null>(null);
  loading = signal(true);
  error = signal(false);

  readonly showNominis = computed(() => this.saint()?.country === 'FR');
  readonly nominisUrl = NOMINIS_URL;

  constructor() {
    this.service
      .getSaintOfTheDay()
      .then((s) => this.saint.set(s))
      .catch(() => this.error.set(true))
      .finally(() => this.loading.set(false));
  }
}
