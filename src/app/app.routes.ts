import { Routes } from '@angular/router';
import { authGuard } from '../utils/auth.guard';

export const routes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/home-page/home-page.component').then(m => m.HomePageComponent),
  },
  {
    path: 'sign-in',
    loadComponent: () => import('./pages/sign-in/sign-in.component').then(m => m.SignInComponent),
  },
];
