import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { GoogleMapsModule } from '@angular/google-maps';
import { BranchService } from '../services/branch-service/branch.service';

@Component({
  selector: 'app-branch-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, GoogleMapsModule],
  providers: [BranchService],
  templateUrl: './branch-detail.component.html',
  styleUrl: './branch-detail.component.scss',
})
export class BranchDetailComponent {
  branchId = signal<number | null>(null);
  branch = computed(() => {
    const id = this.branchId();
    const branchData = id !== null ? this.branchService.getBranchById(id) : null;
    if (branchData) {
      this.mapCenter = { lat: branchData.lat, lng: branchData.lng };
    }
    // TODO: ensure return value is not null
    return branchData!;
  });
  mapCenter = { lat: 0, lng: 0 };

  private branchService = inject(BranchService);
  private route = inject(ActivatedRoute);

  constructor() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id !== null) {
        const branchId = +id;
        this.branchId.set(branchId);
      } else {
        console.error('Invalid branch ID');
      }
    });
  }
}
