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
    MatPaginatorModule
  ],
  providers: [BranchService],
  templateUrl: './branches-table.component.html',
  styleUrls: ['./branches-table.component.scss'],
})
export class BranchesTableComponent implements AfterViewInit {
  
  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  
  displayedColumns: string[] = [
    'sortiment',
    'firma',
    'plz',
    'ort',
    'kanton',
    'details',
  ];

  branches = computed(() => this.branchService.getBranches());
  dataSource = new MatTableDataSource<Branch>([]);
  selectedLocations: string[] = [];
  uniqueLocations: string[] = [];

  constructor(private branchService: BranchService) {
    effect(() => {
      const branches = this.branches();
      this.dataSource.data = branches;
      this.uniqueLocations = this.getUniqueLocations(branches);
    });
  }

  ngAfterViewInit() {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }

  getUniqueLocations(branches: Branch[]): string[] {
    const locations = branches.map((branch) => branch.ort);
    return [...new Set(locations)];
  }

  applyFilter(event?: Event) {
    let filterValue = '';
    if (event) {
      filterValue = (event.target as HTMLInputElement).value
        .trim()
        .toLowerCase();
    }

    this.dataSource.filter = filterValue;

    if (this.selectedLocations.length > 0) {
      this.dataSource.data = this.branches().filter((branch) =>
        this.selectedLocations.includes(branch.ort)
      );
    } else {
      this.dataSource.data = this.branches();
    }

    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }
}
