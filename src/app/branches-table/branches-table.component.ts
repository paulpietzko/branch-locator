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
import { Branch, DataObject } from '../models';
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
import * as XLSX from 'xlsx';
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
export class BranchesTableComponent implements AfterViewInit {
  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  @ViewChild(MatSort) sort: MatSort | null = null;

  displayedColumns: string[] = [
    'name',
    'postCode',
    'location',
    'canton',
    'edit',
    'detailLink',
  ];
  branches = computed(() => this.branchService.getBranches());
  dataSource = new MatTableDataSource<Branch>([]);
  filterForm: FormGroup;
  importedData: Branch[] = [];
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
      this.titleService.setTitle(
        `${this.translate.instant('info.TABLE')}: ${
          this.branches().length
        } ${this.translate.instant('info.BRANCHES')}`
      );
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

    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilter();
    });

    this.metaTagService.addTags([
      { name: 'keywords', content: 'Branches, Locator, Finder, CRUD, Table' },
      { name: 'robots', content: 'index, follow' },
      { name: 'author', content: 'Paul Pietko' },
      // { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      // { name: 'date', content: '2024-07-02', scheme: 'YYYY-MM-DD' },
      // { charset: 'UTF-8' },
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

    if (!this.dataSource.paginator) return;

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

  // Import
  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (!file) return;

    const fileExtension = file.name.split('.').pop();
    const fileReader: FileReader = new FileReader();

    fileReader.onload = (e) => {
      let importedData;
      const contents = fileReader.result;

      try {
        switch (fileExtension) {
          case 'json':
            importedData = JSON.parse(contents as string);
            break;
          case 'csv':
            const csvData = (contents as string).trim();
            importedData = this.parseCSVtoJSON(csvData);
            break;
          case 'xlsx':
            const workbook = XLSX.read(contents, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            importedData = XLSX.utils.sheet_to_json(worksheet);
            break;
          default:
            console.error('Unsupported file type');
            return;
        }
        this.importedData = importedData as Branch[];
      } catch (error) {
        console.error('Error parsing file:', error);
      }
    };

    if (fileExtension === 'xlsx') {
      fileReader.readAsArrayBuffer(file);
    } else {
      fileReader.readAsText(file);
    }
  }

  parseCSVtoJSON(csvData: string): Branch[] {
    const lines = csvData.split('\n');
    return lines.map((line) => {
      const values = line.split(',');
      // Create and return a Branch object, trimming quotes and whitespace from each value
      return {
        id: values[0].trim().replace(/^"|"$/g, ''),
        postCode: values[1].trim().replace(/^"|"$/g, ''),
        name: values[2].trim().replace(/^"|"$/g, ''),
        location: values[3].trim().replace(/^"|"$/g, ''),
        email: values[4].trim().replace(/^"|"$/g, ''),
        canton: values[5].trim().replace(/^"|"$/g, ''),
        website: values[6].trim().replace(/^"|"$/g, ''),
        openingHours: values[7].trim().replace(/^"|"$/g, ''),
        phone: values[8].trim().replace(/^"|"$/g, ''),
        lat: parseFloat(values[9].trim().replace(/^"|"$/g, '')),
        lng: parseFloat(values[10].trim().replace(/^"|"$/g, '')),
        imagePath: values[11]
          ? values[11].trim().replace(/^"|"$/g, '')
          : undefined,
      };
    });
  }

  addBranches() {
    this.branchService.addBranches(this.importedData);
  }
}
