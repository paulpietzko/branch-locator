import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { BranchService } from '../services/branch-service/branch.service';

@Component({
  selector: 'app-branches',
  standalone: true,
  templateUrl: './branches.component.html',
  styleUrls: ['./branches.component.scss'],
  imports: [CommonModule, MatTableModule, MatIconModule, MatButtonModule, RouterModule],
  providers: [BranchService]
})
export class BranchesComponent {
  branches = signal<any[]>([]);
  displayedColumns: string[] = ['sortiment', 'firma', 'plz', 'ort', 'kanton', 'details'];

  constructor(private branchService: BranchService) {
    this.loadBranches();
  }

  loadBranches() {
    this.branches.set(this.branchService.branches());
  }
}
