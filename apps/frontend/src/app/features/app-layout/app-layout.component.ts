import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { Folder, LucideAngularModule, LayoutDashboard, UserCog, Users, LogOut } from 'lucide-angular';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-app-page',
  imports: [
    RouterOutlet,
    RouterModule,
    MatSidenavModule,
    LucideAngularModule,
    MatButtonModule,
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
            <mat-nav-list class="!px-3">
              @for (item of navigationLinks; track $index) {
                @if (item.enabled) {
                  <a
                    mat-list-item
                    class="mb-2"
                    [routerLink]="item.link"
                    routerLinkActive="active"
                    #rlaItem="routerLinkActive"
                    [activated]="rlaItem.isActive"
                    [routerLinkActiveOptions]="{ exact: true }"
                  >
                    <lucide-icon matListItemIcon [img]="item.icon" [size]="16"></lucide-icon>
                    <span matListItemTitle>{{ item.title }}</span>
                  </a>
                }
              }
            </mat-nav-list>
          </div>
          <div class="flex-grow"></div>
          <div class="flex flex-col">
            <mat-nav-list class="!px-3">
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
            <mat-nav-list class="!px-3">
              <a mat-list-item (click)="logoutClickHandler()" color="warn">
                <lucide-icon [img]="LogOut" [size]="16" matListItemIcon></lucide-icon>
                <span matListItemTitle>Logout</span>
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
  styleUrl: './app-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppLayoutComponent {
  navigationLinks = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      link: '/dashboard',
      enabled: false,
    },
    {
      title: 'Projects',
      icon: Folder,
      link: '/projects',
      enabled: true,
    },
    {
      title: 'Collaborators',
      icon: Users,
      link: '/collaborators',
      enabled: false,
    },
  ];
  authService = inject(AuthService);
  private router = inject(Router);
  readonly Folder = Folder;
  readonly LayoutDashboard = LayoutDashboard;
  readonly UserCog = UserCog;
  readonly Users = Users;
  readonly LogOut = LogOut;

  logoutClickHandler(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/sign-in']);
      },
      error: error => {
        console.error('Logout failed', error);
      },
    });
  }
}
