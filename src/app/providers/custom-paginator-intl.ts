import { MatPaginatorIntl } from '@angular/material/paginator';
import { TranslateService } from '@ngx-translate/core';
import { Injectable, OnDestroy } from '@angular/core';
import { SubSink } from 'subsink';

@Injectable()
export class CustomMatPaginatorIntl
  extends MatPaginatorIntl
  implements OnDestroy
{
  private subs = new SubSink();
  pageOf = '';

  constructor(private translate: TranslateService) {
    super(); // Calling constructor of superclass -> MatPaginatorIntl
    this.getAndInitTranslations();
    this.translate.onLangChange.subscribe(() => {
      this.getAndInitTranslations();
    });
  }

  // #region Translation Methods

  getAndInitTranslations() {
    this.subs.add(
      this.translate
        .get([
          'PAGINATION.ITEMS_PER_PAGE',
          'PAGINATION.NEXT_PAGE',
          'PAGINATION.PREVIOUS_PAGE',
          'PAGINATION.PAGE_OF',
        ])
        .subscribe((translation) => {
          this.itemsPerPageLabel = translation['PAGINATION.ITEMS_PER_PAGE'];
          this.nextPageLabel = translation['PAGINATION.NEXT_PAGE'];
          this.previousPageLabel = translation['PAGINATION.PREVIOUS_PAGE'];
          this.pageOf = translation['PAGINATION.PAGE_OF'];
          this.changes.next(); // Notify about the changes
        })
    );
  }

  override getRangeLabel = (page: number, pageSize: number, length: number) => {
    if (length === 0 || pageSize === 0) {
      return `0 von ${length}`;
    }
    const amountPages = Math.ceil(length / pageSize);
    const currentPage = page + 1;
    return `${currentPage} ${this.pageOf} ${amountPages}`;
  };

  // #endregion

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
