import { Injectable } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { Subject } from 'rxjs/internal/Subject';

@Injectable()
export class PaginatorIntlService implements MatPaginatorIntl {
  changes = new Subject<void>();
  firstPageLabel = '';
  itemsPerPageLabel = 'Items per page:';
  lastPageLabel = '';
  nextPageLabel = '';
  previousPageLabel = '';

  getRangeLabel(page: number, pageSize: number, length: number): string {
    if (length === 0) {
      return `Page 1 of 1`;
    }
    const amountPages = Math.ceil(length / pageSize);
    return `Page ${page + 1} of ${amountPages}`;
  }
}
