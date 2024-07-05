// #region Imports

import { Component, ViewChild, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  GoogleMapsModule,
  MapInfoWindow,
  MapMarker,
} from '@angular/google-maps';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { BranchService } from '../services/branch.service';
import { Branch, BranchMapMarker } from '../models';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';

// #endregion

@Component({
  selector: 'app-branches-map',
  standalone: true,
  imports: [
    CommonModule,
    GoogleMapsModule,
    RouterModule,
    MatButtonModule,
    TranslateModule,
  ],
  providers: [BranchService],
  templateUrl: './branches-map.component.html',
  styleUrls: ['./branches-map.component.scss'],
})
export class BranchesMapComponent {
  @ViewChild(MapInfoWindow) infoWindow: MapInfoWindow | undefined;

  branches = signal<Branch[]>([]);
  mapCenter: google.maps.LatLngLiteral = { lat: 46.8182, lng: 8.2275 }; // mapCenter of Switzerland
  zoom = 8;
  markers: BranchMapMarker[] = [];
  selectedBranch = signal<Branch | null>(null); // Signal for currently selected branch


  // #region Constructor

  constructor(
    private branchService: BranchService,
    private router: Router,
    private titleService: Title
  ) {
    this.titleService.setTitle(`Branches Map`);
    this.loadBranchData();
  }

  // #endregion

  // #region Data Loading

  private loadBranchData(): void {
    effect(
      () => {
        const data = this.branchService.getBranches();
        this.branches.set(data);
        this.markers = this.getMarkers();
      },
      { allowSignalWrites: true }
    );
  }

  private getMarkers(): BranchMapMarker[] {
    if (typeof google !== 'undefined') {
      return this.branches()
        .map((branch) => ({
          label: '',
          position: { lat: branch.lat, lng: branch.lng },
          title: branch.name,
          options: { animation: google.maps.Animation.DROP },
          branch: branch,
        }))
        .filter(
          (marker) => !isNaN(marker.position.lat) && !isNaN(marker.position.lng) // Filters markers with invalid positions
        );
    } else {
      console.error('Google is not defined');
      return [];
    }
  }

  // #endregion

  // #region Info Window

  openInfoWindow(branch: Branch, marker: MapMarker): void {
    this.selectedBranch.set(branch); // Set the selected branch

    if (this.infoWindow) {
      this.infoWindow.open(marker);
    } else {
      console.error('InfoWindow is undefined');
    }
  }

  // #endregion
}
