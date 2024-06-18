import { Component, signal, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleMapsModule } from '@angular/google-maps';
import { RouterModule } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { BranchService } from '../services/branch-service/branch.service';

@Component({
  selector: 'app-branches-map',
  standalone: true,
  imports: [CommonModule, GoogleMapsModule, RouterModule],
  providers: [BranchService],
  templateUrl: './branches-map.component.html',
  styleUrl: './branches-map.component.scss',
})
export class BranchesMapComponent {
  branches = signal<any[]>([]);
  center: google.maps.LatLngLiteral = { lat: 46.8182, lng: 8.2275 }; // Center of Switzerland
  zoom = 8;
  markers: any[] = [];
  infoContent = signal<any | null>(null);

  private branchService = inject(BranchService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  constructor() {
    effect(
      () => {
        const data = this.branchService.getBranches()();
        this.branches.set(data);
        this.updateMarkers();
      },
      { allowSignalWrites: true }
    );
  }

  updateMarkers(): void {
    this.markers = this.branches().map((branch) => ({
      position: { lat: branch.lat, lng: branch.lng },
      title: branch.firma,
      options: { animation: google.maps.Animation.DROP },
      click: () => this.showInfoWindow(branch),
    }));
  }

  showInfoWindow(branch: any): void {
    const snackBarRef = this.snackBar.open(branch.firma, 'Details anzeigen', {
      duration: 5000,
    });

    snackBarRef.onAction().subscribe(() => {
      this.router.navigate(['/filialen/detail', branch.id]);
    });

    this.infoContent.set(branch);
  }
}
