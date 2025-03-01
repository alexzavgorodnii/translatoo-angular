import { ChangeDetectionStrategy, Component, inject, OnDestroy } from '@angular/core';
import { LucideAngularModule, Package } from 'lucide-angular';
import { SupabaseService } from '../../../services/supabase.service';
import { Router } from '@angular/router';
import { Subject } from 'rxjs/internal/Subject';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';

@Component({
  selector: 'app-header',
  imports: [LucideAngularModule],
  template: `
    <header class="bg-white dark:bg-gray-900">
      <div class="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <div class="flex h-14 items-center justify-between">
          <div class="flex-1 md:flex md:items-center md:gap-12">
            <a class="block text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300" [href]="'/'">
              <span class="sr-only">Home</span>
              <i-lucide [img]="Package" class="h-8 w-8"></i-lucide>
            </a>
            <nav aria-label="Global" class="hidden md:block">
              <ul class="flex items-center gap-6 text-sm">
                <li>
                  <a
                    class="text-gray-500 transition hover:text-gray-500/75 dark:text-white dark:hover:text-white/75"
                    [href]="'/'"
                  >
                    Dashboard
                  </a>
                </li>

                <li>
                  <a
                    class="text-gray-500 transition hover:text-gray-500/75 dark:text-white dark:hover:text-white/75"
                    [href]="'/projects'"
                  >
                    Projects
                  </a>
                </li>
              </ul>
            </nav>
          </div>

          <div class="md:flex md:items-center md:gap-12">
            <div class="relative">
              <button
                type="button"
                [class]="
                  'overflow-hidden rounded-full border border-gray-300 ' +
                  'cursor-pointer shadow-inner dark:border-gray-600'
                "
                (click)="toggleMenu()"
              >
                <img src="" alt="" class="size-8 object-cover" />
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
            </div>
          </div>
        </div>
      </div>
    </header>
  `,
  styleUrl: './header.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent implements OnDestroy {
  showMenu = false;
  readonly Package = Package;
  private readonly supabaseService = inject(SupabaseService);
  private readonly router = inject(Router);
  private readonly destroy$ = new Subject<void>();

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
