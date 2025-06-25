import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  input,
  OnInit,
  output,
  signal,
  ViewChild,
} from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import {
  MissingTranslationFromFile,
  TranslationFromFile,
  UpdatedTranslationFromFile,
} from '../../../../core/models/translations';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SelectionModel } from '@angular/cdk/collections';

@Component({
  selector: 'app-imported-keys-table',
  imports: [MatTableModule, MatPaginatorModule, MatCheckboxModule],
  template: `
    <div [class]="'relative h-full min-h-[200px] overflow-auto'">
      <table mat-table [dataSource]="dataSource()">
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
            @if (row.newValue && row.oldValue) {
              <span class="text-gray-400">{{ row.oldValue }}</span>
              <span> → </span>
              <span>{{ row.newValue }}</span>
            } @else {
              {{ row.value }}
            }
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns(); sticky: true"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns()"></tr>
      </table>
    </div>

    <mat-paginator
      #paginator
      [length]="dataSource().data.length"
      [pageSize]="20"
      [showFirstLastButtons]="true"
      aria-label="Select page of GitHub search results"
    ></mat-paginator>
  `,
  styleUrl: './imported-keys-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImportedKeysTableComponent implements OnInit, AfterViewInit {
  displayedColumns = signal<string[]>(['key', 'value']);
  withSelection = input<boolean>(false);
  translations = input<TranslationFromFile[] | UpdatedTranslationFromFile[] | MissingTranslationFromFile[]>([]);
  selection = new SelectionModel<TranslationFromFile | UpdatedTranslationFromFile | MissingTranslationFromFile>(
    true,
    [],
  );
  dataSource = signal(
    new MatTableDataSource<TranslationFromFile | UpdatedTranslationFromFile | MissingTranslationFromFile>([]),
  );
  selectedItems = output<TranslationFromFile[] | UpdatedTranslationFromFile[] | MissingTranslationFromFile[]>();
  @ViewChild(MatPaginator) paginator?: MatPaginator;

  ngOnInit() {
    this.dataSource().data = this.translations();
    if (this.withSelection()) {
      this.displayedColumns().unshift('select');
      this.selection.changed.subscribe(() => {
        this.selectedItems.emit(this.selection.selected as any);
      });
    }
  }

  ngAfterViewInit() {
    if (this.paginator) {
      this.dataSource().paginator = this.paginator;
    }
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource().data.length;
    return numSelected === numRows;
  }

  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.dataSource().data);
  }
}
