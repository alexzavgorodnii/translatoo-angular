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
  ],
  template: `
    <mat-toolbar>
      <span>{{ title() }}</span>
      <div class="flex-grow"></div>
      <button mat-flat-button>Add language</button>
    </mat-toolbar>
    <mat-divider></mat-divider>
    <div class="w-full p-10">
      @if (loading()) {
        <mat-progress-bar mode="query"></mat-progress-bar>
      } @else {
        <mat-list>
          @for (language of project?.languages; track language.id) {
            <mat-card appearance="raised">
              <mat-card-content>
                <mat-list-item>
                  <div matListItemTitle>{{ language.name }}</div>
                  @if (language.format) {
                    <div matListItemLine>{{ language.format }} format</div>
                  }
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
  project: ProjectWithLanguages | null = null;
  loading = signal<boolean>(true);
  title = signal<string>('Project');
  private supabaseService: SupabaseService = inject(SupabaseService);
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
          this.project = project;
          this.title.set('Project ' + project.name);
          console.log('Project loaded:', project);
          this.loading.set(false);
        },
        error: error => {
          console.error('Error loading project:', error);
          this.loading.set(false);
        },
      });
  }
}
