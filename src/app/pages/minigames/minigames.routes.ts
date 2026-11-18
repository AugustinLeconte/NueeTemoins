import { Routes } from '@angular/router';
import { MinigamesPage } from './minigames.page';

export const MINIGAMES_ROUTES: Routes = [
  {
    path: '',
    component: MinigamesPage,
    children: [
      { path: 'wordle', loadComponent: () => import('./wordle/wordle.page').then((m) => m.WordlePage) },
      { path: 'guess-card', loadComponent: () => import('./guess-card/guess-card.page').then((m) => m.GuessCardPage) },
      { path: 'memory', loadComponent: () => import('./memory/memory.page').then((m) => m.MemoryPage) },
    ],
  },
];
