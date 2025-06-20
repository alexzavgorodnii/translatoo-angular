import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Plus } from 'lucide-angular';
import { MatDialog } from '@angular/material/dialog';
import { NewProjectComponent } from './components/new-project/new-project.component';
import { ProjectsService } from './services/projects.service';
import { BreadcrumbsComponent } from '../../shared/components/breadcrumbs/breadcrumbs.component';
import { ProjectsStore } from './store/projects-store';
import { ErrorMessageComponent } from '../../shared/components/error-message/error-message';

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
    ErrorMessageComponent,
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
      @if (projectsStore.loading()) {
        <mat-progress-bar mode="query"></mat-progress-bar>
      } @else if (projectsStore.isError()) {
        <app-error-message [title]="'Projects loading error'" />
      } @else {
        <mat-list>
          @for (project of projectsStore.projects(); track project.id) {
            <mat-card appearance="raised" class="mb-4">
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
  readonly Plus = Plus;
  readonly dialog = inject(MatDialog);
  readonly projectsStore = inject(ProjectsStore);
  private projectsService = inject(ProjectsService);

  constructor() {
    this.init();
  }

  openNewProjectDialog(): void {
    const dialogRef = this.dialog.open(NewProjectComponent, {
      width: '400px',
      data: {},
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.projectsStore.updateState(state => ({
          ...state,
          projects: [...state.projects, result],
        }));
      }
    });
  }

  private async init() {
    try {
      this.projectsStore.setError(false);
      this.projectsStore.setProjects(await this.projectsService.getProjects());
      this.projectsStore.setLoading(false);
    } catch (error) {
      console.error('Error fetching projects:', error);
      this.projectsStore.setLoading(false);
      this.projectsStore.setError(true);
    }
  }
}
