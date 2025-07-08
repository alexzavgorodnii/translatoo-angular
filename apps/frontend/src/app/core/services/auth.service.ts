import { Injectable, signal } from '@angular/core';
import { finalize, map, Observable, of, tap } from 'rxjs';
import { AuthApi } from './api.service';
import { User } from 'shared-types';
import { AuthResponse } from '../models/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService extends AuthApi {
  private _accessToken = signal<string | null>(null);
  private readonly isAuthenticated = signal<boolean>(false);
  private refreshing = false;

  readonly authenticated = this.isAuthenticated.asReadonly();

  set accessToken(token: string | null) {
    this._accessToken.set(token);
  }

  get accessToken(): string | null {
    return this._accessToken();
  }

  constructor() {
    super();
  }

  private clearAuthData(): void {
    this.user = null; // Use the inherited user property
    this.isAuthenticated.set(false);
  }

  googleLogin(): void {
    window.location.href = `${this.apiUrl}/auth/google`;
  }

  handleOAuthCallback(): Observable<User | null> {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('accessToken');
    const error = urlParams.get('error');

    if (error) {
      console.error('OAuth error:', error);
      return of(null);
    }

    if (accessToken) {
      this.accessToken = accessToken;
      this.isAuthenticated.set(true);

      window.history.replaceState({}, document.title, window.location.pathname);

      return this.fetchUserProfile();
    }

    return of(null);
  }

  signUp(email: string, password: string, name?: string): Observable<User> {
    return this.http.post<User>(
      `${this.apiUrl}/auth/signup`,
      {
        email,
        password,
        name,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
  }

  signIn(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(
        `${this.apiUrl}/auth/login`,
        {
          email,
          password,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        },
      )
      .pipe(
        tap(authResponse => {
          this.accessToken = authResponse.accessToken;
          this.isAuthenticated.set(true);

          this.fetchUserProfile().subscribe(userData => {
            this.user = userData;
          });
        }),
      );
  }

  fetchUserProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/profile`).pipe(
      tap(userData => {
        this.user = userData;
      }),
    );
  }

  refreshToken(): Observable<string> {
    if (this.refreshing) return of(null as any);
    this.refreshing = true;

    return this.http.post<{ accessToken: string }>(`${this.apiUrl}/auth/refresh`, {}, { withCredentials: true }).pipe(
      tap(res => (this.accessToken = res.accessToken)),
      map(res => res.accessToken),
      finalize(() => (this.refreshing = false)),
    );
  }

  logout(): Observable<void> {
    return this.http
      .post<void>(
        `${this.apiUrl}/auth/logout`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        },
      )
      .pipe(
        tap(() => {
          this.clearAuthData();
        }),
      );
  }
}
