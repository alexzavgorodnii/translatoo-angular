import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { Translation } from '../../../../../models/translations';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-translation-row-value',
  imports: [MatFormFieldModule, MatInputModule, FormsModule],
  template: `
    @if (editMode()) {
      <mat-form-field class="compact w-full" floatLabel="always" appearance="outline">
        <textarea matInput [placeholder]="row().value ? row().value : (row().temp_value ?? '')"></textarea>
      </mat-form-field>
    } @else {
      @if (row().temp_value) {
        <span class="font-bold text-gray-200" (click)="editMode.set(true)">{{ row().temp_value }}</span>
      } @else {
        <span (click)="editMode.set(true)">{{ row().value }}</span>
      }
    }
  `,
  styleUrl: './translation-row-value.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TranslationRowValueComponent {
  row = input.required<Translation>();
  editMode = signal(false);
}
