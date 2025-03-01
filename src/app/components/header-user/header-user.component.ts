import { ChangeDetectionStrategy, Component, inject, OnDestroy } from '@angular/core';
import { SupabaseService } from '../../../services/supabase.service';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { Subject } from 'rxjs/internal/Subject';
import { User } from '@supabase/supabase-js';

@Component({
  selector: 'app-header-user',
  imports: [],
  template: `
    <button
      type="button"
      [class]="
        'h-8 w-8 rounded-full border border-gray-300 text-sm font-medium text-gray-500 ' +
        'cursor-pointer dark:border-gray-600 dark:text-gray-400'
      "
      (click)="toggleMenu()"
    >
      {{ userFullNameFirstLastLetters }}
    </button>
    @if (showMenu) {
      <div
        [class]="
          'absolute end-0 z-10 mt-0.5 w-56 rounded-md border border-gray-100 bg-white shadow-lg ' +
          'dark:border-gray-800 dark:bg-gray-900'
        "
        role="menu"
      >
        <div class="p-2">
          <a
            href="#"
            [class]="
              'block rounded-lg px-4 py-2 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700 ' +
              'dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300'
            "
            role="menuitem"
          >
            My profile
          </a>

          <a
            href="#"
            [class]="
              'block rounded-lg px-4 py-2 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700 ' +
              'dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300'
            "
            role="menuitem"
          >
            Logout
          </a>
        </div>
      </div>
    }
  `,
  styleUrl: './header-user.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderUserComponent implements OnDestroy {
  showMenu = false;
  private readonly supabaseService = inject(SupabaseService);
  private readonly router = inject(Router);
  private readonly destroy$ = new Subject<void>();

  get user(): User | null {
    return this.supabaseService.currentUser;
  }

  get userFullNameFirstLastLetters(): string {
    return (
      this.user?.user_metadata['full_name']
        ?.split(' ')
        .map((name: string) => name[0])
        .join('') ?? ''
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleMenu() {
    this.showMenu = !this.showMenu;
  }

  logout() {
    this.supabaseService
      .logout()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.router.navigate(['/sign-in']);
      });
  }
}
