import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { LucideAngularModule, Plus } from 'lucide-angular';
import { MatDialog } from '@angular/material/dialog';
import { ProjectWithLanguages } from '../../core/models/projects';
import { ProjectsService } from '../projects/services/projects.service';
import { StateService } from '../../store/state.service';
import { DecimalPipe } from '@angular/common';
import { BreadcrumbsComponent } from '../../shared/components/breadcrumbs/breadcrumbs.component';

@Component({
  selector: 'app-project',
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatProgressBarModule,
    MatListModule,
    MatCardModule,
    RouterModule,
    LucideAngularModule,
    DecimalPipe,
    BreadcrumbsComponent,
  ],
  template: `
    <mat-toolbar>
      <app-breadcrumbs
        [breadcrumbs]="[
          { type: 'link', title: 'Projects', route: ['/projects'] },
          { type: 'title', title: title() },
        ]"
      />
      <div class="flex-grow"></div>
      <button mat-button [routerLink]="['/', 'projects', project().id, 'new-language']">
        <span class="inline-flex flex-row items-center gap-1">
          <lucide-icon [img]="Plus" [size]="16"></lucide-icon>
          New language
        </span>
      </button>
    </mat-toolbar>
    <div class="w-full p-10">
      @if (loading()) {
        <mat-progress-bar mode="query"></mat-progress-bar>
      } @else {
        <mat-list>
          @for (language of project().languages; track language.id) {
            <mat-card appearance="raised" class="mb-4">
              <mat-card-content>
                <mat-list-item>
                  <div matListItemTitle>
                    <b>{{ language.name }}</b>
                  </div>
                  <div matListItemLine>
                    <span>Language progress: {{ language.progress | number: '1.1-1' }}%</span>
                    <mat-progress-bar mode="determinate" [value]="language.progress"></mat-progress-bar>
                  </div>
                  <div class="flex-grow"></div>
                  <div matListItemMeta>
                    <a [routerLink]="['/', 'languages', language.id]" mat-stroked-button>Open</a>
                  </div>
                </mat-list-item>
              </mat-card-content>
            </mat-card>
          }
        </mat-list>
      }
    </div>
  `,
  styleUrl: './project.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectComponent {
  project = signal<ProjectWithLanguages>({
    id: '',
    created_at: '',
    name: '',
    languages: [],
  });
  loading = signal<boolean>(true);
  title = signal<string>('Loading...');
  readonly dialog = inject(MatDialog);
  readonly Plus = Plus;
  private projectsService = inject(ProjectsService);
  private stateService = inject(StateService);
  private readonly route = inject(ActivatedRoute);

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.loading.set(false);
      return;
    }
    this.projectsService
      .getProject(id)
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: project => {
          project.languages.forEach(language => {
            const totalTranslations = language.translations.length;
            const translatedCount = language.translations.filter(
              translation => translation.value && translation.value.length !== 0,
            ).length;
            language.progress = totalTranslations > 0 ? (translatedCount / totalTranslations) * 100 : 0;
          });
          this.project.set(project);
          this.stateService.project = project;
          this.title.set(project.name);
          this.loading.set(false);
        },
        error: error => {
          console.error('Error loading project:', error);
          this.loading.set(false);
        },
      });
  }
}
