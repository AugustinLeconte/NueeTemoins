import type { Routes } from '@angular/router';

export const routes: Routes = [
  { path: 'cards', loadComponent: () => import('./pages/card-list/card-list.page').then(m => m.CardListPage) },
  { path: 'cards/new', loadComponent: () => import('./pages/card-create/card-create.page').then(m => m.CardCreatePage) },
  { path: '', redirectTo: 'cards', pathMatch: 'full' },
];
