import { Component, computed, effect, ViewChild, AfterViewInit } from '@angular/core';
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
import { TranslateModule } from '@ngx-translate/core';
import { Branch } from '../models';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { CustomMatPaginatorIntl } from '../providers/custom-paginator-intl';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-branches-table',
  standalone: true,
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
    MatDividerModule
  ],
  providers: [BranchService, { provide: MatPaginatorIntl, useClass: CustomMatPaginatorIntl }],
  templateUrl: './branches-table.component.html',
  styleUrls: ['./branches-table.component.scss'],
})
export class BranchesTableComponent implements AfterViewInit {
  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;

  displayedColumns: string[] = ['range', 'name', 'postCode', 'location', 'canton', 'edit'];
  branches = computed(() => this.branchService.getBranches());
  dataSource = new MatTableDataSource<Branch>([]);
  filterForm: FormGroup;

  uniqueLocations: string[] = [];

  constructor(private branchService: BranchService, private fb: FormBuilder, private router: Router) {
    this.filterForm = this.fb.group({
      search: [''],
      locations: [[]]
    });

    effect(() => {
      this.dataSource.data = this.branches();
      this.uniqueLocations = this.getUniqueLocations(this.branches());
      this.applyFilter();
    });

    this.dataSource.filterPredicate = (data: Branch, filter: string): boolean => {
      const filters = JSON.parse(filter);
      const searchFilter = filters.search.toLowerCase();
      const locationFilter = filters.locations;

      const matchesSearch = !searchFilter || data.name.toLowerCase().includes(searchFilter);
      const matchesLocation = !locationFilter.length || locationFilter.includes(data.location);

      return matchesSearch && matchesLocation;
    };
  }

  viewDetails(id: string) {
    this.router.navigate(['/filialen/detail', id]);
  }

  editBranch(id: string) {
    this.router.navigate(['/filialen/edit', id]);
  }

  deleteBranch(id: string) {
    if (confirm('Are you sure you want to delete this branch?')) {
      this.branchService.deleteBranch(id);
      this.branchService.getBranches();
    }
  }

  ngAfterViewInit() {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }

  getUniqueLocations(branches: Branch[]): string[] {
    const locations = branches.map(branch => branch.location);
    return [...new Set(locations)];
  }

  applyFilter() {
    const filterValue = {
      search: this.filterForm.get('search')?.value.trim() || '',
      locations: this.filterForm.get('locations')?.value || []
    };
    this.dataSource.filter = JSON.stringify(filterValue);

    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }
}
