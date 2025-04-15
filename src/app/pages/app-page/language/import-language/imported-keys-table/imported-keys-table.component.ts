import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { TranslationFromFile } from '../../../../../../models/translations';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SelectionModel } from '@angular/cdk/collections';

@Component({
  selector: 'app-imported-keys-table',
  imports: [MatTableModule, MatPaginatorModule, MatCheckboxModule],
  template: `
    <div
      [class]="
        'max-h-[calc(100vh-var(--mat-toolbar-standard-height)-var(--mat-paginator-container-size)-80px)] ' +
        'relative min-h-[200px] overflow-auto'
      "
    >
      <table mat-table [dataSource]="translations()">
        <ng-container matColumnDef="select">
          <th mat-header-cell *matHeaderCellDef>
            <mat-checkbox
              (change)="$event ? toggleAllRows() : null"
              [checked]="selection.hasValue() && isAllSelected()"
              [indeterminate]="selection.hasValue() && !isAllSelected()"
            >
            </mat-checkbox>
          </th>
          <td mat-cell *matCellDef="let row">
            <mat-checkbox
              (click)="$event.stopPropagation()"
              (change)="$event ? selection.toggle(row) : null"
              [checked]="selection.isSelected(row)"
            >
            </mat-checkbox>
          </td>
        </ng-container>
        <ng-container matColumnDef="key">
          <th mat-header-cell *matHeaderCellDef>Key</th>
          <td mat-cell *matCellDef="let row">{{ row.key }}</td>
        </ng-container>

        <ng-container matColumnDef="value">
          <th mat-header-cell *matHeaderCellDef>Value</th>
          <td mat-cell *matCellDef="let row">
            @if (row.temp_value) {
              <span class="font-bold text-gray-200">{{ row.temp_value }}</span>
            } @else {
              {{ row.value }}
            }
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns; sticky: true"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
      </table>
    </div>

    <mat-paginator
      #missingPaginator
      [length]="translations().data.length"
      [pageSize]="20"
      [showFirstLastButtons]="true"
      aria-label="Select page of GitHub search results"
    ></mat-paginator>
  `,
  styleUrl: './imported-keys-table.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImportedKeysTableComponent {
  displayedColumns: string[] = ['select', 'key', 'value'];
  translations = input<MatTableDataSource<TranslationFromFile>>(new MatTableDataSource<TranslationFromFile>([]));
  selection = new SelectionModel<TranslationFromFile>(true, []);

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.translations().data.length;
    return numSelected === numRows;
  }

  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.translations().data);
  }
}
