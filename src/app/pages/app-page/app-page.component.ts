import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { Folder, LucideAngularModule, LayoutDashboard, UserCog, Users } from 'lucide-angular';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
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
              @if (false) {
                <a
                  mat-list-item
                  class="mb-2"
                  routerLink="/dashboard"
                  routerLinkActive="active"
                  #rlaDashboard="routerLinkActive"
                  [activated]="rlaDashboard.isActive"
                  [routerLinkActiveOptions]="{ exact: true }"
                >
                  <lucide-icon matListItemIcon [img]="LayoutDashboard" [size]="16"></lucide-icon>
                  <span matListItemTitle>Dashboard</span>
                </a>
              }

              <a
                mat-list-item
                class="mb-2"
                routerLink="/projects"
                routerLinkActive="active"
                #rlaProjects="routerLinkActive"
                [activated]="
                  isLinkActive('/projects') ||
                  rlaProjects.isActive ||
                  isLinkActive('/languages') ||
                  isLinkActive('/new-language')
                "
                [routerLinkActiveOptions]="{ exact: true }"
              >
                <lucide-icon matListItemIcon [img]="Folder" [size]="16"></lucide-icon>
                <span matListItemTitle>Projects</span>
              </a>
              <a
                mat-list-item
                routerLink="/collaborators"
                routerLinkActive="active"
                #rlaCollaborators="routerLinkActive"
                [activated]="rlaCollaborators.isActive"
                [routerLinkActiveOptions]="{ exact: true }"
              >
                <lucide-icon matListItemIcon [img]="Users" [size]="16"></lucide-icon>
                <span matListItemTitle>Collaborators</span>
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
                <lucide-icon matListItemIcon [img]="UserCog" [size]="16"></lucide-icon>
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
  private router: Router = inject(Router);
  readonly Folder = Folder;
  readonly LayoutDashboard = LayoutDashboard;
  readonly UserCog = UserCog;
  readonly Users = Users;

  isLinkActive(url: string): boolean {
    const baseUrl = this.router.url;
    return baseUrl.indexOf(url) !== -1;
  }
}
