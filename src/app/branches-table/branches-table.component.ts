import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { BranchService } from '../services/branch-service/branch.service';
import { Branch } from '../models';

@Component({
  selector: 'app-branches-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    RouterModule,
  ],
  providers: [BranchService],
  templateUrl: './branches-table.component.html',
  styleUrl: './branches-table.component.scss',
})
export class BranchesTableComponent {
  branches = computed(() => this.branchService.getBranches());
  displayedColumns: string[] = [
    'sortiment',
    'firma',
    'plz',
    'ort',
    'kanton',
    'details',
  ];

  private branchService = inject(BranchService);

  constructor() {}
}
