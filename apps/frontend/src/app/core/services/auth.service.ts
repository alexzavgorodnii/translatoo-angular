import { Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { AuthApi } from './api.service';
import { User } from 'shared-types';
import { AuthResponse } from '../models/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService extends AuthApi {
  // Signal to track authentication status
  private readonly isAuthenticated = signal<boolean>(false);

  // Public readonly signal for authentication status
  readonly authenticated = this.isAuthenticated.asReadonly();

  constructor() {
    super();
    // Check for existing authentication on service initialization
    this.checkStoredAuth();
  }

  /**
   * Check for stored authentication tokens and validate them
   */
  private checkStoredAuth(): void {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    const storedUser = this.getStoredUser();

    if (accessToken && refreshToken) {
      this.isAuthenticated.set(true);

      if (storedUser) {
        this.user = storedUser;
      }

      // Optionally validate token and refresh user profile
      // this.fetchUserProfile().subscribe();
    }
  }

  /**
   * Save authentication tokens and user data
   */
  private saveAuthData(authResponse: AuthResponse, userData?: User): void {
    localStorage.setItem('accessToken', authResponse.accessToken);
    localStorage.setItem('refreshToken', authResponse.refreshToken);

    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
      this.user = userData; // Use the inherited user property
    }

    this.isAuthenticated.set(true);
  }

  /**
   * Clear all authentication data
   */
  private clearAuthData(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    this.user = null; // Use the inherited user property
    this.isAuthenticated.set(false);
  }

  /**
   * Get stored user data
   */
  getStoredUser(): User | null {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      try {
        return JSON.parse(userJson) as User;
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        return null;
      }
    }
    return null;
  }

  googleLogin(): Observable<AuthResponse> {
    return this.http.get<AuthResponse>(`${this.apiUrl}/auth/google`).pipe(
      tap(authResponse => {
        this.saveAuthData(authResponse);
      }),
    );
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
        },
      )
      .pipe(
        tap(authResponse => {
          this.saveAuthData(authResponse);
        }),
      );
  }

  /**
   * Fetch user profile after authentication
   */
  fetchUserProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/auth/profile`).pipe(
      tap(userData => {
        this.user = userData; // Use the inherited user property
        localStorage.setItem('user', JSON.stringify(userData));
      }),
    );
  }

  logout(refreshToken?: string): Observable<void> {
    const token = refreshToken || localStorage.getItem('refreshToken');

    return this.http
      .post<void>(
        `${this.apiUrl}/auth/logout`,
        { refreshToken: token },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )
      .pipe(
        tap(() => {
          this.clearAuthData();
        }),
      );
  }

  /**
   * Check if user is authenticated
   */
  isAuth(): boolean {
    const token = localStorage.getItem('accessToken');
    return !!token;
  }

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }
}
