import { Component, signal, inject, effect } from '@angular/core';
import { BranchService } from '../services/branch-service/branch.service';
import { CommonModule } from '@angular/common';
import { GoogleMapsModule } from '@angular/google-maps';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule, GoogleMapsModule, HttpClientModule, RouterModule],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  providers: [BranchService],
})
export class MapComponent {
  branches = signal<any[]>([]);
  center: google.maps.LatLngLiteral = { lat: 46.8182, lng: 8.2275 }; // Center of Switzerland
  zoom = 8;
  markers: any[] = [];
  infoContent = signal<any | null>(null);
  selectedBranchId: string | null = null;

  private branchService = inject(BranchService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  constructor() {
    effect(
      () => {
        const data = this.branchService.branches();
        this.branches.set(data);
        this.updateMarkers();
      },
      { allowSignalWrites: true }
    );
  }

  updateMarkers(): void {
    this.markers = this.branches().map((branch) => ({
      position: {
        lat: branch.lat,
        lng: branch.lng,
      },
      title: branch.firma,
      options: { animation: google.maps.Animation.DROP },
      click: () => this.showInfoWindow(branch),
      branch: branch,
    }));
  }

  showInfoWindow(branch: any): void {
    const snackBarRef: MatSnackBarRef<any> = this.snackBar.open(
      branch.firma,
      'Details anzeigen',
      {
        duration: 5000,
      }
    );

    snackBarRef.onAction().subscribe(() => {
      this.router.navigate(['/filialen/detail', branch.id]);
    });

    this.infoContent.set(branch);
    this.selectedBranchId = branch.id;
  }
}
