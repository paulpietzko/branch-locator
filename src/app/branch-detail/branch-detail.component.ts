import {
  Component,
  signal,
  computed,
  ViewChild,
  PLATFORM_ID,
  Inject,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import {
  GoogleMapsModule,
  MapMarker,
  MapInfoWindow,
} from '@angular/google-maps';
import { BranchService } from '../services/branch.service';
import { Branch } from '../models';
import * as QRCode from 'qrcode';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-branch-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    GoogleMapsModule,
    TranslateModule,
    MatSnackBarModule,
  ],
  providers: [BranchService],
  templateUrl: './branch-detail.component.html',
  styleUrls: ['./branch-detail.component.scss'],
})
export class BranchDetailComponent {
  @ViewChild(MapInfoWindow) infoWindow: MapInfoWindow | undefined;

  qrCodeUrl: string = '';
  infoContent = signal<Branch | null>(null); // Signal to hold branch info for info window
  branchId = signal<string | null>(null); // Signal to hold branch ID from route params
  branch = computed<Branch | null>(() => {
    const id = this.branchId(); // Current branch ID
    const branchData = id ? this.branchService.getBranchById(id) : null;
    if (branchData) {
      this.mapCenter = { lat: branchData.lat, lng: branchData.lng }; // Set map center to branch location
      return branchData;
    } else {
      return null;
    }
  });
  mapCenter = { lat: 0, lng: 0 }; // Initial center of the map

  openInfoWindow(marker: MapMarker): void {
    this.infoContent.set(this.branch());

    if (this.infoWindow) {
      this.infoWindow.open(marker);
    } else {
      console.error('InfoWindow is undefined');
    }
  }

  generateQRCode(): void {
    const currentUrl = window.location.href; // Get the current URL
    QRCode.toDataURL(currentUrl, { errorCorrectionLevel: 'H' }, (err, url) => {
      if (err) {
        console.error('Error generating QR Code: ', err);
        return;
      }
      this.qrCodeUrl = url; // Set the generated QR code URL
    });
  }

  constructor(
    private branchService: BranchService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private translate: TranslateService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.generateQRCode();
    }

    // Subscribe to route params for branch ID
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id !== null) {
        this.branchId.set(id);
      } else {
        console.error('Invalid branch ID');
      }
    });
  }

  async deleteBranch(): Promise<void> {
    const id = this.branchId();
    if (id) {
      try {
        await this.branchService.deleteBranch(id);
        this.translate.get(['branchDetail.DELETE_SUCCESS', 'branchDetail.CLOSE']).subscribe(translations => {
          this.snackBar.open(translations['branchDetail.DELETE_SUCCESS'], translations['branchDetail.CLOSE'], {
            duration: 5000,
          });
        });
        this.router.navigate(['/']); // Navigate back to the list after deletion
      } catch (error) {
        console.error('Error deleting branch:', error);
        this.translate.get(['branchDetail.DELETE_ERROR', 'branchDetail.CLOSE']).subscribe(translations => {
          this.snackBar.open(translations['branchDetail.DELETE_ERROR'], translations['branchDetail.CLOSE'], {
            duration: 5000,
          });
        });
      }
    } else {
      console.error('No branch ID to delete');
    }
  }
}
