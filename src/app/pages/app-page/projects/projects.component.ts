import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { SupabaseService } from '../../../../services/supabase.service';
import { Subject } from 'rxjs/internal/Subject';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { Project } from '../../../../models/projects';

@Component({
  selector: 'app-projects',
  imports: [MatToolbarModule, MatDividerModule, MatListModule, MatIconModule, MatCardModule, MatButtonModule],
  template: `
    <mat-toolbar>
      <span>Projects</span>
      <div class="flex-grow"></div>
      <button mat-flat-button>Create project</button>
    </mat-toolbar>
    <mat-divider></mat-divider>
    <div class="w-full p-10">
      <mat-list>
        @for (project of projects; track project.id) {
          <mat-card appearance="raised">
            <mat-card-content>
              <mat-list-item>
                <!-- <mat-icon matListItemIcon>folder</mat-icon> -->
                <div matListItemTitle>{{ project.name }}</div>
                <div class="flex-grow"></div>
                <button matListItemMeta mat-button>Open</button>
                <!-- <div matListItemLine>{{ '100%' }}</div> -->
              </mat-list-item>
            </mat-card-content>
          </mat-card>
        }
      </mat-list>
    </div>
  `,
  styleUrl: './projects.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectsComponent implements OnInit, OnDestroy {
  projects: Project[] = [];
  private supabaseService: SupabaseService = inject(SupabaseService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroy$ = new Subject<void>();
  ngOnInit() {
    this.supabaseService
      .getProjects()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: projects => {
          this.projects = projects;
          this.cdr.markForCheck();
          this.cdr.detectChanges();
        },
        error: error => {
          console.error('Error fetching projects:', error);
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
