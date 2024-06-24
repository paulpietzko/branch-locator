import { MatPaginatorIntl } from '@angular/material/paginator';
import { TranslateService } from '@ngx-translate/core';
import { Injectable } from '@angular/core';

@Injectable()
export class CustomMatPaginatorIntl extends MatPaginatorIntl {
  pageOf= '';
  constructor(private translate: TranslateService) {
    super(); // Calling constructor of superclass -> MatPaginatorIntl
    this.getAndInitTranslations();
    this.translate.onLangChange.subscribe(() => {
      this.getAndInitTranslations();
    });
  }

  getAndInitTranslations() {
    this.translate
      .get([
        'branchTable.ITEMS_PER_PAGE',
        'branchTable.NEXT_PAGE',
        'branchTable.PREVIOUS_PAGE',
        'branchTable.PAGE_OF'
      ])
      .subscribe((translation) => {
        this.itemsPerPageLabel = translation['branchTable.ITEMS_PER_PAGE'];
        this.nextPageLabel = translation['branchTable.NEXT_PAGE'];
        this.previousPageLabel = translation['branchTable.PREVIOUS_PAGE'];
        this.pageOf = translation['branchTable.PAGE_OF'];
        this.changes.next(); // Notify about the changes
      });
  }

  override getRangeLabel = (page: number, pageSize: number, length: number) => {
    if (length === 0 || pageSize === 0) {
      return `0 von ${length}`;
    }
    const amountPages = Math.ceil(length / pageSize);
    const currentPage = page + 1;
    return `${currentPage} ${this.pageOf} ${amountPages}`;
  };
}
