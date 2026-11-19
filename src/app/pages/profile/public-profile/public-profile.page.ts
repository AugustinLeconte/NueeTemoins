import { Component, inject, signal } from '@angular/core';
import { IonBackButton, IonButtons, IonContent, IonHeader, IonSpinner, IonTitle, IonToolbar } from '@ionic/angular';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';
import { ActivatedRoute } from '@angular/router';
import { PublicProfile, PublicProfileService } from '../public-profile.service';
import { firstValueFrom } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-public-profile',
  standalone: true,
  templateUrl: './public-profile.page.html',
  styleUrls: ['./public-profile.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonBackButton,
    IonSpinner,
    TranslocoPipe,
    NavbarComponent,
  ],
})
export class PublicProfilePage {
  private route = inject(ActivatedRoute);
  private api = inject(PublicProfileService);
  private i18n = inject(TranslocoService);

  loading = signal(true);
  error = signal('');
  data = signal<PublicProfile | null>(null);

  async ngOnInit() {
    const pseudo = this.route.snapshot.paramMap.get('pseudo')!;
    const lang = (this.i18n.getActiveLang() || 'en').slice(0, 2);
    try {
      this.data.set(await firstValueFrom(this.api.get(pseudo, lang)));
    } catch (e) {
      this.error.set(
        e instanceof HttpErrorResponse && e.status === 404 ? 'profile.public.not-found' : 'profile.loading-error',
      );
    } finally {
      this.loading.set(false);
    }
  }

  countryName(code: string) {
    return new Intl.DisplayNames(['fr'], { type: 'region' }).of(code) ?? code;
  }
}
