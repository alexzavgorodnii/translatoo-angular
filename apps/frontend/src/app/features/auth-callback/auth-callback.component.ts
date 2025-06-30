import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-auth-callback',
  imports: [MatProgressSpinnerModule],
  template: `
    <div class="flex h-screen w-full items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div class="text-center">
        <mat-spinner diameter="48" class="mx-auto mb-4"></mat-spinner>
        <h2 class="text-lg font-medium text-gray-900 dark:text-gray-100">Completing sign in...</h2>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Please wait while we redirect you to your dashboard.
        </p>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthCallbackComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.authService.handleOAuthCallback().subscribe({
      next: user => {
        if (user) {
          this.router.navigate(['/dashboard']);
        } else {
          this.router.navigate(['/sign-in'], {
            queryParams: { error: 'oauth_failed' },
          });
        }
      },
      error: () => {
        this.router.navigate(['/sign-in'], {
          queryParams: { error: 'oauth_error' },
        });
      },
    });
  }
}
