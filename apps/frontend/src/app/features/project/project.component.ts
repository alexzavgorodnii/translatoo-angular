import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { LucideAngularModule, Plus } from 'lucide-angular';
import { MatDialog } from '@angular/material/dialog';
import { ProjectsService } from '../projects/services/projects.service';
import { DecimalPipe } from '@angular/common';
import { BreadcrumbsComponent } from '../../shared/components/breadcrumbs/breadcrumbs.component';
import { ProjectStore } from './store/project-store';
import { ErrorMessageComponent } from '../../shared/components/error-message/error-message';

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
    ErrorMessageComponent,
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
      <button mat-button [routerLink]="['/', 'projects', projectStore.project().id, 'new-language']">
        <span class="inline-flex flex-row items-center gap-1">
          <lucide-icon [img]="Plus" [size]="16"></lucide-icon>
          New language
        </span>
      </button>
    </mat-toolbar>
    <div class="w-full p-10">
      @if (projectStore.loading()) {
        <mat-progress-bar mode="query"></mat-progress-bar>
      } @else if (projectStore.isError()) {
        <app-error-message [title]="'Project loading error'" />
      } @else {
        <mat-list>
          @for (language of projectStore.project().languages; track language.id) {
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
  styleUrl: './project.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectComponent {
  title = signal<string>('Loading...');
  readonly dialog = inject(MatDialog);
  readonly Plus = Plus;
  readonly projectStore = inject(ProjectStore);
  private projectsService = inject(ProjectsService);
  private readonly route = inject(ActivatedRoute);

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.projectStore.setLoading(false);
      this.projectStore.setError(true);
      return;
    }
    this.init(id);
  }

  private async init(id: string): Promise<void> {
    try {
      this.projectStore.setLoading(true);
      const project = await this.projectsService.getProject(id);
      project.languages.forEach(language => {
        const totalTranslations = language.translations.length;
        const translatedCount = language.translations.filter(
          translation => translation.value && translation.value.length !== 0,
        ).length;
        language.progress = totalTranslations > 0 ? (translatedCount / totalTranslations) * 100 : 0;
      });
      this.projectStore.setProject(project);
      this.title.set(project.name);
      this.projectStore.setLoading(false);
    } catch (error) {
      console.error('Error loading project:', error);
      this.projectStore.setLoading(false);
      this.projectStore.setError(true);
    }
  }
}
