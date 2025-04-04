import { ChangeDetectionStrategy, Component, AfterViewInit, inject, signal, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { LanguageWithTranslations } from '../../../../models/languages';
import { SupabaseService } from '../../../../services/supabase.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { Translation } from '../../../../models/translations';
import { Copy, FileDown, FilePenLine, FileUp, LucideAngularModule, PanelLeft, Plus } from 'lucide-angular';

@Component({
  selector: 'app-language',
  imports: [
    MatToolbarModule,
    MatDividerModule,
    MatButtonModule,
    MatProgressBarModule,
    MatCardModule,
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
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
        <a mat-button [routerLink]="['/', 'projects', language?.project_id]">Publicatique</a>
        <span>/</span>
        <button mat-button disabled>{{ title() }}</button>
      </div>
      <!-- <span>{{ title() }}</span> -->
      <div class="flex-grow"></div>
      @if (!loading()) {
        <div class="flex flex-row gap-2">
          <button mat-button>
            <span class="inline-flex flex-row items-center gap-1">
              <lucide-icon [img]="FileDown" [size]="16"></lucide-icon>
              Import
            </span>
          </button>
          <button mat-button>
            <span class="inline-flex flex-row items-center gap-1">
              <lucide-icon [img]="FileUp" [size]="16"></lucide-icon>
              Export
            </span>
          </button>
          <button mat-button>
            <span class="inline-flex flex-row items-center gap-1">
              <lucide-icon [img]="Copy" [size]="16"></lucide-icon>
              Copy to Clipboard
            </span>
          </button>
        </div>
      }
    </mat-toolbar>
    <mat-divider></mat-divider>
    <div
      class="h-[calc(100vh-var(--mat-toolbar-standard-height)-var(--mat-divider-width))] w-full overflow-hidden p-10"
    >
      @if (loading()) {
        <mat-progress-bar mode="query"></mat-progress-bar>
      } @else {
        <div
          [class]="
            'max-h-[calc(100vh-var(--mat-toolbar-standard-height)-var(--mat-paginator-container-size)-80px)] ' +
            'relative min-h-[200px] overflow-auto'
          "
        >
          <table mat-table [dataSource]="dataSource">
            <ng-container matColumnDef="key">
              <th mat-header-cell *matHeaderCellDef>Key</th>
              <td mat-cell *matCellDef="let row">{{ row.key }}</td>
            </ng-container>

            <ng-container matColumnDef="value">
              <th mat-header-cell *matHeaderCellDef>Value</th>
              <td mat-cell *matCellDef="let row">{{ row.value }}</td>
            </ng-container>

            <ng-container matColumnDef="controls">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let row">
                <button mat-icon-button>
                  <lucide-icon [img]="FilePenLine" [size]="16"></lucide-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns; sticky: true"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
          </table>
        </div>

        <mat-paginator
          [length]="dataSource.data.length"
          [pageSize]="20"
          [showFirstLastButtons]="true"
          aria-label="Select page of GitHub search results"
        ></mat-paginator>
      }
    </div>
  `,
  styleUrl: './language.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LanguageComponent implements AfterViewInit {
  readonly PanelLeft = PanelLeft;
  readonly Plus = Plus;
  readonly FileDown = FileDown;
  readonly FileUp = FileUp;
  readonly Copy = Copy;
  readonly FilePenLine = FilePenLine;
  language: LanguageWithTranslations | null = null;
  loading = signal<boolean>(false);
  title = signal<string>('Language');
  displayedColumns: string[] = ['key', 'value', 'controls'];
  dataSource = new MatTableDataSource<Translation>([]);
  @ViewChild(MatPaginator) paginator?: MatPaginator;

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
      .getLanguage(id)
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: language => {
          this.language = language;
          this.dataSource.data = language.translations;
          this.title.set('Language ' + language.name);
          this.loading.set(false);
        },
        error: error => {
          console.error('Error loading project:', error);
          this.loading.set(false);
        },
      });
  }

  ngAfterViewInit() {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }
}
