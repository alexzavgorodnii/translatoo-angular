import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs/internal/operators/map';
import { catchError } from 'rxjs/internal/operators/catchError';
import { of } from 'rxjs/internal/observable/of';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const authService = inject(AuthService);
  if (authService.accessToken) {
    return true;
  }

  return authService.refreshToken().pipe(
    map(() => true),
    catchError(() => {
      router.navigate(['/sign-in']);
      return of(false);
    }),
  );
};
