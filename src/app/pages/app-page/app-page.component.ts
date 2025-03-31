import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { LucideAngularModule, Package } from 'lucide-angular';

@Component({
  selector: 'app-app-page',
  imports: [RouterOutlet, MatSidenavModule, LucideAngularModule],
  template: `
    <mat-drawer-container class="h-screen w-full">
      <mat-drawer mode="side" opened>
        <a class="block text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300" [href]="'/'">
          <span class="sr-only">Home</span>
          <i-lucide [img]="Package" class="h-8 w-8"></i-lucide>
        </a>
      </mat-drawer>
      <mat-drawer-content><router-outlet /></mat-drawer-content>
    </mat-drawer-container>
  `,
  styleUrl: './app-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppPageComponent {
  readonly Package = Package;
}
