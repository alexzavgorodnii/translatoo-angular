import { ChangeDetectionStrategy, Component, inject, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ArrowRight, LucideAngularModule, PanelLeft, Plus, X } from 'lucide-angular';
import { ProjectWithLanguages } from '../../../../../models/projects';
import { StateService } from '../../../../store/state.service';
import { SupabaseService } from '../../../../../services/supabase.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LanguageWithTranslations } from '../../../../../models/languages';
import { take } from 'rxjs/internal/operators/take';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatTabsModule } from '@angular/material/tabs';
import {
  MissingTranslationFromFile,
  TranslationFromFile,
  UpdatedTranslationFromFile,
} from '../../../../../models/translations';
import { ImportedKeysTableComponent } from './imported-keys-table/imported-keys-table.component';
import { compareTranslations, parseFileContent, readFileContent } from '../../../../../utils/utils';
import {
  ImportConfirmationComponent,
  ImportConfirmationResult,
} from './import-confirmation/import-confirmation.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-import-language',
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatSelectModule,
    MatToolbarModule,
    MatDividerModule,
    RouterModule,
    LucideAngularModule,
    MatCardModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatTabsModule,
    ImportedKeysTableComponent,
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
        <a mat-button [routerLink]="['/', 'projects', project().id]">
          @if (loadingProject()) {
            <mat-spinner color="primary" diameter="16"></mat-spinner>
          } @else {
            {{ project().name }}
          }
        </a>
        <span>/</span>
        <a mat-button [routerLink]="['/', 'languages', language().id]">
          @if (loadingLanguage()) {
            <mat-spinner color="primary" diameter="16"></mat-spinner>
          } @else {
            {{ language().name }}
          }
        </a>
        <span>/</span>
        <button mat-button disabled>Import</button>
      </div>
      <div class="flex-grow"></div>
    </mat-toolbar>
    <mat-divider></mat-divider>
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
              @if (fileProcessed()) {
                <mat-tab-group>
                  <mat-tab>
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

                  <mat-tab>
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

                  <mat-tab>
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
                      These keys exist in your language but not in the imported file. Select keys to delete (unselected
                      keys will be kept).
                    </p>
                    <app-imported-keys-table
                      [translations]="missingTranslations()"
                      [withSelection]="true"
                      (selectedItems)="missingTranslationsSelectionHandler($event)"
                    ></app-imported-keys-table>
                  </mat-tab>
                </mat-tab-group>
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
            <button mat-button class="!text-[var(--mat-sys-on-surface)]" (click)="onCancelClick()">Cancel</button>
            @if (fileProcessed()) {
              <button mat-flat-button (click)="onApplyClick()" cdkFocusInitial>
                Apply changes ({{ newTranslations().length }} new, {{ selectedUpdateTranslations().length }} updated,
                {{ selectedMissingTranslations().length }} to delete)
              </button>
            } @else {
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
  readonly project = signal<ProjectWithLanguages>({
    id: '',
    created_at: '',
    name: '',
    languages: [],
  });
  readonly language = signal<LanguageWithTranslations>({
    id: '',
    name: '',
    project_id: '',
    created_at: '',
    format: '',
    app_type: '',
    translations: [],
  });
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
  readonly showJsonFormatSelector = signal<boolean>(false);
  readonly selectedFormat = model('keyvalue-json');

  private readonly stateService: StateService = inject(StateService);
  private readonly supabaseService: SupabaseService = inject(SupabaseService);
  private readonly route = inject(ActivatedRoute);

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      console.error('No language ID provided in the route.');
      this.loading.set(false);
      this.error.set(true);
      return;
    }
    this.supabaseService
      .getLanguage(id)
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: language => {
          this.language.set(language);
          this.stateService.language = language;
          this.loadingLanguage.set(false);
          this.supabaseService
            .getProject(language.project_id)
            .pipe(take(1))
            .subscribe({
              next: project => {
                this.project.set(project);
                this.stateService.project = project;
                this.loadingProject.set(false);
                this.loading.set(false);
              },
              error: error => {
                console.error('Error loading project:', error);
                this.loading.set(false);
                this.error.set(true);
              },
            });
        },
        error: error => {
          console.error('Error loading language:', error);
          this.loading.set(false);
          this.error.set(true);
        },
      });
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

  onCancelClick(): void {
    // Handle the cancel button click event here
    console.log('Cancel button clicked');
  }

  async onNextClick() {
    // Handle the next button click event here
    if (!this.selectedFile) {
      return;
    }

    try {
      const fileContent = await readFileContent(this.selectedFile);
      const imported = parseFileContent(fileContent, this.selectedFormat());
      // setImportedTranslations(imported);
      const result = compareTranslations(imported, this.language().translations);
      console.log('Parsed imported translations:', result);
      this.newTranslations.set(result.newTranslations);
      this.updateTranslations.set(result.updatedTranslations);
      this.missingTranslations.set(result.missingTranslations);
    } catch (err) {
      console.error('Import error:', err);
      // setError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      this.fileProcessed.set(true);
    }
  }

  onApplyClick(): void {
    // Handle the apply button click event here
    console.log('Apply button clicked');
    const dialogRef = this.dialog.open(ImportConfirmationComponent, {
      width: '400px',
      data: {
        languageName: this.language().name,
        newTranslationsCount: this.newTranslations().length,
        updatedTranslationsCount: this.selectedUpdateTranslations().length,
        missingTranslationsCount: this.selectedMissingTranslations().length,
      },
    });

    dialogRef.afterClosed().subscribe((result: ImportConfirmationResult) => {
      if (result.confirm) {
        console.log('Confirmed:', result);
      }
    });
  }

  updateTranslationsSelectionHandler(
    event: TranslationFromFile[] | UpdatedTranslationFromFile[] | MissingTranslationFromFile[],
  ): void {
    console.log('Selected items:', event);
    this.selectedUpdateTranslations.set(event as UpdatedTranslationFromFile[]);
  }

  missingTranslationsSelectionHandler(
    event: TranslationFromFile[] | UpdatedTranslationFromFile[] | MissingTranslationFromFile[],
  ): void {
    console.log('Selected missingTranslationsSelectionHandler items:', event);
    this.selectedMissingTranslations.set(event as MissingTranslationFromFile[]);
  }

  finishImport(): void {
    try {
      // Start with current translations
      const finalTranslations = [...(this.language().translations || [])];

      // 1. Add all new translations
      this.newTranslations().forEach(newTranslation => {
        finalTranslations.push({
          ...newTranslation,
          created_at: new Date().toISOString(),
          language_id: this.language().id,
        });
      });

      // 2. Update translations that were selected
      this.selectedUpdateTranslations().forEach(update => {
        const index = finalTranslations.findIndex(t => t.key === update.key);
        if (index !== -1) {
          finalTranslations[index] = {
            ...finalTranslations[index],
            value: update.newValue,
            context: update.context,
            comment: update.comment,
          };
        }
      });

      // 3. Remove translations that were selected for deletion
      const keysToDelete = new Set(this.selectedMissingTranslations().map(t => t.key));
      const filteredTranslations = finalTranslations.filter(t => !keysToDelete.has(t.key));

      // Update the language with new translations in the database
      if (this.language().id) {
        this.supabaseService
          .updateLanguageTranslations(this.language().id, filteredTranslations)
          .pipe(take(1))
          .subscribe({
            next: () => {
              console.log('Translations updated successfully');
              // toast('Import successful', {
              //   description: `Applied ${comparison.newTranslations.length} new,
              //   ${comparison.updatedTranslations.filter(t => t.selected).length} updated,
              //   ${comparison.missingTranslations.filter(t => t.selected).length} to delete`,
              // });
              this.router.navigate(['/', 'languages', this.language().id]);
            },
            error: error => {
              console.error('Error updating translations:', error);
            },
          });
      } else {
        throw new Error('Language ID is missing');
      }
    } catch (err) {
      console.error('Failed to apply changes:', err);
      // toast('Import failed', {
      //   description: err instanceof Error ? err.message : 'Failed to apply changes',
      // });
    } finally {
      // setIsProgress(false);
      // setConfirmDialogOpen(false);
    }
  }
}
