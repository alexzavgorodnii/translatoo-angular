/* eslint-disable @typescript-eslint/no-unused-vars */
import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { map } from 'rxjs/internal/operators/map';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  return inject(AuthService)
    .isAuth()
    .pipe(
      map(isAuth => {
        if (!isAuth) {
          router.navigate(['/sign-in']);
          return false;
        }
        return true;
      }),
    );
};
