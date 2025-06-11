import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Plus } from 'lucide-angular';
import { MatDialog } from '@angular/material/dialog';
import { NewProjectComponent } from './components/new-project/new-project.component';
import { Project } from '../../core/models/projects';
import { ProjectsService } from './services/projects.service';
import { BreadcrumbsComponent } from '../../shared/components/breadcrumbs/breadcrumbs.component';

@Component({
  selector: 'app-projects',
  imports: [
    MatToolbarModule,
    MatListModule,
    MatCardModule,
    MatButtonModule,
    MatProgressBarModule,
    RouterModule,
    LucideAngularModule,
    BreadcrumbsComponent,
  ],
  template: `
    <mat-toolbar>
      <app-breadcrumbs [breadcrumbs]="[{ type: 'title', title: 'Projects' }]" />
      <div class="flex-grow"></div>
      <button mat-button (click)="openNewProjectDialog()">
        <span class="inline-flex flex-row items-center gap-1">
          <lucide-icon [img]="Plus" [size]="16"></lucide-icon>
          New project
        </span>
      </button>
    </mat-toolbar>
    <div class="w-full p-10">
      @if (loading()) {
        <mat-progress-bar mode="query"></mat-progress-bar>
      } @else {
        <mat-list>
          @for (project of projects(); track project.id) {
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
  projects = signal<Project[]>([]);
  loading = signal<boolean>(true);
  readonly Plus = Plus;
  readonly dialog = inject(MatDialog);
  private projectsService = inject(ProjectsService);

  constructor() {
    this.projectsService
      .getProjects()
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: projects => {
          this.projects.set(projects);
          this.loading.set(false);
        },
        error: error => {
          console.error('Error loading projects:', error);
          this.loading.set(false);
        },
      });
  }

  openNewProjectDialog(): void {
    const dialogRef = this.dialog.open(NewProjectComponent, {
      width: '400px',
      data: {},
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.projects.update(projects => [...projects, result]);
      }
    });
  }
}
