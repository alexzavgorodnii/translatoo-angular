import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { SupabaseService } from '../../../../services/supabase.service';
import { ProjectWithLanguages } from '../../../../models/projects';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { LucideAngularModule, PanelLeft, Plus } from 'lucide-angular';
import { MatDialog } from '@angular/material/dialog';
import { NewLanguageComponent } from './new-language/new-language.component';
import { StateService } from '../../../store/state.service';

@Component({
  selector: 'app-project',
  imports: [
    MatToolbarModule,
    MatDividerModule,
    MatButtonModule,
    MatProgressBarModule,
    MatListModule,
    MatCardModule,
    RouterModule,
    LucideAngularModule,
  ],
  template: `
    <mat-toolbar>
      <div class="flex flex-row items-center gap-2">
        <button mat-button>
          <lucide-icon [img]="PanelLeft" [size]="16"></lucide-icon>
        </button>
        <span>|</span>
        <a mat-button [routerLink]="['/', 'projects']">Projects</a>
        <span>/</span>
        <button mat-button disabled>{{ title() }}</button>
      </div>
      <div class="flex-grow"></div>
      <button mat-button [routerLink]="['/', 'projects', project().id, 'new-language']">
        <span class="inline-flex flex-row items-center gap-1">
          <lucide-icon [img]="Plus" [size]="16"></lucide-icon>
          New language
        </span>
      </button>
    </mat-toolbar>
    <mat-divider></mat-divider>
    <div class="w-full p-10">
      @if (loading()) {
        <mat-progress-bar mode="query"></mat-progress-bar>
      } @else {
        <mat-list>
          @for (language of project().languages; track language.id) {
            <mat-card appearance="raised">
              <mat-card-content>
                <mat-list-item>
                  <div matListItemTitle>
                    <b>{{ language.name }}</b>
                  </div>
                  <div matListItemLine>
                    <span>Language progress: {{ language.progress }}%</span>
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
  readonly PanelLeft = PanelLeft;
  readonly Plus = Plus;
  private supabaseService: SupabaseService = inject(SupabaseService);
  private stateService: StateService = inject(StateService);
  private readonly route = inject(ActivatedRoute);

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      console.error('No project ID provided in the route.');
      this.loading.set(false);
      return;
    }
    this.supabaseService
      .getProject(id)
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: project => {
          // Calculate progress for each language
          project.languages.forEach(language => {
            const totalTranslations = language.translations.length;
            const translatedCount = language.translations.filter(
              translation => translation.value && translation.value.length !== 0,
            ).length;
            language.progress = totalTranslations > 0 ? (translatedCount / totalTranslations) * 100 : 0;
          });
          this.project.set(project);
          this.stateService.project = project; // Update the state service with the current project
          this.title.set(project.name);
          this.loading.set(false);
        },
        error: error => {
          console.error('Error loading project:', error);
          this.loading.set(false);
        },
      });
  }

  openNewLanguageDialog(): void {
    const dialogRef = this.dialog.open(NewLanguageComponent, {
      width: '400px',
      data: {
        project: this.project(),
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        result.progress = 0; // Initialize progress to 0
        // Update the project with the new language
        this.project.update(project => {
          const updatedLanguages = [...project.languages, result];
          return {
            ...project,
            languages: updatedLanguages,
          };
        });
      }
    });
  }
}
