/* eslint-disable @typescript-eslint/no-unused-vars */
import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';
import { map } from 'rxjs/internal/operators/map';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  return inject(SupabaseService)
    .isAuth()
    .pipe(
      map(isAuth => {
        console.log('isAuth:', isAuth);
        if (!isAuth) {
          router.navigate(['/sign-in']);
          return false;
        }
        return true;
      }),
    );
};
