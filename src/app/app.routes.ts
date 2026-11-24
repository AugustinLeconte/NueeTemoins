import type { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';
import { OnboardingComponent } from './auth/onboarding/onboarding.component';
import { authGuard } from './auth/auth.guard';
import { AuthShellComponent } from './auth/auth-shell/auth-shell.component';
import { roleGuard } from './pages/admin/role.guard';

const legal = () => import('./pages/legal/legal.page').then((m) => m.LegalPage);

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: '',
    component: AuthShellComponent,
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'signup', component: SignupComponent },
      { path: 'onboarding', component: OnboardingComponent, canActivate: [authGuard] },
    ],
  },

  {
    path: 'cards',
    loadComponent: () => import('./pages/card-list/card-list.page').then((m) => m.CardListPage),
    canActivate: [authGuard],
  },
  {
    path: 'packs',
    loadComponent: () => import('./pages/pack-opening/pack-opening.page').then((m) => m.PackOpeningPage),
    canActivate: [authGuard],
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/profile/private-profile/profile.page').then((m) => m.ProfilePage),
  },
  {
    path: 'player/:pseudo',
    loadComponent: () => import('./pages/profile/public-profile/public-profile.page').then((m) => m.PublicProfilePage),
  },
  {
    path: 'admin',
    canMatch: [authGuard, roleGuard('ADMIN', 'TRANSLATOR')],
    loadChildren: () => import('./pages/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },
  {
    path: 'shop',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/shop/shop.page').then((m) => m.ShopPage),
  },
  {
    path: 'minigames',
    canActivate: [authGuard],
    loadChildren: () => import('./pages/minigames/minigames.routes').then((m) => m.MINIGAMES_ROUTES),
  },
  {
    path: 'friends',
    loadComponent: () => import('./pages/friends/friends.page').then((m) => m.FriendsPage),
  },
  {
    path: 'public-profile',
    loadComponent: () => import('./pages/profile/public-profile/public-profile.page').then((m) => m.PublicProfilePage),
  },
  {
    path: 'home',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/home/home.page').then((m) => m.HomePage),
  },
  { path: 'legal/terms', loadComponent: legal, data: { key: 'terms' } },
  { path: 'legal/privacy', loadComponent: legal, data: { key: 'privacy' } },
  { path: 'legal/data-safety', loadComponent: legal, data: { key: 'dataSafety' } },
  { path: 'legal/credits', loadComponent: legal, data: { key: 'credits' } },
];
