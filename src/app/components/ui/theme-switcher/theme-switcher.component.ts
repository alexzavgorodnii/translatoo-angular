import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ButtonComponent } from '../button/button.component';
import { LucideAngularModule, Moon, Sun } from 'lucide-angular';
import { getStorage, StorageKeys } from '../../../../utils/storage';

@Component({
  selector: 'app-theme-switcher',
  imports: [ButtonComponent, LucideAngularModule],
  template: `
    <app-button variant="link" size="small" (clicked)="toggleTheme()">
      <i-lucide [img]="isDark ? Moon : Sun" class="h-5 w-5"></i-lucide>
    </app-button>
  `,
  styleUrl: './theme-switcher.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeSwitcherComponent {
  readonly Sun = Sun;
  readonly Moon = Moon;
  isDark = getStorage(StorageKeys.theme) === 'dark';

  constructor() {
    document.documentElement.classList.toggle(
      'dark',
      getStorage(StorageKeys.theme) === 'dark' ||
        (!getStorage(StorageKeys.theme) && window.matchMedia('(prefers-color-scheme: dark)').matches),
    );
  }

  toggleTheme() {
    this.isDark = !this.isDark;
    document.documentElement.classList.toggle('dark', this.isDark);
    localStorage.setItem(StorageKeys.theme, this.isDark ? 'dark' : 'light');
  }
}
