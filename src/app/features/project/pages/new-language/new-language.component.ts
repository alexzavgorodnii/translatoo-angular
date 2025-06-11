import { ChangeDetectionStrategy, Component, inject, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { take } from 'rxjs/internal/operators/take';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { appTypes, Language, LanguageWithTranslations } from '../../../../core/models/languages';
import { ProjectWithLanguages } from '../../../../core/models/projects';
import { Translation } from '../../../../core/models/translations';
import { LanguagesService } from '../../../language/services/languages.service';
import { ProjectsService } from '../../../projects/services/projects.service';
import { TranslationsService } from '../../../language/services/translations.service';
import { StateService } from '../../../../store/state.service';
import { parseJSON, parseI18Next } from '../../../../core/utils/parsers/translation-parsers';
import { BreadcrumbsComponent } from '../../../../shared/components/breadcrumbs/breadcrumbs.component';

@Component({
  selector: 'app-new-language',
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatRadioModule,
    MatSelectModule,
    MatToolbarModule,
    RouterModule,
    MatCardModule,
    MatProgressBarModule,
    BreadcrumbsComponent,
  ],
  template: `
    <mat-toolbar>
      <app-breadcrumbs
        [breadcrumbs]="[
          { type: 'link', title: 'Projects', route: ['/', 'projects'] },
          { type: 'link', title: project().name, route: ['/', 'projects', project().id] },
          { type: 'title', title: 'New language' },
        ]"
      />
      <div class="flex-grow"></div>
    </mat-toolbar>
    <div class="w-full p-10">
      @if (loading()) {
        <mat-progress-bar mode="query"></mat-progress-bar>
      } @else {
        <mat-card appearance="outlined">
          <mat-card-header>
            <mat-card-title>New Language</mat-card-title>
            <mat-card-subtitle>Fill in the details to create a new language.</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="flex flex-col gap-6 py-5">
              <mat-form-field class="w-full max-w-[calc(400px)]" floatLabel="always" appearance="outline">
                <mat-label>Name</mat-label>
                <input matInput [(ngModel)]="name" />
                <mat-hint>What is the name of the language?</mat-hint>
              </mat-form-field>
              <mat-form-field class="w-full max-w-[calc(400px)]" floatLabel="always" appearance="outline">
                <mat-label>Choose application type</mat-label>
                <mat-select [(ngModel)]="appType">
                  @for (type of types(); track type.value) {
                    <mat-option [value]="type.value">
                      {{ type.name }}
                    </mat-option>
                  }
                </mat-select>
                <mat-hint>What kind of project uses the language?</mat-hint>
              </mat-form-field>
            </div>

            <div class="mb-4 flex w-full flex-col rounded-2xl bg-[var(--mat-sys-background)] p-4">
              <p class="mb-2 font-bold">Which language would you like to clone the keys from?</p>
              <div class="flex flex-col gap-[calc(24px)]">
                <mat-radio-group class="flex flex-col" aria-label="Select an option" [(ngModel)]="copy">
                  <mat-radio-button value="no">No</mat-radio-button>
                  <mat-radio-button value="language">From existing language</mat-radio-button>
                  <mat-radio-button value="file">From file</mat-radio-button>
                </mat-radio-group>
                @if (copy() === 'language') {
                  <div class="flex flex-col gap-2">
                    <p class="font-bold">Which language would you like to clone?</p>
                    <mat-form-field class="w-full max-w-[calc(400px)]">
                      <mat-label>Choose language</mat-label>
                      <mat-select [(ngModel)]="languageId">
                        @for (language of project().languages; track language.id) {
                          <mat-option [value]="language.id">
                            {{ language.name }}
                          </mat-option>
                        }
                      </mat-select>
                    </mat-form-field>
                  </div>
                } @else if (copy() === 'file') {
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
                }
              </div>
            </div>
          </mat-card-content>
          <mat-card-actions class="mt-4 gap-2">
            <button mat-button class="!text-[var(--mat-sys-on-surface)]" (click)="onCancelClick()">Cancel</button>
            <button mat-flat-button (click)="onAddClick()" cdkFocusInitial>Add</button>
          </mat-card-actions>
        </mat-card>
      }
    </div>
  `,
  styleUrl: './new-language.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewLanguageComponent {
  loading = signal<boolean>(true);
  readonly types = signal(appTypes);
  readonly project = signal<ProjectWithLanguages>({
    id: '',
    created_at: '',
    name: '',
    languages: [],
  });
  private readonly languagesService = inject(LanguagesService);
  private readonly projectsService = inject(ProjectsService);
  private readonly translationsService = inject(TranslationsService);
  private stateService = inject(StateService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly name = model('');
  readonly appType = model('');
  readonly copy = model('no');
  readonly language = model({});
  readonly languageId = model('');
  readonly selectedJsonFormat = model('keyvalue-json');
  readonly showJsonFormatSelector = signal<boolean>(false);
  selectedFile: File | null = null;

  constructor() {
    this.project.set(this.stateService.project);
    if (this.project().id.length === 0) {
      const id = this.route.snapshot.paramMap.get('id');
      if (!id) {
        console.error('No project ID provided in the route.');
        return;
      }
      this.projectsService
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
            this.loading.set(false);
          },
          error: error => {
            console.error('Error loading project:', error);
            this.loading.set(false);
          },
        });
    } else {
      this.loading.set(false);
    }
  }

  onCancelClick(): void {
    this.router.navigate(['/', 'projects', this.project().id]);
  }

  onAddClick(): void {
    // Start loading
    this.loading.set(true);

    // Handle file import
    if (this.copy() === 'file' && this.selectedFile) {
      this.languagesService
        .addLanguage(this.name(), this.project().id)
        .pipe(take(1))
        .subscribe({
          next: (language: Language) => {
            // Read and parse file content
            this.readAndProcessFile(language)
              .then(() => {
                this.loading.set(false);
                this.router.navigate(['/', 'projects', this.project().id]);
              })
              .catch(error => {
                console.error('Error processing file:', error);
                this.loading.set(false);
              });
          },
          error: error => {
            console.error('Error adding language:', error);
            this.loading.set(false);
          },
        });
      return;
    }

    // Rest of the existing code for other options
    this.languagesService
      .addLanguage(this.name(), this.project().id)
      .pipe(take(1))
      .subscribe({
        next: language => {
          if (this.copy() === 'language') {
            // Existing code for copying from language...
            this.languagesService
              .getLanguage(this.languageId())
              .pipe(take(1))
              .subscribe({
                next: (languageForCopy: LanguageWithTranslations) => {
                  const translationsFromLanguage: Translation[] = languageForCopy.translations.map(translation => {
                    return {
                      context: translation.context,
                      key: translation.key,
                      value: '',
                      order: translation.order,
                      is_plural: translation.is_plural,
                      plural_key: translation.plural_key,
                      created_at: new Date().toISOString(),
                      temp_value: translation.value,
                      language_id: language.id,
                    };
                  });
                  this.translationsService
                    .addTranslations(translationsFromLanguage)
                    .pipe(take(1))
                    .subscribe({
                      next: () => {
                        const languageWithTranslations: LanguageWithTranslations = {
                          ...language,
                          translations: translationsFromLanguage,
                          progress: 0,
                        };
                        this.language.set(languageWithTranslations);
                        const currentProjectLanguages = this.stateService.project.languages;
                        currentProjectLanguages.push(languageWithTranslations);
                        this.stateService.updateProjectLanguages(currentProjectLanguages);
                        this.router.navigate(['/', 'projects', this.project().id]);
                      },
                      error: () => {
                        console.error('Error adding translations');
                      },
                    });
                },
                error: () => {
                  console.error('Error fetching language for copy');
                },
              });
          } else {
            // Existing code for "no" option...
            this.language.set(language);
            const currentProjectLanguages = this.stateService.project.languages;
            const languageWithTranslations: LanguageWithTranslations = {
              ...language,
              translations: [],
              progress: 0,
            };
            currentProjectLanguages.push(languageWithTranslations);
            this.stateService.updateProjectLanguages(currentProjectLanguages);
            this.router.navigate(['/', 'projects', this.project().id]);
          }
        },
        error: error => {
          console.error('Error adding project:', error);
          this.loading.set(false);
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

  private async readAndProcessFile(language: Language): Promise<void> {
    if (!this.selectedFile) {
      throw new Error('No file selected');
    }

    try {
      // Read file content
      const content = await this.readFileContent(this.selectedFile);

      // Determine format to use
      let format = this.selectedFile.name.split('.').pop()?.toLowerCase() || '';

      // For JSON files, use the selected format
      if (format === 'json') {
        format = this.selectedJsonFormat();
      }

      // Parse file content
      const parsedTranslations = this.parseFileContent(content, format);

      // Transform to database translations
      const translationsToAdd = parsedTranslations.map(t => ({
        context: t.context,
        key: t.key,
        order: t.order,
        is_plural: t.is_plural || false,
        plural_key: t.plural_key,
        created_at: new Date().toISOString(),
        value: t.value, // Store original value for reference
        language_id: language.id,
      }));

      if (translationsToAdd.length > 0) {
        // Add translations to database
        return new Promise<void>((resolve, reject) => {
          this.translationsService
            .addTranslations(translationsToAdd)
            .pipe(take(1))
            .subscribe({
              next: () => {
                // Update state
                const languageWithTranslations: LanguageWithTranslations = {
                  ...language,
                  translations: translationsToAdd,
                  progress: 0,
                };
                const currentProjectLanguages = this.stateService.project.languages;
                currentProjectLanguages.push(languageWithTranslations);
                this.stateService.updateProjectLanguages(currentProjectLanguages);
                resolve();
              },
              error: err => {
                console.error('Error adding translations:', err);
                reject(err);
              },
            });
        });
      } else {
        // No translations to add
        const languageWithTranslations: LanguageWithTranslations = {
          ...language,
          translations: [],
          progress: 0,
        };
        const currentProjectLanguages = this.stateService.project.languages;
        currentProjectLanguages.push(languageWithTranslations);
        this.stateService.updateProjectLanguages(currentProjectLanguages);
      }
    } catch (error) {
      console.error('Error processing file:', error);
      throw error;
    }
  }

  private readFileContent(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => {
        if (e.target?.result) {
          resolve(e.target.result as string);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = () => reject(new Error('File read error'));
      reader.readAsText(file);
    });
  }

  private parseFileContent(content: string, format: string): any[] {
    switch (format) {
      case 'keyvalue-json':
        return parseJSON(content);
      case 'i18next-json':
        return parseI18Next(content);
      case 'arb':
        return parseJSON(content); // ARB is a JSON format
      case 'json':
        return parseJSON(content);
      default:
        throw new Error(`Import for format '${format}' is not supported`);
    }
  }
}
