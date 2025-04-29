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
import { MatPaginator, MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { Translation } from '../../../../models/translations';
import {
  Check,
  ChevronDown,
  CloudDownload,
  CloudUpload,
  Copy,
  FilePenLine,
  LucideAngularModule,
  PanelLeft,
  Plus,
  Search,
} from 'lucide-angular';
import { generateI18Next, generateKeyValueJSON } from '../../../../utils/exporters/translation-exporters';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { ExportLanguageComponent } from './export-language/export-language.component';
import { PaginatorIntlService } from '../../../../utils/paginator-intl.service';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSort, MatSortModule } from '@angular/material/sort';

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
    MatMenuModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatSortModule,
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
      <div class="flex-grow"></div>
      @if (!loading()) {
        <div class="flex flex-row gap-2">
          <a mat-button [routerLink]="['/', 'languages', language?.id, 'import']">
            <span class="inline-flex flex-row items-center gap-1">
              <lucide-icon [img]="CloudUpload" [size]="16"></lucide-icon>
              Import
            </span>
          </a>
          <button mat-button>
            <span class="inline-flex flex-row items-center gap-1" (click)="openExportDialog()">
              <lucide-icon [img]="CloudDownload" [size]="16"></lucide-icon>
              Export
            </span>
          </button>
          <button mat-button>
            <span class="inline-flex flex-row items-center gap-1" [matMenuTriggerFor]="menu">
              @if (copied()) {
                <lucide-icon [img]="Check" [size]="16"></lucide-icon>
                Copied
              } @else {
                <!-- <lucide-icon [img]="Copy" [size]="16"></lucide-icon> -->
                Copy to Clipboard
              }
              <lucide-icon [img]="ChevronDown" [size]="16"></lucide-icon>
            </span>
          </button>
          <mat-menu #menu="matMenu">
            <button mat-menu-item (click)="handleCopyToClipboard('json')">JSON</button>
            <button mat-menu-item (click)="handleCopyToClipboard('keyvalue-json')">Key Value JSON</button>
            <button mat-menu-item (click)="handleCopyToClipboard('arb')">Arb</button>
            <button mat-menu-item (click)="handleCopyToClipboard('i18next-json')">i18next JSON</button>
          </mat-menu>
        </div>
      }
    </mat-toolbar>
    <mat-divider></mat-divider>
    <div
      [class]="
        'h-[calc(100vh-var(--mat-toolbar-standard-height)-var(--mat-divider-width))] w-full overflow-hidden px-10 py-5'
      "
    >
      @if (loading()) {
        <mat-progress-bar mode="query"></mat-progress-bar>
      } @else {
        <div
          [class]="
            'max-h-[calc(100vh-var(--mat-toolbar-standard-height)-var(--mat-paginator-container-size)-80px)] ' +
            'relative flex min-h-[200px] flex-col gap-2 overflow-auto'
          "
        >
          <mat-card appearance="raised">
            <mat-card-content>
              <mat-form-field class="compact w-full max-w-[calc(400px)]" floatLabel="always" appearance="outline">
                <input matInput (keyup)="applyFilter($event)" placeholder="Search" />
                <lucide-icon class="mr-2 ml-4" matPrefix [img]="Search" [size]="16"></lucide-icon>
              </mat-form-field>
            </mat-card-content>
          </mat-card>

          <table mat-table [dataSource]="translations" matSort>
            <ng-container matColumnDef="key">
              <th mat-header-cell *matHeaderCellDef>Key</th>
              <td mat-cell *matCellDef="let row">
                <div class="flex flex-col items-start">
                  <b>{{ row.key }}</b>
                  @if (row.context && row.context.length > 0) {
                    <span class="flex flex-row gap-1 rounded-sm bg-slate-200 px-1 py-0.5 text-[12px]"
                      ><b>Context: </b>{{ row.context }}</span
                    >
                  }
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="value">
              <th mat-header-cell *matHeaderCellDef>Value</th>
              <td mat-cell *matCellDef="let row">
                @if (row.temp_value) {
                  <span class="font-bold text-gray-200">{{ row.temp_value }}</span>
                } @else {
                  {{ row.value }}
                }
              </td>
            </ng-container>

            <ng-container matColumnDef="tag">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Tag</th>
              <td mat-cell *matCellDef="let row">
                <span class="font-bold text-slate-400">{{ row.tag }}</span>
              </td>
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
          [length]="translations.data.length"
          [pageSize]="20"
          [showFirstLastButtons]="true"
          aria-label="Select page of GitHub search results"
        ></mat-paginator>
      }
    </div>
  `,
  styleUrl: './language.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: MatPaginatorIntl, useClass: PaginatorIntlService }],
})
export class LanguageComponent implements AfterViewInit {
  readonly PanelLeft = PanelLeft;
  readonly Plus = Plus;
  readonly CloudUpload = CloudUpload;
  readonly CloudDownload = CloudDownload;
  readonly Copy = Copy;
  readonly FilePenLine = FilePenLine;
  readonly Check = Check;
  readonly ChevronDown = ChevronDown;
  readonly Search = Search;
  readonly dialog = inject(MatDialog);
  private _snackBar = inject(MatSnackBar);
  language: LanguageWithTranslations | null = null;
  loading = signal<boolean>(false);
  title = signal<string>('Language');
  displayedColumns: string[] = ['key', 'value', 'tag', 'controls'];
  translations = new MatTableDataSource<Translation>([]);
  copied = signal<boolean>(false);
  @ViewChild(MatPaginator) paginator?: MatPaginator;
  @ViewChild(MatSort) sort?: MatSort;

  private readonly supabaseService: SupabaseService = inject(SupabaseService);
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
          this.translations.data = language.translations;
          this.title.set(language.name);
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
      this.translations.paginator = this.paginator;
      if (this.sort) {
        this.sort.sortChange.subscribe(() => (this.paginator!.pageIndex = 0));
        this.translations.sort = this.sort;
      }
    }
  }

  openExportDialog(): void {
    const dialogRef = this.dialog.open(ExportLanguageComponent, {
      width: '400px',
      data: {
        languageName: this.language?.name,
        translations: this.language?.translations,
      },
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Export result:', result);
      }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.translations.filter = filterValue.trim().toLowerCase();
  }

  async handleCopyToClipboard(format: string) {
    if (!this.language || !this.translations.data.length) return;

    try {
      // Format translations based on language format (JSON is default)
      let formattedContent = '';
      switch (format) {
        case 'json':
        case 'keyvalue-json':
        case 'arb':
          formattedContent = generateKeyValueJSON(this.translations.data);
          break;
        case 'i18next-json':
          formattedContent = generateI18Next(this.translations.data);
          break;
      }

      await navigator.clipboard.writeText(formattedContent);

      this.copied.set(true);
      this._snackBar.open(`Translations copied in ${format.toUpperCase()} format`, 'Close', {
        duration: 1000,
      });

      // Reset the copied state after 2 seconds
      setTimeout(() => {
        this.copied.set(false);
      }, 2000);
    } catch (error) {
      this._snackBar.open('Something went wrong when copying to clipboard', 'Close', {
        duration: 1000,
      });
      console.error('Failed to copy: ', error);
    }
  }
}
