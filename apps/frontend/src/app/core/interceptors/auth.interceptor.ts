import type { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';
import { catchError } from 'rxjs/internal/operators/catchError';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { throwError } from 'rxjs/internal/observable/throwError';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const accessToken = authService.accessToken;
  const authRequest = accessToken
    ? req.clone({
        headers: req.headers.set('Authorization', `Bearer ${accessToken}`),
      })
    : req;

  return next(authRequest).pipe(
    catchError(error => {
      if (error.status === 401) {
        return authService.refreshToken().pipe(
          switchMap(newToken => {
            if (!newToken) return throwError(() => error);
            const retryReq = req.clone({
              headers: req.headers.set('Authorization', `Bearer ${newToken}`),
            });
            return next(retryReq);
          }),
        );
      }
      return throwError(() => error);
    }),
  );
};
