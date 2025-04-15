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
import { ActivatedRoute, RouterModule } from '@angular/router';
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
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { TranslationFromFile } from '../../../../../models/translations';
import { ImportedKeysTableComponent } from './imported-keys-table/imported-keys-table.component';

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
    MatTableModule,
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
        <a mat-button [routerLink]="['/', 'projects', language().id]">
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
    <div class="w-full p-10">
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
        <mat-card appearance="outlined">
          <mat-card-header>
            <mat-card-title>Upload Language Keys</mat-card-title>
            <mat-card-subtitle>Fill in the details to upload your language keys.</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="mt-4 mb-4 flex w-full flex-col rounded-2xl bg-[var(--mat-sys-background)] p-4">
              @if (!fileProcessed()) {
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
                      <mat-radio-group class="flex flex-col" aria-label="JSON format" [(ngModel)]="selectedJsonFormat">
                        <mat-radio-button value="keyvalue-json">Key-Value JSON</mat-radio-button>
                        <mat-radio-button value="i18next-json">i18next JSON</mat-radio-button>
                        <mat-radio-button value="arb">Flutter ARB</mat-radio-button>
                      </mat-radio-group>
                    </div>
                  }
                </div>
              } @else {
                <mat-tab-group>
                  <mat-tab>
                    <ng-template mat-tab-label>
                      <div class="flex flex-row items-center gap-2">
                        <lucide-icon [img]="Plus" [size]="16"></lucide-icon>
                        New
                        <span className="ml-1 rounded-full bg-[var(--mat-sys-primary-container)] px-2 text-xs">
                          0
                        </span>
                      </div>
                    </ng-template>
                    <p class="mt-4 mb-4 font-bold">These keys will be added to your language.</p>
                    <app-imported-keys-table [translations]="newTranslations"></app-imported-keys-table>
                  </mat-tab>

                  <mat-tab>
                    <ng-template mat-tab-label>
                      <div class="flex flex-row items-center gap-2">
                        <lucide-icon [img]="ArrowRight" [size]="16"></lucide-icon>
                        Updates
                        <span className="ml-1 rounded-full bg-[var(--mat-sys-primary-container)] px-2 text-xs">
                          0
                        </span>
                      </div>
                    </ng-template>
                    <p class="mt-4 mb-4 font-bold">Choose which translations to update with new values.</p>
                    <app-imported-keys-table [translations]="updateTranslations"></app-imported-keys-table>
                  </mat-tab>

                  <mat-tab>
                    <ng-template mat-tab-label>
                      <div class="flex flex-row items-center gap-2">
                        <lucide-icon [img]="X" [size]="16"></lucide-icon>
                        Missing
                        <span className="ml-1 rounded-full bg-[var(--mat-sys-primary-container)] px-2 text-xs">
                          0
                        </span>
                      </div>
                    </ng-template>
                    <p class="mt-4 mb-4 font-bold">
                      These keys exist in your language but not in the imported file. Select keys to delete (unselected
                      keys will be kept).
                    </p>
                    <app-imported-keys-table [translations]="missingTranslations"></app-imported-keys-table>
                  </mat-tab>
                </mat-tab-group>
              }
            </div>
          </mat-card-content>
          <mat-card-actions class="mt-4 gap-2">
            <button mat-button class="!text-[var(--mat-sys-on-surface)]" (click)="onCancelClick()">Cancel</button>
            @if (!fileProcessed()) {
              <button mat-flat-button (click)="onNextClick()" cdkFocusInitial>Next</button>
            } @else {
              <button mat-flat-button (click)="onApplyClick()" cdkFocusInitial>
                Apply changes (0 new, 0 updated, 0 to delete)
              </button>
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
  readonly project = signal<ProjectWithLanguages>({
    id: '',
    created_at: '',
    name: '',
    languages: [],
  });
  language = signal<LanguageWithTranslations>({
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
  fileProcessed = signal<boolean>(true);
  selectedFile: File | null = null;
  newTranslations = new MatTableDataSource<TranslationFromFile>([]);
  updateTranslations = new MatTableDataSource<TranslationFromFile>([]);
  missingTranslations = new MatTableDataSource<TranslationFromFile>([]);
  readonly showJsonFormatSelector = signal<boolean>(false);
  readonly selectedJsonFormat = model('keyvalue-json');

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
      this.showJsonFormatSelector.set(fileExtension === 'json');
    }
  }

  onCancelClick(): void {
    // Handle the cancel button click event here
    console.log('Cancel button clicked');
  }

  onNextClick(): void {
    // Handle the next button click event here
    console.log('Next button clicked');
  }

  onApplyClick(): void {
    // Handle the apply button click event here
    console.log('Apply button clicked');
  }
}
