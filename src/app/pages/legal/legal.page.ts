import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonCheckbox,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { ProfileService } from '../profile/profile.service';

interface Section {
  title: string;
  text?: string[];
  items?: string[];
  links?: { label: string; url: string }[];
}

@Component({
  selector: 'app-legal',
  standalone: true,
  templateUrl: './legal.page.html',
  styleUrls: ['./legal.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonBackButton,
    IonButton,
    IonCheckbox,
    TranslocoPipe,
  ],
})
export class LegalPage {
  private route = inject(ActivatedRoute);
  private t = inject(TranslocoService);
  private profiles = inject(ProfileService);

  readonly key = this.route.snapshot.data['key'] as 'terms' | 'privacy' | 'dataSafety' | 'credits';

  readonly sections = toSignal(this.t.selectTranslateObject<Section[]>(`legal.${this.key}.sections`), {
    initialValue: [] as Section[],
  });

  // La case n'apparaît que si le profil est déjà chargé (venant de la page profil) et non accepté.
  readonly canAccept = computed(() => this.key === 'terms' && this.profiles.current()?.termsAccepted === false);
  readonly checked = signal(false);
  readonly saving = signal(false);
  readonly error = signal(false);

  async accept() {
    this.saving.set(true);
    this.error.set(false);
    try {
      await firstValueFrom(this.profiles.acceptTerms());
    } catch {
      this.error.set(true);
    } finally {
      this.saving.set(false);
    }
  }
}
