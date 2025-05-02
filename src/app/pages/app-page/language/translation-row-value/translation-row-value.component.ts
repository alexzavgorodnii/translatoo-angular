import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, input, output } from '@angular/core';
import { Translation } from '../../../../../models/translations';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Pencil } from 'lucide-angular';
import { MatDialog } from '@angular/material/dialog';
import { TranslationValueEditComponent } from './translation-value-edit/translation-value-edit.component';

@Component({
  selector: 'app-translation-row-value',
  imports: [MatFormFieldModule, MatInputModule, FormsModule, LucideAngularModule],
  template: `
    @if (row().temp_value) {
      <span class="font-bold text-gray-200">{{ row().temp_value }}</span>
    } @else {
      <span>{{ row().value }}</span>
    }
    <button mat-icon-button class="edit-button" (click)="openEditValueDialog()">
      <lucide-icon [img]="Pencil" [size]="16"></lucide-icon>
    </button>
  `,
  styleUrl: './translation-row-value.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TranslationRowValueComponent {
  readonly Pencil = Pencil;
  readonly dialog = inject(MatDialog);
  row = input.required<Translation>();
  changedRow = output<Translation>();
  private readonly cdf = inject(ChangeDetectorRef);

  openEditValueDialog(): void {
    const dialogRef = this.dialog.open(TranslationValueEditComponent, {
      width: '400px',
      disableClose: true,
      data: {
        id: this.row().id,
        key: this.row().key,
        value: this.row().value,
        temp_value: this.row().temp_value,
      },
    });

    dialogRef.afterClosed().subscribe((result: Translation) => {
      if (result) {
        const { value } = result;
        this.row().value = value;
        this.row().temp_value = undefined;
        this.changedRow.emit(result);
        this.cdf.detectChanges();
      }
    });
  }
}
