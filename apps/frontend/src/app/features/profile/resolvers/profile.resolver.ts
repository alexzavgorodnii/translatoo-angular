import { inject } from '@angular/core';
import type { ResolveFn } from '@angular/router';
import { User } from 'shared-types';
import { AuthService } from '../../../core/services/auth.service';
import { tap } from 'rxjs/internal/operators/tap';

export const profileResolver: ResolveFn<User> = () => {
  const authService = inject(AuthService);
  if (!authService.user) {
    return authService.fetchUserProfile().pipe(
      tap(user => {
        authService.user = user;
      }),
    );
  }
  return authService.user;
};
