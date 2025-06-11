import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./features/app-layout/app-layout.component').then(m => m.AppLayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'projects',
        pathMatch: 'full',
      },
      {
        title: 'Profile | Translatoo',
        path: 'profile',
        loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent),
      },
      {
        title: 'Dashboard | Translatoo',
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        title: 'Projects | Translatoo',
        path: 'projects',
        loadComponent: () => import('./features/projects/projects.component').then(m => m.ProjectsComponent),
      },
      {
        title: 'Project | Translatoo',
        path: 'projects/:id',
        loadComponent: () => import('./features/project/project.component').then(m => m.ProjectComponent),
      },
      {
        title: 'New Language | Translatoo',
        path: 'projects/:id/new-language',
        loadComponent: () =>
          import('./features/project/pages/new-language/new-language.component').then(m => m.NewLanguageComponent),
      },
      {
        title: 'Language | Translatoo',
        path: 'languages/:id',
        loadComponent: () => import('./features/language/language.component').then(m => m.LanguageComponent),
      },
      {
        title: 'Import Language Keys | Translatoo',
        path: 'languages/:id/import',
        loadComponent: () =>
          import('./features/language/pages/import-language/import-language.component').then(
            m => m.ImportLanguageComponent,
          ),
      },
      {
        title: 'Collaborators | Translatoo',
        path: 'collaborators',
        loadComponent: () =>
          import('./features/collaborators/collaborators.component').then(m => m.CollaboratorsComponent),
      },
    ],
  },
  {
    title: 'Sign In | Translatoo',
    path: 'sign-in',
    loadComponent: () => import('./features/sign-in/sign-in.component').then(m => m.SignInComponent),
  },
];
