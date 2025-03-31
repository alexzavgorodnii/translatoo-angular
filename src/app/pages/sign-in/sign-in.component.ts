import { ChangeDetectionStrategy, Component, HostBinding } from '@angular/core';
import { SupabaseService } from '../../../services/supabase.service';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
@Component({
  selector: 'app-sign-in',
  imports: [MatCardModule],
  template: `
    <div class="flex w-full items-center justify-center">
      <mat-card appearance="raised">
        <mat-card-header>
          <mat-card-title>Welcome</mat-card-title>
          <mat-card-subtitle>Sign in to your account</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <button class="_google-btn mt-2" (click)="googleLogin()">
            <img src="google-icon.svg" alt="Google Logo" class="_google-btn__icon" />
            <span>Continue with Google</span>
          </button>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styleUrl: './sign-in.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignInComponent {
  @HostBinding('class') class = 'flex w-full h-screen items-center justify-center bg-gray-100 dark:bg-gray-900';

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly router: Router,
  ) {}

  googleLogin() {
    this.supabaseService.googleLogin().subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
    });
  }
}
