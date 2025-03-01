import { ChangeDetectionStrategy, Component, HostBinding } from '@angular/core';
import { SupabaseService } from '../../../services/supabase.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sign-in',
  imports: [],
  template: `
    <div
      [class]="
        'w-full max-w-sm rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6 md:p-8 ' +
        'dark:border-gray-700 dark:bg-gray-800'
      "
    >
      <h2 class="text-xl font-medium text-gray-900 dark:text-white">Welcome</h2>
      <p class="mb-3 font-normal text-gray-700 dark:text-gray-400">Sign in to your account using Google</p>
      <button class="_google-btn" (click)="googleLogin()">
        <img src="google-icon.svg" alt="Google Logo" class="_google-btn__icon" />
        <span>Continue with Google</span>
      </button>
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
