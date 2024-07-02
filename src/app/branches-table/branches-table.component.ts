import {
  Component,
  computed,
  effect,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { RouterModule, Router } from '@angular/router';
import { BranchService } from '../services/branch.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Branch } from '../models';
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
import { BranchFormComponent } from '../branch-form/branch-form.component';
import { BranchesTableDownloadComponent } from '../branches-table-download/branches-table-download.component';
import { Meta } from '@angular/platform-browser';

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
        BranchesTableDownloadComponent
    ]
})
export class BranchesTableComponent implements AfterViewInit {
  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  @ViewChild(MatSort) sort: MatSort | null = null;

  displayedColumns: string[] = [
    'name',
    'postCode',
    'location',
    'canton',
    'edit',
  ];
  branches = computed(() => this.branchService.getBranches());
  dataSource = new MatTableDataSource<Branch>([]);
  filterForm: FormGroup;
  filteredData: Branch[] = [];

  uniqueLocations: string[] = [];

  constructor(
    private branchService: BranchService,
    private fb: FormBuilder,
    public router: Router,
    public dialog: MatDialog,
    private _liveAnnouncer: LiveAnnouncer,
    private titleService: Title,
    private translate: TranslateService,
    private metaTagService: Meta
  ) {
    effect(() => {
      this.dataSource.data = this.branches();
      this.uniqueLocations = this.getUniqueLocations(this.branches());
      this.applyFilter();
      this.titleService.setTitle(`${this.translate.instant('info.TABLE')}: ${this.branches().length} ${this.translate.instant('info.BRANCHES')}`);
    });

    this.filterForm = this.fb.group({
      search: [''],
      locations: [[]],
    });
  }

  ngOnInit() {
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

    this.metaTagService.addTags([
      { name: 'keywords', content: 'Branches, Locator, Finder, CRUD, Table' },
      { name: 'robots', content: 'index, follow' },
      { name: 'author', content: 'Paul Pietko' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'date', content: '2024-07-02', scheme: 'YYYY-MM-DD' },
      { charset: 'UTF-8' }
    ]);
  }

  deleteBranch(id: string) {
    this.branchService.deleteBranch(id);
    this.branchService.getBranches();
  }

  ngAfterViewInit() {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
  }

  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }

  getUniqueLocations(branches: Branch[]): string[] {
    const locations = branches.map((branch) => branch.location);
    return [...new Set(locations)];
  }

  applyFilter() {
    const filterValue = {
      search: this.filterForm.get('search')?.value.trim().toLowerCase() || '',
      locations: this.filterForm.get('locations')?.value || [],
    };
    this.dataSource.filter = JSON.stringify(filterValue);

    if (!this.dataSource.paginator)
      return;

      this.dataSource.paginator.firstPage();
  }

  editBranch(id: string) {
    const dialogRef = this.dialog.open(BranchFormComponent, {
      width: '1000px',
      data: { id },
    });

    dialogRef.afterClosed().subscribe(() => {
      this.branchService.fetchBranches();
    });
  }

  addBranch() {
    const dialogRef = this.dialog.open(BranchFormComponent, {
      width: '1000px',
      data: {},
    });

    dialogRef.afterClosed().subscribe(() => {
      this.branchService.fetchBranches();
    });
  }
}