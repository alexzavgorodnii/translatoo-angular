import { ChangeDetectionStrategy, Component, inject, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { SupabaseService } from '../../../../../services/supabase.service';
import { NewProjectComponent } from '../../projects/new-project/new-project.component';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { ProjectWithLanguages } from '../../../../../models/projects';
import { LanguageWithTranslations } from '../../../../../models/languages';
import { Translation } from '../../../../../models/translations';
import { take } from 'rxjs/internal/operators/take';

interface DialogData {
  project: ProjectWithLanguages;
}

@Component({
  selector: 'app-new-language',
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatRadioModule,
    MatSelectModule,
  ],
  template: `
    <h2 mat-dialog-title>New language</h2>
    <mat-dialog-content>
      <p>What's the language name?</p>
      <mat-form-field class="w-full">
        <mat-label>Name</mat-label>
        <input matInput [(ngModel)]="name" />
      </mat-form-field>
      <p>Clone keys from existing language?</p>
      <mat-radio-group aria-label="Select an option" [(ngModel)]="copy">
        <mat-radio-button value="yes">Yes</mat-radio-button>
        <mat-radio-button value="no">No</mat-radio-button>
      </mat-radio-group>
      @if (copy() === 'yes') {
        <p>Which language do you want to clone?</p>
        <mat-form-field>
          <mat-label>Choose language</mat-label>
          <mat-select [(ngModel)]="languageId">
            @for (language of data.project.languages; track language.id) {
              <mat-option [value]="language.id">
                {{ language.name }}
              </mat-option>
            }
          </mat-select>
        </mat-form-field>
      }
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button class="!text-[var(--mat-sys-on-surface)]" (click)="onCancelClick()">Cancel</button>
      <button mat-flat-button (click)="onAddClick()" cdkFocusInitial>Add</button>
    </mat-dialog-actions>
  `,
  styleUrl: './new-language.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewLanguageComponent {
  readonly dialogRef = inject(MatDialogRef<NewProjectComponent>);
  readonly data = inject<DialogData>(MAT_DIALOG_DATA);
  readonly supabaseService = inject(SupabaseService);
  readonly name = model('');
  readonly copy = model('no');
  readonly language = model({});
  readonly languageId = model('');

  onCancelClick(): void {
    this.dialogRef.close();
  }

  onAddClick(): void {
    this.supabaseService
      .addLanguage(this.name(), this.data.project.id)
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
                        this.dialogRef.close(this.language());
                      },
                      error: () => {
                        console.error('Error adding translations');
                        this.language.set(language);
                        this.dialogRef.close(this.language());
                      },
                    });
                },
                error: () => {
                  console.error('Error fetching language for copy');
                  this.language.set(language);
                  this.dialogRef.close(this.language());
                },
              });
          } else {
            this.language.set(language);
            this.dialogRef.close(this.language());
          }
        },
        error: error => {
          console.error('Error adding project:', error);
        },
      });
  }
}
