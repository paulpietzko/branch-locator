import {
  Component,
  computed,
  effect,
  ViewChild,
  AfterViewInit,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule, getLocaleEraNames } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { RouterModule, Router } from '@angular/router';
import { BranchService } from '../services/branch.service';
import { BranchImportService } from '../services/branch-import.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Branch, MetaTag } from '../models';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { CustomMatPaginatorIntl } from '../providers/custom-paginator-intl';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog } from '@angular/material/dialog';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Title } from '@angular/platform-browser';
import { BRANCH_FORMComponent } from '../branch-form/branch-form.component';
import { BranchesTableDownloadComponent } from '../branches-table-download/branches-table-download.component';
import { Meta } from '@angular/platform-browser';
import metadata from '../../../public/assets/metadata/metadata.json';
import { SubSink } from 'subsink';

@Component({
  selector: 'app-branches-table',
  standalone: true,
  providers: [
    BranchService,
    { provide: MatPaginatorIntl, useClass: CustomMatPaginatorIntl },
  ],
  templateUrl: './branches-table.component.html',
  styleUrls: ['./branches-table.component.scss'],
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    RouterModule,
    TranslateModule,
    MatPaginatorModule,
    ReactiveFormsModule,
    MatMenuModule,
    MatDividerModule,
    MatSortModule,
    BranchesTableDownloadComponent,
  ],
})
export class BranchesTableComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  @ViewChild(MatSort) sort: MatSort | null = null;
  private subs = new SubSink();

  displayedColumns: string[] = [
    'name',
    'postCode',
    'location',
    'canton',
    'detailLink',
    'edit',
  ];
  branches = computed(() => this.branchService.getBranches());
  dataSource = new MatTableDataSource<Branch>([]);
  filterForm: FormGroup;
  uniqueLocations: string[] = [];

  constructor(
    private branchService: BranchService,
    public branchImportService: BranchImportService,
    private fb: FormBuilder,
    public router: Router,
    public dialog: MatDialog,
    private _liveAnnouncer: LiveAnnouncer,
    private titleService: Title,
    private translate: TranslateService,
    private metaTagService: Meta
  ) {
    this.initializeEffects();
    this.filterForm = this.createFilterForm();
    this.initializeMetaTags('branchesTable');
  }

  ngOnInit() {
    this.initializeFilterPredicate();
    this.subscribeToFilterFormChanges();
  }

  ngAfterViewInit() {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
  }

  // #region Data Handling

  private initializeEffects() {
    effect(() => {
      this.dataSource.data = this.branches();
      this.uniqueLocations = this.getUniqueLocations(this.branches());
      this.applyFilter();
      this.updateTitle();
    });
  }

  private getUniqueLocations(branches: Branch[]): string[] {
    const locations = branches.map((branch) => branch.location);
    return [...new Set(locations)];
  }

  private updateTitle() {
    this.titleService.setTitle(
      `${this.translate.instant('INFO.TABLE')}: ${
        this.branches().length
      } ${this.translate.instant('INFO.BRANCHES')}`
    );
  }

  private initializeMetaTags(section: string) {}

  // #endregion

  // #region Filter and Sorting

  private createFilterForm(): FormGroup {
    return this.fb.group({
      search: [''],
      locations: [[]],
    });
  }

  private initializeFilterPredicate() {
    this.dataSource.filterPredicate = (
      data: Branch,
      filter: string
    ): boolean => {
      const filters = JSON.parse(filter);
      const searchFilter = filters.search.toLowerCase();
      const locationFilter = filters.locations;

      const matchesSearch =
        !searchFilter || data.name.toLowerCase().includes(searchFilter);
      const matchesLocation =
        !locationFilter.length || locationFilter.includes(data.location);

      return matchesSearch && matchesLocation;
    };
  }

  private subscribeToFilterFormChanges() {
    this.subs.add(
      this.filterForm.valueChanges.subscribe(() => {
        this.applyFilter();
      })
    );
  }

  applyFilter() {
    const filterValue = {
      search: this.filterForm.get('search')?.value.trim().toLowerCase() || '',
      locations: this.filterForm.get('locations')?.value || [],
    };
    this.dataSource.filter = JSON.stringify(filterValue);

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }

  // #endregion

  // #region Branch Actions

  deleteBranch(id: string) {
    this.branchService.deleteBranch(id);
    this.branchService.getBranches();
  }

  editBranch(id: string) {
    const dialogRef = this.dialog.open(BRANCH_FORMComponent, {
      width: '1000px',
      data: { id },
    });

    this.subs.add(
      dialogRef.afterClosed().subscribe(() => {
        this.branchService.fetchBranches();
      })
    );
  }

  addBranch() {
    const dialogRef = this.dialog.open(BRANCH_FORMComponent, {
      width: '1000px',
      data: {},
    });

    this.subs.add(
      dialogRef.afterClosed().subscribe(() => {
        this.branchService.fetchBranches();
      })
    );
  }

  onFileSelected(event: Event) {
    
    this.branchImportService.onFileSelected(event);
    this.applyFilter();
  }

  // #endregion

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
