import { Component, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleMapsModule } from '@angular/google-maps';
import { RouterModule } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { BranchService } from '../services/branch-service/branch.service';
import { Branch, BranchMapMarker } from '../models';

@Component({
  selector: 'app-branches-map',
  standalone: true,
  imports: [CommonModule, GoogleMapsModule, RouterModule],
  providers: [BranchService],
  templateUrl: './branches-map.component.html',
  styleUrl: './branches-map.component.scss',
})
export class BranchesMapComponent {
  branches = signal<Branch[]>([]);
  center: google.maps.LatLngLiteral = { lat: 46.8182, lng: 8.2275 }; // Center of Switzerland
  zoom = 8;
  markers: BranchMapMarker[] = []; // TODO: ensure type of marker
  infoContent = signal<Branch | null>(null);

  constructor(
    private branchService: BranchService,
    private router: Router,
    private snackBar: MatSnackBar
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
    return this.branches()
      .map((branch) => {
        const marker: BranchMapMarker = {
          label: 'TODO:', // TODO:
          position: { lat: branch.lat, lng: branch.lng },
          title: branch.firma,
          options: { animation: google.maps.Animation.DROP },
          click: () => this.showInfoWindow(branch),
        };
        return marker;
      })
      .filter(
        (marker) => !isNaN(marker.position.lat) && !isNaN(marker.position.lng)
      );
  }

  // TODO: use MapInfoWindow according to https://github.com/angular/components/blob/main/src/google-maps/map-info-window/README.md
  showInfoWindow(branch: Branch): void {
    const snackBarRef = this.snackBar.open(branch.firma, 'Details anzeigen', {
      duration: 5000,
    });

    snackBarRef.onAction().subscribe(() => {
      this.router.navigate(['/filialen/detail', branch.id]);
    });

    this.infoContent.set(branch);
  }
}
