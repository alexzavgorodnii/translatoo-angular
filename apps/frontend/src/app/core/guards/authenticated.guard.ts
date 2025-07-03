import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authenticatedGuard: CanActivateFn = () => {
  const router = inject(Router);
  const isAuth = inject(AuthService).user;
  if (isAuth) {
    router.navigate(['/', 'dashboard']);
    return false;
  }
  return true;
};
