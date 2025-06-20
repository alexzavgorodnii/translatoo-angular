import { ChangeDetectionStrategy, Component, inject, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { appTypes, LanguageWithTranslations } from '../../../../core/models/languages';
import { LanguagesService } from '../../../language/services/languages.service';
import { ProjectsService } from '../../../projects/services/projects.service';
import { TranslationsService } from '../../../language/services/translations.service';
import { parseJSON, parseI18Next } from '../../../../core/utils/parsers/translation-parsers';
import { BreadcrumbsComponent } from '../../../../shared/components/breadcrumbs/breadcrumbs.component';
import { ProjectStore } from '../../store/project-store';
import { Language, Translation } from 'shared-types';

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
          { type: 'link', title: projectStore.project().name, route: ['/', 'projects', projectStore.project().id] },
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
                        @for (language of projectStore.project().languages; track language.id) {
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
  readonly projectStore = inject(ProjectStore);
  private readonly languagesService = inject(LanguagesService);
  private readonly projectsService = inject(ProjectsService);
  private readonly translationsService = inject(TranslationsService);
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
    if (this.projectStore.project().id.length === 0) {
      const id = this.route.snapshot.paramMap.get('id');
      if (!id) {
        console.error('No project ID provided in the route.');
        return;
      }

      this.initProject(id);
    } else {
      this.loading.set(false);
    }
  }

  onCancelClick(): void {
    this.router.navigate(['/', 'projects', this.projectStore.project().id]);
  }

  async onAddClick(): Promise<void> {
    // Start loading
    this.loading.set(true);

    // Handle file import
    if (this.copy() === 'file' && this.selectedFile) {
      await this.fileImportHandling();
      return;
    }

    if (this.copy() === 'language') {
      this.fromLanguageImportHandling();
      return;
    }

    if (this.copy() === 'no') {
      this.clearImportHandling();
      return;
    }
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
            .then(() => {
              const languageWithTranslations: LanguageWithTranslations = {
                ...language,
                translations: translationsToAdd,
                progress: 0,
              };
              const currentProjectLanguages = this.projectStore.project().languages;
              currentProjectLanguages.push(languageWithTranslations);
              this.projectStore.updateProjectLanguages(currentProjectLanguages);
              resolve();
            })
            .catch(error => {
              console.error('Error adding translations:', error);
              reject(error);
            });
        });
      } else {
        // No translations to add
        const languageWithTranslations: LanguageWithTranslations = {
          ...language,
          translations: [],
          progress: 0,
        };
        const currentProjectLanguages = this.projectStore.project().languages;
        currentProjectLanguages.push(languageWithTranslations);
        this.projectStore.updateProjectLanguages(currentProjectLanguages);
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

  private async fileImportHandling(): Promise<void> {
    try {
      const language = await this.languagesService.addLanguage(this.name(), this.projectStore.project().id);
      this.readAndProcessFile(language)
        .then(() => {
          this.loading.set(false);
          this.router.navigate(['/', 'projects', this.projectStore.project().id]);
        })
        .catch(error => {
          console.error('Error processing file:', error);
          this.loading.set(false);
        });
    } catch (error) {
      console.error('Error during file import handling:', error);
      this.loading.set(false);
      return;
    }
  }

  private async fromLanguageImportHandling(): Promise<void> {
    try {
      if (!this.name().trim()) {
        console.error('Language name is required');
        this.loading.set(false);
        return;
      }

      if (!this.languageId()) {
        console.error('Source language ID is required');
        this.loading.set(false);
        return;
      }

      const languageForCopy = await this.languagesService.getLanguage(this.languageId());
      const language = await this.languagesService.addLanguage(this.name(), this.projectStore.project().id);

      // Check if source language has translations
      if (!languageForCopy.translations || languageForCopy.translations.length === 0) {
        console.warn('Source language has no translations to copy');
      }

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

      await this.translationsService.addTranslations(translationsFromLanguage);
      const languageWithTranslations: LanguageWithTranslations = {
        ...language,
        translations: translationsFromLanguage,
        progress: 0,
      };
      this.language.set(languageWithTranslations);
      const currentProjectLanguages = this.projectStore.project().languages;
      currentProjectLanguages.push(languageWithTranslations);
      this.projectStore.updateProjectLanguages(currentProjectLanguages);

      // Reset loading state before navigation
      this.loading.set(false);
      this.router.navigate(['/', 'projects', this.projectStore.project().id]);
    } catch (error) {
      console.error('Error during language import handling:', error);
      this.loading.set(false);
      return;
    }
  }

  private async clearImportHandling(): Promise<void> {
    try {
      const language = await this.languagesService.addLanguage(this.name(), this.projectStore.project().id);
      this.language.set(language);
      const currentProjectLanguages = this.projectStore.project().languages;
      const languageWithTranslations: LanguageWithTranslations = {
        ...language,
        translations: [],
        progress: 0,
      };
      currentProjectLanguages.push(languageWithTranslations);
      this.projectStore.updateProjectLanguages(currentProjectLanguages);
      this.router.navigate(['/', 'projects', this.projectStore.project().id]);
    } catch (error) {
      console.error('Error during clear import handling:', error);
      this.loading.set(false);
      return;
    }
  }

  private async initProject(id: string): Promise<void> {
    try {
      this.projectStore.setLoading(true);
      const project = await this.projectsService.getProject(id);
      project.languages.forEach(language => {
        const totalTranslations = language.translations.length;
        const translatedCount = language.translations.filter(
          translation => translation.value && translation.value.length !== 0,
        ).length;
        language.progress = totalTranslations > 0 ? (translatedCount / totalTranslations) * 100 : 0;
      });
      this.projectStore.setProject(project);
      this.projectStore.setLoading(false);
      this.loading.set(false);
    } catch (error) {
      console.error('Error loading project:', error);
      this.projectStore.setLoading(false);
      this.projectStore.setError(true);
      this.loading.set(false);
    }
  }
}
