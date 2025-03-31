import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { LucideAngularModule, Package } from 'lucide-angular';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-app-page',
  imports: [RouterOutlet, MatSidenavModule, LucideAngularModule, MatButtonModule, MatDividerModule, MatIconModule],
  template: `
    <mat-drawer-container class="h-screen w-full">
      <mat-drawer mode="side" opened class="sidebar">
        <div class="flex flex-col p-3">
          <a class="flex flex-row items-center gap-2" [href]="'/'">
            <i-lucide [img]="Package" class="h-8 w-8"></i-lucide>
            <span>Translatoo</span>
          </a>
        </div>
        <mat-divider></mat-divider>
        <nav class="flex flex-col p-3">
          <ul>
            <li>
              <a mat-button href="https://www.google.com/" target="_blank" class="w-full !justify-start">
                <mat-icon>dashboard</mat-icon>
                Dashboard
              </a>
            </li>
            <li>
              <a mat-button href="https://www.google.com/" target="_blank" class="w-full !justify-start">
                <mat-icon>folder_copy</mat-icon>
                Projects
              </a>
            </li>
          </ul>
        </nav>
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
