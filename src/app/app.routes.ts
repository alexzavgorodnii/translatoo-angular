import { Routes } from '@angular/router';
import { authGuard } from '../utils/auth.guard';

export const routes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/app-page/app-page.component').then(m => m.AppPageComponent),
    children: [
      {
        path: '',
        redirectTo: 'projects',
        pathMatch: 'full',
      },
      {
        title: 'Profile | Translatoo',
        path: 'profile',
        loadComponent: () => import('./pages/app-page/profile/profile.component').then(m => m.ProfileComponent),
      },
      {
        title: 'Dashboard | Translatoo',
        path: 'dashboard',
        loadComponent: () => import('./pages/app-page/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        title: 'Projects | Translatoo',
        path: 'projects',
        loadComponent: () => import('./pages/app-page/projects/projects.component').then(m => m.ProjectsComponent),
      },
      {
        title: 'Project | Translatoo',
        path: 'projects/:id',
        loadComponent: () => import('./pages/app-page/project/project.component').then(m => m.ProjectComponent),
      },
      {
        title: 'New Language | Translatoo',
        path: 'projects/:id/new-language',
        loadComponent: () =>
          import('./pages/app-page/project/new-language/new-language.component').then(m => m.NewLanguageComponent),
      },
      {
        title: 'Language | Translatoo',
        path: 'languages/:id',
        loadComponent: () => import('./pages/app-page/language/language.component').then(m => m.LanguageComponent),
      },
      {
        title: 'Import Language Keys | Translatoo',
        path: 'languages/:id/import',
        loadComponent: () =>
          import('./pages/app-page/language/import-language/import-language.component').then(
            m => m.ImportLanguageComponent,
          ),
      },
      {
        title: 'Collaborators | Translatoo',
        path: 'collaborators',
        loadComponent: () =>
          import('./pages/app-page/collaborators/collaborators.component').then(m => m.CollaboratorsComponent),
      },
    ],
  },
  {
    title: 'Sign In | Translatoo',
    path: 'sign-in',
    loadComponent: () => import('./pages/sign-in/sign-in.component').then(m => m.SignInComponent),
  },
];
