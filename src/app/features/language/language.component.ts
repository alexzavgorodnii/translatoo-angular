import { ChangeDetectionStrategy, Component, AfterViewInit, inject, signal, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatPaginator, MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { Translation } from '../../core/models/translations';
import {
  Check,
  ChevronDown,
  CloudDownload,
  CloudUpload,
  Copy,
  FilePenLine,
  ListFilter,
  LucideAngularModule,
  Search,
  Tag,
} from 'lucide-angular';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { ExportLanguageComponent } from './components/export-language/export-language.component';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { LanguagesService } from './services/languages.service';
import { generateKeyValueJSON, generateI18Next } from '../../core/utils/exporters/translation-exporters';
import { PaginatorIntlService } from '../../core/utils/paginator-intl.service';
import { TranslationRowValueComponent } from './components/translation-row-value/translation-row-value.component';
import { EditTranslationKeyDialogComponent } from './components/edit-translation-key-dialog/edit-translation-key-dialog.component';
import { take } from 'rxjs/internal/operators/take';
import { BreadcrumbsComponent } from '../../shared/components/breadcrumbs/breadcrumbs.component';
import { ProjectsService } from '../projects/services/projects.service';
import { EmptyMessageComponent } from '../../shared/components/empty-message/empty-message.component';
import { LanguageStore } from './store/language-store';
import { ProjectStore } from '../project/store/project-store';
import { ErrorMessageComponent } from '../../shared/components/error-message/error-message';

@Component({
  selector: 'app-language',
  imports: [
    MatToolbarModule,
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
    TranslationRowValueComponent,
    BreadcrumbsComponent,
    EmptyMessageComponent,
    ErrorMessageComponent,
  ],
  template: `
    <mat-toolbar>
      <app-breadcrumbs
        [breadcrumbs]="[
          { title: 'Projects', route: ['/', 'projects'], type: 'link' },
          {
            title: projectStore.project().name,
            route: ['/', 'projects', languageStore.language().project_id],
            type: 'link',
          },
          { title: languageStore.language().name, type: 'title' },
        ]"
      />
      <div class="flex-grow"></div>
      @if (!languageStore.loading()) {
        <div class="flex flex-row gap-2">
          <a mat-button [routerLink]="['/', 'languages', languageStore.language().id, 'import']">
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
    <div
      [class]="
        'h-[calc(100vh-var(--mat-toolbar-standard-height)-var(--mat-divider-width))] w-full overflow-hidden px-10 py-5'
      "
    >
      @if (languageStore.loading()) {
        <mat-progress-bar mode="query"></mat-progress-bar>
      } @else {
        @if (translations.data.length === 0) {
          <app-empty-message
            [title]="'No translations found for ' + languageStore.language().name + '.'"
            [message]="'You can import translations using the button below.'"
          >
            <a mat-button [routerLink]="['/', 'languages', languageStore.language().id, 'import']">
              <span class="inline-flex flex-row items-center gap-1">
                <lucide-icon [img]="CloudUpload" [size]="16"></lucide-icon>
                Import
              </span>
            </a>
          </app-empty-message>
        } @else if (projectStore.isError()) {
          <app-error-message [title]="'Language loading error'" />
        } @else {
          <div
            [class]="
              'max-h-[calc(100vh-var(--mat-toolbar-standard-height)-var(--mat-paginator-container-size)-80px)] ' +
              'relative flex min-h-[200px] flex-col gap-2 overflow-auto'
            "
          >
            <mat-toolbar appearance="raised">
              <div class="flex w-full flex-row items-center gap-2 py-5">
                <mat-form-field class="compact w-full" floatLabel="always" appearance="outline">
                  <input matInput (keyup)="applyFilter($event)" placeholder="Search" />
                  <lucide-icon class="mr-2 ml-4" matPrefix [img]="Search" [size]="16"></lucide-icon>
                </mat-form-field>
                <button mat-button>
                  <span class="inline-flex flex-row items-center gap-1 capitalize" [matMenuTriggerFor]="tag">
                    <lucide-icon [img]="Tag" [size]="16"></lucide-icon>
                    @if (selectedTag() !== 'all') {
                      {{ selectedTag() }}
                    } @else {
                      <span>Tag</span>
                    }
                    <lucide-icon [img]="ChevronDown" [size]="16"></lucide-icon>
                  </span>
                </button>
                <mat-menu #tag="matMenu">
                  @for (tag of tags(); track $index) {
                    <button mat-menu-item (click)="applyFilterByTag(tag)" [class.selected]="selectedTag() === tag">
                      {{ tag }}
                    </button>
                  }
                </mat-menu>
                <button mat-button>
                  <span class="inline-flex flex-row items-center gap-1 capitalize" [matMenuTriggerFor]="filter">
                    <lucide-icon [img]="ListFilter" [size]="16"></lucide-icon>
                    {{ selectedFilter() }}
                    <lucide-icon [img]="ChevronDown" [size]="16"></lucide-icon>
                  </span>
                </button>
                <mat-menu #filter="matMenu">
                  @for (filter of filters(); track $index) {
                    <button
                      mat-menu-item
                      (click)="applyFilterByFilter(filter)"
                      class="capitalize"
                      [class.selected]="selectedFilter() === filter"
                    >
                      {{ filter }}
                    </button>
                  }
                </mat-menu>
              </div>
            </mat-toolbar>

            <table mat-table [dataSource]="translations" matSort multiTemplateDataRows>
              <ng-container matColumnDef="key">
                <th mat-header-cell *matHeaderCellDef>Key</th>
                <td [class.no-border]="!!row.context || !!row.tag" mat-cell *matCellDef="let row">
                  <b>{{ row.key }}</b>
                </td>
              </ng-container>

              <ng-container matColumnDef="value">
                <th mat-header-cell *matHeaderCellDef>Value</th>
                <td [class.no-border]="!!row.context || !!row.tag" mat-cell *matCellDef="let row">
                  <app-translation-row-value [row]="row" />
                </td>
              </ng-container>

              <ng-container matColumnDef="controls">
                <th mat-header-cell *matHeaderCellDef></th>
                <td [class.no-border]="!!row.context || !!row.tag" mat-cell *matCellDef="let row">
                  <button mat-icon-button (click)="openEditTranslationKeyDialog(row)">
                    <lucide-icon [img]="FilePenLine" [size]="16"></lucide-icon>
                  </button>
                </td>
              </ng-container>

              <ng-container matColumnDef="info">
                <td mat-cell [attr.colspan]="displayedColumns.length" *matCellDef="let row">
                  <div class="flex flex-row items-start gap-2">
                    @if (row.context) {
                      <span class="flex flex-row gap-1 rounded-sm bg-slate-200 px-1 py-0.5 text-[12px]"
                        ><b>Context: </b>{{ row.context }}</span
                      >
                    }
                    @if (row.tag) {
                      <span class="flex flex-row items-center gap-1 rounded-sm bg-slate-200 px-1 py-0.5 text-[12px]"
                        ><lucide-icon [img]="Tag" [size]="10"></lucide-icon><b>Tag: </b>{{ row.tag }}</span
                      >
                    }
                  </div>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns; sticky: true"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
              <tr class="h-[38px]!" mat-row *matRowDef="let row; columns: ['info']; when: hasContext"></tr>
            </table>
          </div>

          <mat-paginator
            [length]="translations.data.length"
            [pageSize]="20"
            [showFirstLastButtons]="true"
            aria-label="Select page of GitHub search results"
          ></mat-paginator>
        }
      }
    </div>
  `,
  styleUrl: './language.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: MatPaginatorIntl, useClass: PaginatorIntlService }],
})
export class LanguageComponent implements AfterViewInit {
  readonly CloudUpload = CloudUpload;
  readonly CloudDownload = CloudDownload;
  readonly Copy = Copy;
  readonly FilePenLine = FilePenLine;
  readonly Check = Check;
  readonly ChevronDown = ChevronDown;
  readonly Search = Search;
  readonly ListFilter = ListFilter;
  readonly Tag = Tag;
  readonly dialog = inject(MatDialog);
  readonly languageStore = inject(LanguageStore);
  readonly projectStore = inject(ProjectStore);
  private _snackBar = inject(MatSnackBar);
  displayedColumns: string[] = ['key', 'value', 'controls'];
  translations = new MatTableDataSource<Translation>([]);
  copied = signal<boolean>(false);
  tags = signal<string[]>(['all']);
  selectedTag = signal<string>('all');
  filters = signal<string[]>(['all', 'untranslated']);
  selectedFilter = signal<string>('all');
  @ViewChild(MatPaginator) paginator?: MatPaginator;
  @ViewChild(MatSort) sort?: MatSort;

  private readonly languagesService = inject(LanguagesService);
  private readonly projectsService = inject(ProjectsService);
  private readonly route = inject(ActivatedRoute);

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      console.error('No project ID provided in the route.');
      this.languageStore.setLoading(false);
      this.languageStore.setError(true);
      return;
    }
    this.init(id);
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
        languageName: this.languageStore.language().name,
        translations: this.languageStore.language().translations,
      },
    });
    dialogRef
      .afterClosed()
      .pipe(take(1))
      .subscribe(result => {
        if (result) {
          console.log('Export result:', result);
        }
      });
  }

  openEditTranslationKeyDialog(translation: Translation): void {
    const dialogRef = this.dialog.open(EditTranslationKeyDialogComponent, {
      width: '400px',
      height: '100%',
      panelClass: 'full-height-right-dialog',
      position: { top: '0', right: '0' },
      data: {
        translation: translation,
      },
    });
    dialogRef
      .afterClosed()
      .pipe(take(1))
      .subscribe(result => {
        if (result) {
          // Update the translation in the data source
        }
      });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.translations.filter = filterValue.trim().toLowerCase();
  }

  applyFilterByFilter(tag: string) {
    this.translations.filter = tag;
    this.selectedFilter.set(tag);
  }

  applyFilterByTag(tag: string) {
    this.translations.filter = tag;
    this.selectedTag.set(tag);
  }

  async handleCopyToClipboard(format: string) {
    if (!this.languageStore.language() || !this.translations.data.length) return;

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

  hasContext(index: number, row: Translation): boolean {
    return !!row.context || !!row.tag;
  }

  private async init(id: string): Promise<void> {
    try {
      this.languageStore.setLoading(true);
      const language = await this.languagesService.getLanguage(id);
      this.languageStore.setLanguage(language);

      this.translations.data = language.translations;
      this.translations.filterPredicate = (data: Translation, filter: string) => {
        if (filter === 'all') {
          return true;
        }
        if (filter === 'untranslated') {
          return !data.value || data.value.trim() === '';
        }
        return data.tag === filter;
      };
      const uniqueTags = new Set<string>();
      uniqueTags.add('all');
      language.translations.forEach(translation => {
        if (translation.tag) {
          uniqueTags.add(translation.tag);
        }
      });
      this.tags.set(Array.from(uniqueTags));
      const project = await this.projectsService.getProject(language.project_id);
      this.projectStore.setProject(project);
      this.languageStore.setLoading(false);
    } catch (error) {
      console.error('Error loading language:', error);
      this.languageStore.setLoading(false);
      this.languageStore.setError(true);
    }
  }
}
