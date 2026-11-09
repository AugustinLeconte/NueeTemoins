import type { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';
import { OnboardingComponent } from './auth/onboarding/onboarding.component';
import { authGuard } from './auth/auth.guard';

export const routes: Routes = [
  {
    path: 'cards',
    loadComponent: () => import('./pages/card-list/card-list.page').then((m) => m.CardListPage),
    canActivate: [authGuard],
  },
  {
    path: 'cards/new',
    loadComponent: () => import('./pages/card-create/card-create.page').then((m) => m.CardCreatePage),
    canActivate: [authGuard],
  },
  { path: '', redirectTo: 'cards', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'onboarding', component: OnboardingComponent, canActivate: [authGuard] },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/profile/profile.page').then(m => m.ProfilePage),
  },
];
