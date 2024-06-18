import { Component, signal } from '@angular/core';
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
  branches = signal<Branch[]>([]);
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
    let newBranches = this.branchService.getBranches()
    this.branches.set(newBranches);
  }
}

