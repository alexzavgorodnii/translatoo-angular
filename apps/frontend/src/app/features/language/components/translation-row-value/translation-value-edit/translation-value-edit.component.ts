import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslationsService } from '../../../services/translations.service';

export interface TranslationValueEditComponentData {
  id: number;
  key: string;
  value: string;
  temp_value: string | null;
}

@Component({
  selector: 'app-translation-value-edit',
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
  ],
  template: `
    <h2 mat-dialog-title>
      Edit value of <b>"{{ data.key }}"</b> key
    </h2>
    <mat-dialog-content>
      <div class="flex flex-col pt-2">
        <mat-form-field class="w-full" floatLabel="always" appearance="outline">
          <mat-label>Value</mat-label>
          <textarea
            matInput
            (focus)="error.set(false)"
            [placeholder]="data.value ? data.value : (data.temp_value ?? '')"
            [(ngModel)]="data.value"
          ></textarea>
        </mat-form-field>
        @if (error()) {
          <div class="flex flex-row items-baseline gap-2 text-sm !text-red-500">
            <span>Something went wrong while updating the translation value</span>
          </div>
        }
      </div>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button
        mat-button
        class="!text-[var(--mat-sys-on-surface)]"
        (click)="onCancelClick()"
        [disabled]="updateInProgress()"
      >
        Cancel
      </button>
      <button mat-flat-button (click)="onSaveClick()" cdkFocusInitial [disabled]="updateInProgress()">Save</button>
    </mat-dialog-actions>
  `,
  styleUrl: './translation-value-edit.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TranslationValueEditComponent {
  data = inject<TranslationValueEditComponentData>(MAT_DIALOG_DATA);
  updateInProgress = signal(false);
  error = signal<boolean>(false);
  readonly dialogRef = inject(MatDialogRef<TranslationValueEditComponent>);
  private readonly translationsService = inject(TranslationsService);

  onCancelClick(): void {
    this.dialogRef.close(null);
  }
  async onSaveClick(): Promise<void> {
    this.updateInProgress.set(true);
    this.error.set(false);
    if (!this.data.value || this.data.value.trim() === '') {
      this.error.set(true);
      this.updateInProgress.set(false);
      return;
    }
    if (this.data.value === this.data.temp_value) {
      this.dialogRef.close(null);
      return;
    }
    // Call the service to update the translation value
    try {
      const translation = this.translationsService.updateTranslationValue(this.data.id, this.data.value);
      this.updateInProgress.set(false);
      this.dialogRef.close(translation);
    } catch (error) {
      console.error('Error updating translation value:', error);
      this.error.set(true);
      this.updateInProgress.set(false);
      return;
    }
  }
}
