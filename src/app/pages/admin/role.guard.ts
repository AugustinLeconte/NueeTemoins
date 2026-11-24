import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { ProfileService, Role } from '../profile/profile.service';

export const roleGuard =
  (...roles: Role[]) =>
  async () => {
    const profiles = inject(ProfileService);
    const router = inject(Router);
    try {
      const p = await profiles.load();
      if (roles.includes(p.role)) return true;
    } catch {}
    return router.createUrlTree(['/home']);
  };
