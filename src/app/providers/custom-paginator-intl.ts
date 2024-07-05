// #region Imports

import { MatPaginatorIntl } from '@angular/material/paginator';
import { TranslateService } from '@ngx-translate/core';
import { Injectable, OnDestroy } from '@angular/core';
import { SubSink } from 'subsink';

// #endregion

@Injectable()
export class CustomMatPaginatorIntl
  extends MatPaginatorIntl
  implements OnDestroy
{
  private subs = new SubSink();
  pageOf = '';

  // #region Constructor

  constructor(private translate: TranslateService) {
    super(); // Calling constructor of superclass -> MatPaginatorIntl
    this.getAndInitTranslations();
    this.translate.onLangChange.subscribe(() => {
      this.getAndInitTranslations();
    });
  }

  // #endregion

  // #region Translation Methods

  getAndInitTranslations() {
    this.subs.add(
      this.translate
        .get([
          'INFO.ITEMS_PER_PAGE',
          'INFO.NEXT_PAGE',
          'INFO.PREVIOUS_PAGE',
          'INFO.PAGE_OF',
        ])
        .subscribe((translation) => {
          this.itemsPerPageLabel = translation['INFO.ITEMS_PER_PAGE'];
          this.nextPageLabel = translation['INFO.NEXT_PAGE'];
          this.previousPageLabel = translation['INFO.PREVIOUS_PAGE'];
          this.pageOf = translation['INFO.PAGE_OF'];
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
