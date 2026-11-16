import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons,
         IonBackButton, IonSpinner,
         IonProgressBar} from '@ionic/angular';
import { AuthService } from '../../auth/auth.service';
import { ProfileService } from '../../auth/profile.service';
import { PlayerService } from '../../player/player.service';
import { Achievement } from '../../player/player.model';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-profile',
  standalone: true,
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons, IonBackButton, IonSpinner, TranslocoPipe, IonProgressBar],
})
export class ProfilePage {
  private auth = inject(AuthService);
  private profiles = inject(ProfileService);
  private router = inject(Router);
  private player = inject(PlayerService);

  public loading = signal(true);
  public loggingOut = signal(false);
  public error = signal('');
  public user = signal<{ name: string; email: string; image?: string | null } | null>(null);
  public profile = signal<{ pseudo: string; country: string; language: string } | null>(null);
  public achievements = signal<Achievement[]>([]);
  public unlockedCount = computed(() => this.achievements().filter(a => a.unlocked).length);

  async ngOnInit() {
    try {
      this.user.set(await this.auth.getUser());
      this.profile.set(await firstValueFrom(this.profiles.get()));
      try {
        this.achievements.set(await firstValueFrom(this.player.achievements()));
      } catch {}
    } catch (e) {
      if (e instanceof HttpErrorResponse && e.status === 404) {
        this.router.navigateByUrl('/onboarding');
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
