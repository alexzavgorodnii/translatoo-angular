import { ChangeDetectionStrategy, Component, inject, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { SupabaseService } from '../../../../../services/supabase.service';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { ProjectWithLanguages } from '../../../../../models/projects';
import { LanguageWithTranslations } from '../../../../../models/languages';
import { Translation } from '../../../../../models/translations';
import { take } from 'rxjs/internal/operators/take';
import { StateService } from '../../../../store/state.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDividerModule } from '@angular/material/divider';
import { LucideAngularModule, PanelLeft, Plus } from 'lucide-angular';
import { MatCardModule } from '@angular/material/card';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatProgressBarModule } from '@angular/material/progress-bar';

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
    MatDividerModule,
    RouterModule,
    LucideAngularModule,
    MatCardModule,
    MatProgressBarModule,
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
        <a mat-button [routerLink]="['/', 'projects', project().id]">{{ project().name }}</a>
        <span>/</span>
        <button mat-button disabled>New language</button>
      </div>
      <div class="flex-grow"></div>
      <button mat-button [routerLink]="['/', 'new-language']">
        <span class="inline-flex flex-row items-center gap-1">
          <lucide-icon [img]="Plus" [size]="16"></lucide-icon>
          New language
        </span>
      </button>
    </mat-toolbar>
    <mat-divider></mat-divider>
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
            <div class="mt-4 mb-4 flex flex-row gap-4">
              <div class="flex w-full max-w-[calc(400px)] flex-col">
                <p class="mb-2 font-bold">What's the language name?</p>
                <mat-form-field class="w-full">
                  <mat-label>Name</mat-label>
                  <input matInput [(ngModel)]="name" />
                </mat-form-field>
              </div>
              <div class="flex w-full flex-col">
                <p class="mb-2 font-bold">Clone keys from?</p>
                <div class="flex flex-col gap-[calc(24px)]">
                  <mat-radio-group
                    class="flex h-[calc(56px)] flex-row items-center"
                    aria-label="Select an option"
                    [(ngModel)]="copy"
                  >
                    <mat-radio-button value="language">From existing language</mat-radio-button>
                    <mat-radio-button value="file">From file</mat-radio-button>
                    <mat-radio-button value="no">No</mat-radio-button>
                  </mat-radio-group>
                  @if (copy() === 'language') {
                    <div class="flex flex-col gap-2">
                      <p class="font-bold">Which language do you want to clone?</p>
                      <mat-form-field>
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
                  }
                </div>
              </div>
            </div>
            <mat-divider></mat-divider>
          </mat-card-content>
          <mat-card-actions class="gap-2">
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
  readonly PanelLeft = PanelLeft;
  readonly Plus = Plus;
  readonly project = signal<ProjectWithLanguages>({
    id: '',
    created_at: '',
    name: '',
    languages: [],
  });
  readonly supabaseService = inject(SupabaseService);
  private stateService: StateService = inject(StateService);
  private readonly router: Router = inject(Router);
  readonly name = model('');
  readonly copy = model('no');
  readonly language = model({});
  readonly languageId = model('');
  private readonly route = inject(ActivatedRoute);

  constructor() {
    this.project.set(this.stateService.project);
    if (this.project().id.length === 0) {
      const id = this.route.snapshot.paramMap.get('id');
      if (!id) {
        console.error('No project ID provided in the route.');
        return;
      }
      this.supabaseService
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
    }
  }

  onCancelClick(): void {
    this.router.navigate(['/', 'projects', this.project().id]);
  }

  onAddClick(): void {
    this.supabaseService
      .addLanguage(this.name(), this.project().id)
      .pipe(take(1))
      .subscribe({
        next: language => {
          if (this.copy() === 'yes') {
            this.supabaseService
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
                  this.supabaseService
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
        },
      });
  }
}
