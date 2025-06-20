import { ChangeDetectionStrategy, Component, inject, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ArrowRight, LucideAngularModule, PanelLeft, Plus, X } from 'lucide-angular';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatTabsModule } from '@angular/material/tabs';
import { ImportedKeysTableComponent } from '../../components/imported-keys-table/imported-keys-table.component';
import {
  ImportConfirmationComponent,
  ImportConfirmationResult,
} from '../../components/import-confirmation/import-confirmation.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  TranslationFromFile,
  UpdatedTranslationFromFile,
  MissingTranslationFromFile,
} from '../../../../core/models/translations';
import { readFileContent, parseFileContent, compareTranslations } from '../../../../core/utils/utils';
import { ProjectsService } from '../../../projects/services/projects.service';
import { LanguagesService } from '../../services/languages.service';
import { TranslationsService } from '../../services/translations.service';
import { BreadcrumbsComponent } from '../../../../shared/components/breadcrumbs/breadcrumbs.component';
import { LanguageStore } from '../../store/language-store';
import { ProjectStore } from '../../../project/store/project-store';

@Component({
  selector: 'app-import-language',
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatSelectModule,
    MatToolbarModule,
    RouterModule,
    LucideAngularModule,
    MatCardModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatTabsModule,
    ImportedKeysTableComponent,
    BreadcrumbsComponent,
  ],
  template: `
    <mat-toolbar>
      <app-breadcrumbs
        [breadcrumbs]="[
          { type: 'link', title: 'Projects', route: ['/projects'] },
          { type: 'link', title: projectStore.project().name, route: ['/projects', projectStore.project().id] },
          { type: 'link', title: languageStore.language().name, route: ['/languages', languageStore.language().id] },
          { type: 'title', title: 'Import' },
        ]"
      />
      <div class="flex-grow"></div>
    </mat-toolbar>
    <div class="max-h-[calc(100vh-var(--mat-toolbar-standard-height)-2.5rem)] w-full overflow-auto p-10">
      @if (loading()) {
        <mat-progress-bar mode="query"></mat-progress-bar>
      } @else if (error()) {
        <mat-card appearance="outlined">
          <mat-card-header>
            <mat-card-title>Error</mat-card-title>
            <mat-card-subtitle>There was an error loading the language.</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p class="text-red-500">An error occurred while loading the language. Please try again later.</p>
          </mat-card-content>
        </mat-card>
      } @else {
        <mat-card appearance="outlined" class="w-full">
          <mat-card-header>
            <mat-card-title>Upload Language Keys</mat-card-title>
            <mat-card-subtitle>Fill in the details to upload your language keys.</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="mt-4 mb-4 flex w-full flex-col rounded-2xl bg-[var(--mat-sys-background)] p-4">
              @if (
                newTranslations().length > 0 || updateTranslations().length > 0 || missingTranslations().length > 0
              ) {
                <div class="mb-2 flex flex-col gap-2">
                  <p class="mt-4 mb-2 font-bold">Add Tags for Imported Keys</p>
                  <mat-form-field class="w-full max-w-[calc(400px)]" floatLabel="always" appearance="outline">
                    <mat-label>Tag</mat-label>
                    <input matInput [(ngModel)]="tag" />
                  </mat-form-field>
                </div>
              }
              @if (fileProcessed()) {
                @if (
                  newTranslations().length === 0 &&
                  updateTranslations().length === 0 &&
                  missingTranslations().length === 0
                ) {
                  <p class="mb-2 font-bold">No keys for update found in the imported file.</p>
                  <p class="text-sm text-[var(--mat-sys-on-surface-variant)]">
                    The imported file does not contain any new keys or updates. Please check the file and try again.
                  </p>
                } @else {
                  <mat-tab-group>
                    <mat-tab [disabled]="sending()">
                      <ng-template mat-tab-label>
                        <div class="flex flex-row items-center gap-2">
                          <lucide-icon [img]="Plus" [size]="16"></lucide-icon>
                          New
                          <span class="ml-1 inline-flex rounded-full bg-[var(--mat-sys-primary)] px-2 text-xs">
                            {{ newTranslations().length }}
                          </span>
                        </div>
                      </ng-template>
                      <p class="mt-4 mb-4 font-bold">These keys will be added to your language.</p>
                      <app-imported-keys-table [translations]="newTranslations()"></app-imported-keys-table>
                    </mat-tab>

                    <mat-tab [disabled]="sending()">
                      <ng-template mat-tab-label>
                        <div class="flex flex-row items-center gap-2">
                          <lucide-icon [img]="ArrowRight" [size]="16"></lucide-icon>
                          Updates
                          <span class="ml-1 inline-flex rounded-full bg-[var(--mat-sys-primary)] px-2 text-xs">
                            {{ updateTranslations().length }}
                          </span>
                        </div>
                      </ng-template>
                      <p class="mt-4 mb-4 font-bold">Choose which translations to update with new values.</p>
                      <app-imported-keys-table
                        [translations]="updateTranslations()"
                        [withSelection]="true"
                        (selectedItems)="updateTranslationsSelectionHandler($event)"
                      ></app-imported-keys-table>
                    </mat-tab>

                    <mat-tab [disabled]="sending()">
                      <ng-template mat-tab-label>
                        <div class="flex flex-row items-center gap-2">
                          <lucide-icon [img]="X" [size]="16"></lucide-icon>
                          Missing
                          <span class="ml-1 rounded-full bg-[var(--mat-sys-primary)] px-2 text-xs">
                            {{ missingTranslations().length }}
                          </span>
                        </div>
                      </ng-template>
                      <p class="mt-4 mb-4 font-bold">
                        These keys exist in your language but not in the imported file. Select keys to delete
                        (unselected keys will be kept).
                      </p>
                      <app-imported-keys-table
                        [translations]="missingTranslations()"
                        [withSelection]="true"
                        (selectedItems)="missingTranslationsSelectionHandler($event)"
                      ></app-imported-keys-table>
                    </mat-tab>
                  </mat-tab-group>
                }
              } @else {
                <p class="mb-2 font-bold">Select the file you would like to import keys from.</p>
                <div class="flex flex-col gap-[calc(24px)]">
                  <div class="flex flex-col gap-2">
                    <p class="font-bold">Upload a file</p>
                    <div class="w-full max-w-[calc(400px)]">
                      <button type="button" mat-stroked-button (click)="fileInput.click()" class="w-full">
                        {{ selectedFile ? selectedFile.name : 'Choose file' }}
                      </button>
                      <input hidden type="file" #fileInput (change)="onFileSelected($event)" accept=".json,.arb" />
                    </div>
                    <p class="text-sm text-[var(--mat-sys-on-surface-variant)]">
                      Supported formats: .json(i18next JSON, Key-Value JSON), .arb(Flutter ARB)
                    </p>
                  </div>
                  @if (showJsonFormatSelector()) {
                    <div class="mt-2 flex flex-col gap-2">
                      <p class="font-bold">Select JSON format</p>
                      <mat-radio-group class="flex flex-col" aria-label="JSON format" [(ngModel)]="selectedFormat">
                        <mat-radio-button value="keyvalue-json">Key-Value JSON</mat-radio-button>
                        <mat-radio-button value="i18next-json">i18next JSON</mat-radio-button>
                        <mat-radio-button value="arb">Flutter ARB</mat-radio-button>
                      </mat-radio-group>
                    </div>
                  }
                </div>
              }
            </div>
          </mat-card-content>
          <mat-card-actions class="mt-4 gap-2">
            @if (fileProcessed()) {
              <button
                mat-button
                class="!text-[var(--mat-sys-on-surface)]"
                (click)="onBackClick()"
                [disabled]="sending()"
              >
                Back
              </button>
              @if (
                newTranslations().length > 0 || updateTranslations().length > 0 || missingTranslations().length > 0
              ) {
                <button mat-flat-button (click)="onApplyClick()" cdkFocusInitial [disabled]="sending()">
                  Apply changes ({{ newTranslations().length }} new, {{ selectedUpdateTranslations().length }} updated,
                  {{ selectedMissingTranslations().length }} to delete)
                </button>
              }
            } @else {
              <button
                mat-button
                class="!text-[var(--mat-sys-on-surface)]"
                (click)="onCancelClick()"
                [disabled]="sending()"
              >
                Cancel
              </button>
              <button mat-flat-button (click)="onNextClick()" cdkFocusInitial>Parse File</button>
            }
          </mat-card-actions>
        </mat-card>
      }
    </div>
  `,
  styleUrl: './import-language.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImportLanguageComponent {
  readonly PanelLeft = PanelLeft;
  readonly Plus = Plus;
  readonly ArrowRight = ArrowRight;
  readonly X = X;
  readonly router = inject(Router);
  readonly dialog = inject(MatDialog);
  loading = signal<boolean>(true);
  loadingProject = signal<boolean>(true);
  loadingLanguage = signal<boolean>(true);
  error = signal<boolean>(false);
  fileProcessed = signal<boolean>(false);
  selectedFile: File | null = null;
  newTranslations = signal<TranslationFromFile[]>([]);
  updateTranslations = signal<UpdatedTranslationFromFile[]>([]);
  selectedUpdateTranslations = signal<UpdatedTranslationFromFile[]>([]);
  missingTranslations = signal<MissingTranslationFromFile[]>([]);
  selectedMissingTranslations = signal<MissingTranslationFromFile[]>([]);
  sending = signal<boolean>(false);
  readonly showJsonFormatSelector = signal<boolean>(false);
  readonly selectedFormat = model('keyvalue-json');
  readonly tag = model('');
  readonly languageStore = inject(LanguageStore);
  readonly projectStore = inject(ProjectStore);

  private readonly languagesService = inject(LanguagesService);
  private readonly projectsService = inject(ProjectsService);
  private readonly translationsService = inject(TranslationsService);
  private readonly route = inject(ActivatedRoute);
  private readonly _snackBar = inject(MatSnackBar);

  constructor() {
    if (this.languageStore.language().id === '') {
      const id = this.route.snapshot.paramMap.get('id');
      if (!id) {
        console.error('No language ID provided in the route.');
        this.loading.set(false);
        this.error.set(true);
        return;
      }
      this.init(id);
    } else {
      this.loading.set(false);
      this.loadingLanguage.set(false);
      if (this.projectStore.project().id === '') {
        this.init(this.languageStore.language().id);
      } else {
        this.loadingProject.set(false);
      }
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];

      // Detect file type to show JSON format selector if needed
      const fileExtension = this.selectedFile.name.split('.').pop()?.toLowerCase() || '';
      this.selectedFormat.set(fileExtension === 'json' ? 'keyvalue-json' : fileExtension);
      this.showJsonFormatSelector.set(fileExtension === 'json');
    }
  }

  onBackClick(): void {
    this.fileProcessed.set(false);
    this.newTranslations.set([]);
    this.updateTranslations.set([]);
    this.missingTranslations.set([]);
    this.selectedUpdateTranslations.set([]);
    this.selectedMissingTranslations.set([]);
    this.selectedFile = null;
    this.selectedFormat.set('keyvalue-json');
    this.tag.set('');
  }

  onCancelClick(): void {
    this.router.navigate(['/', 'languages', this.languageStore.language().id]);
  }

  async onNextClick() {
    // Handle the next button click event here
    if (!this.selectedFile) {
      return;
    }

    try {
      const fileContent = await readFileContent(this.selectedFile);
      const imported = parseFileContent(fileContent, this.selectedFormat());
      const result = compareTranslations(imported, this.languageStore.language().translations);
      this.newTranslations.set(result.newTranslations);
      this.updateTranslations.set(result.updatedTranslations);
      this.missingTranslations.set(result.missingTranslations);
    } catch (err) {
      console.error('Import error:', err);
    } finally {
      this.fileProcessed.set(true);
    }
  }

  onApplyClick(): void {
    const dialogRef = this.dialog.open(ImportConfirmationComponent, {
      width: '400px',
      data: {
        languageName: this.languageStore.language().name,
        newTranslationsCount: this.newTranslations().length,
        updatedTranslationsCount: this.selectedUpdateTranslations().length,
        missingTranslationsCount: this.selectedMissingTranslations().length,
      },
    });

    dialogRef.afterClosed().subscribe((result: ImportConfirmationResult) => {
      if (result && result.confirm) {
        this.sending.set(true);
        this.finishImport();
      }
    });
  }

  updateTranslationsSelectionHandler(
    event: TranslationFromFile[] | UpdatedTranslationFromFile[] | MissingTranslationFromFile[],
  ): void {
    this.selectedUpdateTranslations.set(event as UpdatedTranslationFromFile[]);
  }

  missingTranslationsSelectionHandler(
    event: TranslationFromFile[] | UpdatedTranslationFromFile[] | MissingTranslationFromFile[],
  ): void {
    this.selectedMissingTranslations.set(event as MissingTranslationFromFile[]);
  }

  async finishImport(): Promise<void> {
    // Update the language with new translations in the database
    if (this.languageStore.language().id) {
      const updateTranslations = this.selectedUpdateTranslations().map(t => ({
        id: t.id,
        key: t.key,
        value: t.newValue,
        context: t.context,
        comment: t.comment,
        is_plural: t.is_plural,
        plural_key: t.plural_key,
        order: t.order,
      }));

      try {
        await this.translationsService.importScriptTranslations(
          this.languageStore.language().id,
          this.newTranslations(),
          updateTranslations,
          this.selectedMissingTranslations(),
          this.tag(),
        );
        this._snackBar.open(
          `Import successful (Applied ${this.newTranslations().length} new,
            ${this.selectedUpdateTranslations().length} updated,
            ${this.selectedMissingTranslations().length} to delete)`,
          'Close',
          {
            duration: 5000,
          },
        );
        this.sending.set(false);
        this.router.navigate(['/', 'languages', this.languageStore.language().id]);
      } catch (error) {
        this._snackBar.open(
          `Import failed (${error instanceof Error ? error.message : 'Failed to apply changes'}`,
          'Close',
          {
            duration: 5000,
          },
        );
        this.sending.set(false);
      }
    } else {
      throw new Error('Language ID is missing');
    }
  }

  private async init(id: string): Promise<void> {
    try {
      const language = await this.languagesService.getLanguage(id);
      this.languageStore.setLanguage(language);
      this.loadingLanguage.set(false);
      this.loading.set(false);
      if (this.projectStore.project().id === '') {
        const project = await this.projectsService.getProject(language.project_id);
        this.projectStore.setProject(project);
        this.loadingProject.set(false);
      }
    } catch (error) {
      console.error('Error loading language:', error);
      this.loading.set(false);
      this.error.set(true);
    }
  }
}
