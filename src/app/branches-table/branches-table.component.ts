import { Component, computed, signal, effect, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { RouterModule } from '@angular/router';
import { BranchService } from '../services/branch.service';
import { TranslateModule } from '@ngx-translate/core';
import { Branch } from '../models';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { CustomMatPaginatorIntl } from '../providers/custom-paginator-intl';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

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
    ReactiveFormsModule
  ],
  providers: [BranchService, { provide: MatPaginatorIntl, useClass: CustomMatPaginatorIntl }],
  templateUrl: './branches-table.component.html',
  styleUrls: ['./branches-table.component.scss'],
})
export class BranchesTableComponent implements AfterViewInit {
  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;

  displayedColumns: string[] = ['range', 'name', 'postCode', 'location', 'canton', 'details'];
  branches = computed(() => this.branchService.getBranches());
  dataSource = new MatTableDataSource<Branch>([]);
  filterForm: FormGroup;

  uniqueLocations: string[] = [];

  constructor(private branchService: BranchService, private fb: FormBuilder) {
    this.filterForm = this.fb.group({
      search: [''],
      locations: [[]]
    });

    effect(() => {
      this.dataSource.data = this.branches();
      this.uniqueLocations = this.getUniqueLocations(this.branches());
      this.applyFilter();
    });
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
    const filterValue = this.filterForm.get('search')?.value.trim().toLowerCase();
    const selectedLocations = this.filterForm.get('locations')?.value;

    this.dataSource.filter = filterValue;

    if (selectedLocations.length > 0) {
      this.dataSource.data = this.branches().filter(branch =>
        selectedLocations.includes(branch.location)
      );
    } else {
      this.dataSource.data = this.branches();
    }

    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }
}
