import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sign-up',
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
        <mat-card-title>Create Account</mat-card-title>
        <mat-card-subtitle>Sign up for a new account</mat-card-subtitle>
      </mat-card-header>
      <mat-card-content>
        <form [formGroup]="signUpForm" (ngSubmit)="emailSigUp()" class="flex flex-col gap-4">
          <mat-form-field floatLabel="always" appearance="outline" class="w-full">
            <mat-label>Name</mat-label>
            <input matInput type="text" formControlName="name" placeholder="Enter your name" />
            @if (signUpForm.get('name')?.invalid && signUpForm.get('name')?.touched) {
              <mat-error>Name must be at least 2 characters</mat-error>
            }
          </mat-form-field>

          <mat-form-field floatLabel="always" appearance="outline" class="w-full">
            <mat-label>Email</mat-label>
            <input matInput type="email" formControlName="email" placeholder="Enter your email" />
            @if (signUpForm.get('email')?.invalid && signUpForm.get('email')?.touched) {
              <mat-error>Email is required and must be valid</mat-error>
            }
          </mat-form-field>

          <mat-form-field floatLabel="always" appearance="outline" class="w-full">
            <mat-label>Password</mat-label>
            <input matInput type="password" formControlName="password" placeholder="Enter your password" />
            @if (signUpForm.get('password')?.invalid && signUpForm.get('password')?.touched) {
              <mat-error>Password must be at least 6 characters</mat-error>
            }
          </mat-form-field>

          <button mat-raised-button color="primary" type="submit" class="w-full">
            @if (isLoading()) {
              Creating account...
            } @else {
              Sign Up
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
            Already have an account?
            <a routerLink="/sign-in" class="text-primary-600 hover:text-primary-700 ml-1 font-medium"> Sign in </a>
          </span>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styleUrl: './sign-up.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex w-full h-screen items-center justify-center bg-gray-100 dark:bg-gray-900',
  },
})
export class SignUpComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  protected readonly isLoading = signal(false);

  protected readonly signUpForm = this.fb.group({
    name: ['', [Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  emailSigUp(): void {
    if (this.signUpForm.invalid || this.isLoading()) {
      return;
    }
    if (this.signUpForm.valid) {
      this.isLoading.set(true);
      const { name, email, password } = this.signUpForm.value;

      this.authService.signUp(email!, password!, name ?? '').subscribe({
        next: user => {
          this.isLoading.set(false);
          if (user) {
            this.router.navigate(['/dashboard']);
          }
        },
        error: error => {
          this.isLoading.set(false);
          console.error('Email register error:', error);
          // You might want to show a user-friendly error message here
        },
      });
    }
  }

  googleLogin() {
    this.authService.googleLogin();
  }
}
