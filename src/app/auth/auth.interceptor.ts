import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.api)) return next(req);
  return from(inject(AuthService).getJwt()).pipe(
    switchMap(token =>
      next(token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req)
    )
  );
};
