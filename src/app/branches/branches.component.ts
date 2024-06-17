import { Component, OnInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { BranchService } from '../services/branch-service/branch.service';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { signal } from '@angular/core';

@Component({
  selector: 'app-branches',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    HttpClientModule,
    RouterModule,
  ],
  templateUrl: './branches.component.html',
  styleUrls: ['./branches.component.scss'],
  providers: [
    BranchService,
  ]
})
export class BranchesComponent implements OnInit {
  branches = signal<any[]>([]);
  displayedColumns: string[] = ['sortiment', 'firma', 'plz', 'ort', 'kanton', 'details'];

  constructor(private branchService: BranchService) {}

  ngOnInit(): void {
    this.branches = this.branchService.getBranches();
  }
}
