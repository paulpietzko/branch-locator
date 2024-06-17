import { Component, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BranchService } from '../services/branch-service/branch.service';
import { CommonModule, Location } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
  providers: [BranchService,
    MatButtonModule,],
})
export class DetailComponent implements OnInit {
  branchId = signal<number | null>(null);
  branch = computed(() => {
    const id = this.branchId();
    if (id !== null) {
      return this.branchService.getBranchById(id);
    }
    return null;
  });

  constructor(
    private route: ActivatedRoute,
    private branchService: BranchService,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id !== null) {
        this.branchId.set(+id);
      } else {
        console.error('Invalid branch ID');
      }
    });
  }
}
