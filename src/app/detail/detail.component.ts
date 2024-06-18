import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { GoogleMapsModule } from '@angular/google-maps';
import { BranchService } from '../services/branch-service/branch.service';

@Component({
  selector: 'app-detail',
  standalone: true,
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
  imports: [CommonModule, RouterModule, MatButtonModule, GoogleMapsModule],
  providers: [BranchService],
})
export class DetailComponent {
  branchId = signal<number | null>(null);
  branch = computed(() => {
    const id = this.branchId();
    return id !== null ? this.branchService.getBranchById(id) : null;
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
        const branch = this.branchService.getBranchById(branchId);
        if (branch) {
          this.mapCenter = { lat: branch.lat, lng: branch.lng };
        }
      } else {
        console.error('Invalid branch ID');
      }
    });
  }
}
