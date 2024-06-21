import { Component, ViewChild, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleMapsModule, MapInfoWindow, MapMarker } from '@angular/google-maps';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { BranchService } from '../services/branch-service/branch.service';
import { Branch, BranchMapMarker } from '../models';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-branches-map',
  standalone: true,
  imports: [CommonModule, GoogleMapsModule, RouterModule, MatButtonModule],
  providers: [BranchService],
  templateUrl: './branches-map.component.html',
  styleUrls: ['./branches-map.component.scss'],
})
export class BranchesMapComponent {
  @ViewChild(MapInfoWindow) infoWindow: MapInfoWindow | undefined;
  
  branches = signal<Branch[]>([]);
  center: google.maps.LatLngLiteral = { lat: 46.8182, lng: 8.2275 }; // Center of Switzerland
  zoom = 8;
  markers: BranchMapMarker[] = [];
  infoContent = signal<Branch | null>(null);

  constructor(
    private branchService: BranchService,
    private router: Router,
  ) {
      effect(
        () => {
          const data = this.branchService.getBranches();
          this.branches.set(data);
          this.markers = this.getMarkers();
        },
        { allowSignalWrites: true }
      );
    }

  getMarkers() {
    if (typeof google !== 'undefined') {
      return this.branches()
        .map((branch) => {
          const marker: BranchMapMarker = {
            label: '',
            position: { lat: branch.lat, lng: branch.lng },
            title: branch.firma,
            options: { animation: google.maps.Animation.DROP },
            branch: branch,
          };
          return marker;
        })
        .filter(
          (marker) => !isNaN(marker.position.lat) && !isNaN(marker.position.lng)
        );
    } else {
      console.error('Google is not defined');
      return [];
    }
  }

  openInfoWindow(branch: Branch, marker: MapMarker): void {
    this.infoContent.set(branch);
    
    if (this.infoWindow) {
      this.infoWindow.open(marker);
    } else {
      console.error('InfoWindow is undefined');
    }
  }
}
