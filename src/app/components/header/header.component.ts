import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideAngularModule, Package } from 'lucide-angular';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../ui/button/button.component';
import { ThemeSwitcherComponent } from '../ui/theme-switcher/theme-switcher.component';
import { HeaderUserComponent } from '../header-user/header-user.component';

@Component({
  selector: 'app-header',
  imports: [LucideAngularModule, CommonModule, ButtonComponent, ThemeSwitcherComponent, HeaderUserComponent],
  template: `
    <header class="bg-white dark:bg-gray-900">
      <div class="w-full px-4 sm:px-6 lg:px-8">
        <div class="flex h-14 items-center justify-between">
          <div class="flex-1 md:flex md:items-center md:gap-12">
            <a class="block text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300" [href]="'/'">
              <span class="sr-only">Home</span>
              <i-lucide [img]="Package" class="h-8 w-8"></i-lucide>
            </a>
            <nav aria-label="Global" class="hidden md:block">
              <ul class="flex items-center gap-6 text-sm">
                <li>
                  <app-button variant="link" size="small"> Dashboard </app-button>
                </li>
                <li>
                  <app-button variant="link" size="small"> Projects </app-button>
                </li>
              </ul>
            </nav>
          </div>

          <div class="flex items-center gap-3">
            <app-theme-switcher />
            <app-header-user />
          </div>
        </div>
      </div>
    </header>
  `,
  styleUrl: './header.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  readonly Package = Package;
}
