import { Component, signal, computed, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { GoogleMapsModule, MapMarker, MapInfoWindow } from '@angular/google-maps';
import { BranchService } from '../services/branch.service';
import { Branch } from '../models';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-branch-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    GoogleMapsModule,
    TranslateModule,
  ],
  providers: [BranchService],
  templateUrl: './branch-detail.component.html',
  styleUrls: ['./branch-detail.component.scss'],
})
export class BranchDetailComponent {
  @ViewChild(MapInfoWindow) infoWindow: MapInfoWindow | undefined;
  
  infoContent = signal<Branch | null>(null);
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

  openInfoWindow(marker: MapMarker): void {
    this.infoContent.set(this.branch());

    if (this.infoWindow) {
      this.infoWindow.open(marker);
    } else {
      console.error('InfoWindow is undefined');
    }
  }

  constructor(
    private branchService: BranchService,
    private route: ActivatedRoute
  ) {
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
