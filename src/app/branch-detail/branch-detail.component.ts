import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { GoogleMapsModule } from '@angular/google-maps';
import { BranchService } from '../services/branch.service';
import { Branch } from '../models';

@Component({
  selector: 'app-branch-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, GoogleMapsModule],
  providers: [BranchService],
  templateUrl: './branch-detail.component.html',
  styleUrls: ['./branch-detail.component.scss'],
})
export class BranchDetailComponent {
  branchId = signal<string | null>(null);
  branch = computed<Branch | null>(() => {
    const id = this.branchId();
    const branchData = id ? this.branchService.getBranchById(id) : null;
    if (branchData) {
      this.mapCenter = { lat: branchData.lat, lng: branchData.lng };
      return branchData;
    } else {
      return null;
    }
  });
  mapCenter = { lat: 0, lng: 0 };

  constructor(private branchService: BranchService, private route: ActivatedRoute) {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id !== null) {
        this.branchId.set(id);
      } else {
        console.error('Invalid branch ID');
      }
    });
  }
}
