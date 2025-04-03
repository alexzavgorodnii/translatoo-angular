import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { SupabaseService } from '../../../../services/supabase.service';
import { Project } from '../../../../models/projects';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-projects',
  imports: [
    MatToolbarModule,
    MatDividerModule,
    MatListModule,
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    MatProgressBarModule,
    RouterModule,
  ],
  template: `
    <mat-toolbar>
      <div class="flex flex-row items-center gap-2">
        <button mat-button>
          <mat-icon class="!m-0">left_panel_close</mat-icon>
        </button>
        <span>|</span>
        <span>Projects</span>
      </div>
      <div class="flex-grow"></div>
      <button mat-button>
        <mat-icon>add</mat-icon>
        New project
      </button>
    </mat-toolbar>
    <mat-divider></mat-divider>
    <div class="w-full p-10">
      @if (loading()) {
        <mat-progress-bar mode="query"></mat-progress-bar>
      } @else {
        <mat-list>
          @for (project of projects; track project.id) {
            <mat-card appearance="raised">
              <mat-card-content>
                <mat-list-item>
                  <div matListItemTitle>{{ project.name }}</div>
                  <div class="flex-grow"></div>
                  <div matListItemMeta>
                    <a [routerLink]="['/', 'projects', project.id]" mat-stroked-button>Open</a>
                  </div>
                </mat-list-item>
              </mat-card-content>
            </mat-card>
          }
        </mat-list>
      }
    </div>
  `,
  styleUrl: './projects.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectsComponent {
  projects: Project[] = [];
  loading = signal<boolean>(true);
  private supabaseService: SupabaseService = inject(SupabaseService);

  constructor() {
    this.supabaseService
      .getProjects()
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: projects => {
          this.projects = projects;
          this.loading.set(false);
        },
        error: error => {
          console.error('Error loading projects:', error);
          this.loading.set(false);
        },
      });
  }
}
