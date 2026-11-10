import { Component, computed, inject, signal } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { Router } from '@angular/router';
import { ProfileService } from '../../auth/profile.service';

@Component({
  selector: 'app-user-avatar',
  templateUrl: './user-avatar.component.html',
  styleUrls: ['./user-avatar.component.scss'],
  imports: [],
})
export class UserAvatarComponent {
  private auth = inject(AuthService);
  private profiles = inject(ProfileService);
  private router = inject(Router);

  private user = signal<{ name?: string; image?: string | null } | null>(null);
  imgFailed = signal(false);

  image = computed(() => this.user()?.image ?? null);
  initial = computed(() =>
    (this.profiles.current()?.pseudo ?? this.user()?.name ?? '?').charAt(0).toUpperCase()
  );

  async ngOnInit() {
    const [user] = await Promise.allSettled([
      this.auth.getUser(),
      this.profiles.load(),
    ]);
    if (user.status === 'fulfilled') this.user.set(user.value);
  }

  goToProfile() {
    this.router.navigateByUrl('/profile');
  }
}
