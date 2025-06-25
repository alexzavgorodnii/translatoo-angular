import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';
import { switchMap, finalize, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
@Component({
  selector: 'app-sign-in',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatDividerModule,
    ReactiveFormsModule,
    RouterLink,
  ],
  template: `
    <mat-card appearance="raised" class="w-full max-w-md p-5">
      <mat-card-header class="mb-4 flex flex-col items-center text-center">
        <mat-card-title>Welcome</mat-card-title>
        <mat-card-subtitle>Sign in to your account</mat-card-subtitle>
      </mat-card-header>
      <mat-card-content>
        <form [formGroup]="signInForm" (ngSubmit)="emailLogin()" class="flex flex-col gap-4">
          <mat-form-field floatLabel="always" appearance="outline" class="w-full">
            <mat-label>Email</mat-label>
            <input matInput type="email" formControlName="email" placeholder="Enter your email" />
            @if (signInForm.get('email')?.invalid && signInForm.get('email')?.touched) {
              <mat-error>Email is required and must be valid</mat-error>
            }
          </mat-form-field>

          <mat-form-field floatLabel="always" appearance="outline" class="w-full">
            <mat-label>Password</mat-label>
            <input matInput type="password" formControlName="password" placeholder="Enter your password" />
            @if (signInForm.get('password')?.invalid && signInForm.get('password')?.touched) {
              <mat-error>Password is required</mat-error>
            }
          </mat-form-field>

          <button mat-raised-button color="primary" type="submit" class="w-full">
            @if (isLoading()) {
              Signing in...
            } @else {
              Sign In
            }
          </button>
        </form>

        <div class="flex items-center justify-center">
          <span class="px-4 text-sm text-gray-500">or</span>
        </div>

        <button class="_google-btn mx-auto mt-2 w-full" (click)="googleLogin()">
          <img src="google-icon.svg" alt="Google Logo" class="_google-btn__icon" />
          <span>Continue with Google</span>
        </button>

        <div class="mt-4 text-center">
          <span class="text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?
            <a routerLink="/sign-up" class="text-primary-600 hover:text-primary-700 ml-1 font-medium"> Sign up </a>
          </span>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styleUrl: './sign-in.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex w-full h-screen items-center justify-center bg-gray-100 dark:bg-gray-900',
  },
})
export class SignInComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  protected readonly isLoading = signal(false);

  protected readonly signInForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  emailLogin(): void {
    if (this.signInForm.invalid || this.isLoading()) {
      return;
    }

    if (this.signInForm.valid) {
      this.isLoading.set(true);
      const { email, password } = this.signInForm.value;

      this.authService
        .signIn(email!, password!)
        .pipe(
          switchMap(() => {
            // After successful sign-in, fetch user profile
            return this.authService.fetchUserProfile();
          }),
          finalize(() => {
            this.isLoading.set(false);
          }),
          catchError(error => {
            console.error('Email login error:', error);
            // Handle different types of errors
            if (error.status === 401) {
              // Invalid credentials
              console.error('Invalid email or password');
            } else if (error.status === 500) {
              // Server error
              console.error('Server error. Please try again later.');
            } else {
              // Other errors
              console.error('An unexpected error occurred');
            }
            return of(null); // Return null to handle error gracefully
          }),
        )
        .subscribe({
          next: user => {
            if (user) {
              // Authentication and user fetch successful
              console.log('User authenticated and profile loaded:', user);
              this.router.navigate(['/dashboard']);
            }
          },
        });
    }
  }

  googleLogin() {
    this.authService
      .googleLogin()
      .pipe(
        switchMap(() => {
          // After successful Google sign-in, fetch user profile
          return this.authService.fetchUserProfile();
        }),
        catchError(error => {
          console.error('Google login error:', error);
          return of(null);
        }),
      )
      .subscribe({
        next: user => {
          if (user) {
            console.log('Google authentication successful, user profile loaded:', user);
            this.router.navigate(['/dashboard']);
          }
        },
      });
  }
}
