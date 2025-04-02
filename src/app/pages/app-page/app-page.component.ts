import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { LucideAngularModule, Package } from 'lucide-angular';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-app-page',
  imports: [
    RouterOutlet,
    RouterModule,
    MatSidenavModule,
    LucideAngularModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatListModule,
    MatToolbarModule,
  ],
  template: `
    <mat-drawer-container class="h-screen w-full">
      <mat-drawer mode="side" opened class="sidebar">
        <div class="flex h-full flex-col">
          <div class="flex flex-col">
            <mat-toolbar>
              <span>Translatoo</span>
            </mat-toolbar>
            <mat-divider></mat-divider>
            <mat-nav-list class="!p-3">
              <a
                mat-list-item
                class="m-b-2"
                routerLink="/dashboard"
                routerLinkActive="active"
                #rlaDashboard="routerLinkActive"
                [activated]="rlaDashboard.isActive"
                [routerLinkActiveOptions]="{ exact: true }"
              >
                <mat-icon matListItemIcon>dashboard</mat-icon>
                <span matListItemTitle>Dashboard</span>
              </a>
              <a
                mat-list-item
                routerLink="/projects"
                routerLinkActive="active"
                #rlaProjects="routerLinkActive"
                [activated]="rlaProjects.isActive"
                [routerLinkActiveOptions]="{ exact: true }"
              >
                <mat-icon matListItemIcon>folder_copy</mat-icon>
                <span matListItemTitle>Projects</span>
              </a>
            </mat-nav-list>
          </div>
          <div class="flex-grow"></div>
          <div>
            <mat-divider></mat-divider>
            <mat-nav-list class="!p-3">
              <a
                mat-list-item
                routerLink="/profile"
                routerLinkActive="active"
                #rlaProfile="routerLinkActive"
                [activated]="rlaProfile.isActive"
                [routerLinkActiveOptions]="{ exact: true }"
              >
                <mat-icon matListItemIcon>person</mat-icon>
                <span matListItemTitle>Go to profile</span>
              </a>
            </mat-nav-list>
          </div>
        </div>
      </mat-drawer>
      <mat-drawer-content>
        <router-outlet></router-outlet>
      </mat-drawer-content>
    </mat-drawer-container>
  `,
  styleUrl: './app-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppPageComponent {
  readonly Package = Package;
}
