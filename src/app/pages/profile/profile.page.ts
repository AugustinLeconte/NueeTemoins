import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons,
         IonBackButton, IonSpinner } from '@ionic/angular';
import { AuthService } from '../../auth/auth.service';
import { ProfileService } from '../../auth/profile.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons, IonBackButton, IonSpinner],
})
export class ProfilePage {
  private auth = inject(AuthService);
  private profiles = inject(ProfileService);
  private router = inject(Router);

  loading = signal(true);
  loggingOut = signal(false);
  error = signal('');
  user = signal<{ name: string; email: string; image?: string | null } | null>(null);
  profile = signal<{ pseudo: string; country: string; language: string } | null>(null);

  async ngOnInit() {
    try {
      this.user.set(await this.auth.getUser());
      this.profile.set(await firstValueFrom(this.profiles.get()));
    } catch (e) {
      if (e instanceof HttpErrorResponse && e.status === 404) {
        this.router.navigateByUrl('/onboarding');   // compte sans profil
        return;
      }
      this.error.set('Impossible de charger votre profil.');
    } finally {
      this.loading.set(false);
    }
  }

  countryName(code: string) {
    return new Intl.DisplayNames(['fr'], { type: 'region' }).of(code) ?? code;
  }
  languageName(code: string) {
    return new Intl.DisplayNames(['fr'], { type: 'language' }).of(code) ?? code;
  }
  initial() {
    return (this.profile()?.pseudo ?? this.user()?.name ?? '?').charAt(0).toUpperCase();
  }

  async logout() {
    this.loggingOut.set(true);
    await this.auth.signOut();
    this.profiles.clear();
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}
