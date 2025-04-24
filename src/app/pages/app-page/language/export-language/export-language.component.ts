import { ChangeDetectionStrategy, Component, inject, model, signal } from '@angular/core';
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
import { MatSelectModule } from '@angular/material/select';
import { Translation } from '../../../../../models/translations';

export interface ExportLanguageComponentData {
  languageName: string;
  translations: Translation[];
}

@Component({
  selector: 'app-export-language',
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatSelectModule,
  ],
  template: `
    <h2 mat-dialog-title>Export language</h2>
    <mat-dialog-content>
      <div class="flex flex-col gap-4 pt-2">
        <mat-form-field class="w-full" floatLabel="always" appearance="outline">
          <mat-label>File name</mat-label>
          <input matInput [(ngModel)]="fileName" />
        </mat-form-field>
        <mat-form-field class="w-full" floatLabel="always" appearance="outline">
          <mat-label>File extension</mat-label>
          <mat-select [(ngModel)]="fileExtension">
            @for (type of extensions(); track type.value) {
              <mat-option [value]="type.value">
                {{ type.name }}
              </mat-option>
            }
          </mat-select>
        </mat-form-field>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button class="!text-[var(--mat-sys-on-surface)]" (click)="onCancelClick()">Cancel</button>
      <button mat-flat-button (click)="onExportClick()" cdkFocusInitial>Export</button>
    </mat-dialog-actions>
  `,
  styleUrl: './export-language.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExportLanguageComponent {
  data = inject<ExportLanguageComponentData>(MAT_DIALOG_DATA);
  readonly dialogRef = inject(MatDialogRef<ExportLanguageComponent>);
  readonly fileName = model('');
  readonly fileExtension = model('json');
  readonly extensions = signal([
    { name: 'JSON', value: 'json' },
    { name: 'Key Value JSON', value: 'keyvalue-json' },
    { name: 'Arb', value: 'arb' },
    { name: 'i18next JSON', value: 'i18next-json' },
  ]);

  constructor() {
    this.fileName.set(`${this.data.languageName}`);
  }

  onCancelClick(): void {
    this.dialogRef.close();
  }

  onExportClick(): void {
    const fileName = this.fileName() || 'exported_language.json';
    const blob = new Blob([JSON.stringify({ data: 'exported data' })], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
    this.dialogRef.close();
  }
}
