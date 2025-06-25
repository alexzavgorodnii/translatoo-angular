import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Translation } from 'shared-types';

@Component({
  selector: 'app-edit-translation-key-dialog',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  template: `
    <h2 mat-dialog-title>Edit translation</h2>
    <mat-dialog-content>
      <form [formGroup]="translationForm" class="flex flex-col gap-4 pt-2">
        <mat-form-field class="w-full" floatLabel="always" appearance="outline">
          <mat-label>Key</mat-label>
          <input matInput formControlName="key" />
        </mat-form-field>
        <mat-form-field class="w-full" floatLabel="always" appearance="outline">
          <mat-label>Value</mat-label>
          <textarea matInput formControlName="value"></textarea>
        </mat-form-field>
        <mat-form-field class="w-full" floatLabel="always" appearance="outline">
          <mat-label>Comment</mat-label>
          <textarea matInput formControlName="comment"></textarea>
        </mat-form-field>
        <mat-form-field class="w-full" floatLabel="always" appearance="outline">
          <mat-label>Tag</mat-label>
          <input matInput formControlName="tag" />
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button class="!text-[var(--mat-sys-on-surface)]" mat-dialog-close>Cancel</button>
      <button mat-flat-button (click)="onSaveClick()" cdkFocusInitial>Save</button>
    </mat-dialog-actions>
  `,
  styleUrl: './edit-translation-key-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditTranslationKeyDialogComponent {
  data = inject<{ translation: Translation }>(MAT_DIALOG_DATA);
  readonly dialogRef = inject(MatDialogRef<EditTranslationKeyDialogComponent>);

  private formBuilder = inject(FormBuilder);
  translationForm = this.formBuilder.group({
    key: [{ value: this.data.translation.key, disabled: true }, [Validators.required]],
    value: [this.data.translation.value],
    comment: [this.data.translation.comment],
    tag: [this.data.translation.tag],
  });

  onSaveClick() {
    // Logic to save the edited translation key
    this.dialogRef.close(this.data.translation);
  }
}
