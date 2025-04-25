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
import { generateKeyValueJSON, generateI18Next } from '../../../../../utils/exporters/translation-exporters';

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
    const fileExtension = this.getFileExtension(this.fileExtension());
    const fileContent = this.generateFileContent(this.fileExtension(), this.data.translations);
    const fileName = this.fileName() || `exported_language.${fileExtension}`;
    const finalFilename = fileName
      ? fileName.includes(`.${fileExtension}`)
        ? fileName
        : `${fileName}.${fileExtension}`
      : `${this.data.languageName}.${fileExtension}`;

    const blob = new Blob([fileContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = finalFilename;
    a.click();
    URL.revokeObjectURL(url);
    this.dialogRef.close();
  }

  private getFileExtension(format: string): string {
    const formatExtensionMap: Record<string, string> = {
      arb: 'arb',
      csv: 'csv',
      ini: 'ini',
      'keyvalue-json': 'json',
      'i18next-json': 'json',
      json: 'json',
      po: 'po',
      pot: 'pot',
      mo: 'mo',
      properties: 'properties',
      resw: 'resw',
      resx: 'resx',
      ts: 'ts',
      strings: 'strings',
      xliff: 'xliff',
      xcstrings: 'xcstrings',
      'xlf-1': 'xlf',
      xmb: 'xmb',
      xtb: 'xtb',
      'xlf-2': 'xlf',
      'xlf-3': 'xlf',
      xls: 'xls',
      xlsx: 'xlsx',
      xml: 'xml',
      yml: 'yml',
    };

    return formatExtensionMap[format] || format;
  }

  private generateFileContent(format: string, translations: Translation[]): string {
    switch (format) {
      case 'json':
      case 'keyvalue-json':
      case 'arb':
        return generateKeyValueJSON(translations);

      case 'i18next-json':
        return generateI18Next(translations);

      default:
        throw new Error(`Export format '${format}' is not yet implemented`);
    }
  }
}
