import { Routes } from '@angular/router';
import { AdminPage } from './admin.page';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminPage,
    children: [
      { path: '', redirectTo: 'families', pathMatch: 'full' },
      { path: 'families', loadComponent: () => import('./family-admin/family-admin.page').then(m => m.FamilyAdminPage) },
      { path: 'cards', loadComponent: () => import('./card-admin/card-admin.page').then(m => m.CardAdminPage) },
      { path: 'cards/new', loadComponent: () => import('../card-create/card-create.page').then(m => m.CardCreatePage) },
      { path: 'cards/:publicId', loadComponent: () => import('../card-create/card-create.page').then(m => m.CardCreatePage) },
      { path: 'cards/:cardPublicId/arts', loadComponent: () => import('./card-arts/card-arts-admin.page').then(m => m.CardArtsAdminPage)},
      { path: 'cards/:cardPublicId/arts/new', loadComponent: () => import('./art-edit/art-edit.page').then(m => m.ArtEditPage)},
      { path: 'arts/:artPublicId', loadComponent: () => import('./art-edit/art-edit.page').then(m => m.ArtEditPage)},
    ],
  },
];
