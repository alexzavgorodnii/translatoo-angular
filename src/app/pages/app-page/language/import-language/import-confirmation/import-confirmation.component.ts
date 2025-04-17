import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { ArrowRight, LucideAngularModule, Plus, X } from 'lucide-angular';

export interface ImportConfirmationResult {
  confirm: boolean;
}
export interface ImportConfirmationComponentData {
  languageName: string;
  newTranslationsCount: number;
  updatedTranslationsCount: number;
  missingTranslationsCount: number;
}

@Component({
  selector: 'app-import-confirmation',
  imports: [MatButtonModule, MatDialogTitle, MatDialogContent, MatDialogActions, LucideAngularModule],
  template: `
    <h2 mat-dialog-title>Confirm Changes</h2>
    <mat-dialog-content>
      <p>Are you sure you want to apply these changes to {{ data.languageName }}?</p>
      <div class="py-4">
        <div class="space-y-2">
          <div class="flex items-center gap-1 text-sm">
            <lucide-icon class="mr-2 h-4 w-4 text-green-500" [img]="Plus" [size]="16"></lucide-icon>
            <span>{{ data.newTranslationsCount }} new translations will be added</span>
          </div>

          <div class="flex items-center gap-1 text-sm">
            <lucide-icon class="mr-2 h-4 w-4 text-orange-500" [img]="ArrowRight" [size]="16"></lucide-icon>
            <span>{{ data.updatedTranslationsCount }} translations will be updated</span>
          </div>

          <div class="flex items-center gap-1 text-sm">
            <lucide-icon class="mr-2 h-4 w-4 text-red-500" [img]="X" [size]="16"></lucide-icon>
            <span>{{ data.missingTranslationsCount }} translations will be deleted</span>
          </div>
        </div>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button class="!text-[var(--mat-sys-on-surface)]" (click)="onCancelClick()">Cancel</button>
      <button mat-flat-button (click)="onConfirmClick()" cdkFocusInitial>Confirm</button>
    </mat-dialog-actions>
  `,
  styleUrl: './import-confirmation.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImportConfirmationComponent {
  data = inject<ImportConfirmationComponentData>(MAT_DIALOG_DATA);
  readonly dialogRef = inject(MatDialogRef<ImportConfirmationComponent>);
  readonly Plus = Plus;
  readonly ArrowRight = ArrowRight;
  readonly X = X;

  onCancelClick(): void {
    this.dialogRef.close();
  }

  onConfirmClick(): void {
    this.dialogRef.close({ confirm: true });
  }
}
