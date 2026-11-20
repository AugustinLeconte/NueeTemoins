import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom, forkJoin } from 'rxjs'; // Ajout de forkJoin si tu souhaites charger en parallèle
import { HttpErrorResponse } from '@angular/common/http';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonSpinner,
  IonProgressBar,
  AlertController,
  IonList,
  IonListHeader,
  IonItem,
  IonBadge,
  IonSelectOption,
  IonSelect,
  IonLabel,
} from '@ionic/angular';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { LevelBarComponent } from '../../../player/level-bar/level-bar.component';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';
import { AuthService } from '../../../auth/auth.service';
import { PlayerService } from '../../../player/player.service';
import { NotificationsService } from '../../../notifications/notifications.service';
import { Achievement, PlayerProgress } from '../../../player/player.model';
import { Profile, ProfileService } from '../profile.service';
import { PatronPickerComponent } from '../patron-picker/patron-picker.component';
import { ThemeService } from '../theme.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonSpinner,
    TranslocoPipe,
    IonProgressBar,
    LevelBarComponent,
    NavbarComponent,
    TranslocoPipe,
    PatronPickerComponent,
    IonList,
    IonListHeader,
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonBadge,
    RouterLink,
  ],
})
export class ProfilePage {
  private auth = inject(AuthService);
  private profiles = inject(ProfileService);
  private router = inject(Router);
  private player = inject(PlayerService);
  private notifs = inject(NotificationsService);
  private alerts = inject(AlertController);
  private t = inject(TranslocoService);
  public theme = inject(ThemeService);

  public loading = signal(true);
  public loggingOut = signal(false);
  public error = signal('');
  public user = signal<{ name: string; email: string; image?: string | null } | null>(null);
  public profile = signal<Profile | null>(null);
  public deleting = signal(false);
  public deleteError = signal(false);
  public achievements = signal<Achievement[]>([]);
  public unlockedCount = computed(() => this.achievements().filter((a) => a.unlocked).length);
  public progress = signal<PlayerProgress | null>(null);
  public termsPending = computed(() => this.profiles.current()?.termsAccepted === false);

  async ngOnInit() {
    try {
      const [user, profile, achievements, progress] = await Promise.all([
        this.auth.getUser(),
        this.profiles.load(true),
        //firstValueFrom(this.profiles.get()),
        firstValueFrom(this.player.achievements()).catch(() => [] as Achievement[]),
        firstValueFrom(this.player.progress()).catch(() => null as PlayerProgress | null),
      ]);

      this.user.set(user);
      this.profile.set(profile);
      this.achievements.set(achievements);
      this.progress.set(progress);
    } catch (e) {
      if (e instanceof HttpErrorResponse && e.status === 404) {
        this.router.navigateByUrl('/onboarding');
        return;
      }
      this.error.set('profile.loading-error');
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
    this.notifs.stop();
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  onPatronChanged(id: string | null) {
    this.profile.update((p) => p && { ...p, patronCardId: id });
  }

  async confirmDelete() {
    const alert = await this.alerts.create({
      header: this.t.translate('profile.delete.title'),
      message: this.t.translate('profile.delete.message'),
      buttons: [
        { text: this.t.translate('profile.delete.cancel'), role: 'cancel' },
        { text: this.t.translate('profile.delete.confirm'), role: 'destructive', handler: () => this.deleteAccount() },
      ],
    });
    await alert.present();
  }

  private async deleteAccount() {
    this.deleting.set(true);
    this.deleteError.set(false);
    try {
      await firstValueFrom(this.profiles.deleteAccount());
      await this.auth.signOut().catch(() => {});
      this.profiles.clear();
      this.notifs.stop();
      this.router.navigateByUrl('/login', { replaceUrl: true });
    } catch {
      this.deleteError.set(true);
      this.deleting.set(false);
    }
  }
}
