import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

export const adminGuard: CanActivateFn = async (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (await auth.isAdmin() || inject(Router).parseUrl('/home')) return true;
  return router.createUrlTree(['/home'], { queryParams: { returnUrl: state.url } });
};
