import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { BranchService } from '../services/branch-service/branch.service';

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
  branches = signal<any[]>([]);
  displayedColumns: string[] = [
    'sortiment',
    'firma',
    'plz',
    'ort',
    'kanton',
    'details',
  ];

  constructor(private branchService: BranchService) {
    this.loadBranches();
  }

  loadBranches() {
    this.branches.set(this.branchService.getBranches()());
  }
}
