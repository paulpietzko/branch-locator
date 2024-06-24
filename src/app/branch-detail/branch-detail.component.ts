import {
  Component,
  signal,
  computed,
  ViewChild,
  PLATFORM_ID,
  Inject,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import {
  GoogleMapsModule,
  MapMarker,
  MapInfoWindow,
} from '@angular/google-maps';
import { BranchService } from '../services/branch.service';
import { Branch } from '../models';
import { TranslateModule } from '@ngx-translate/core';
import * as QRCode from 'qrcode';

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

  qrCodeUrl: string = '';
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

  generateQRCode(): void {
    const currentUrl = window.location.href;
    QRCode.toDataURL(currentUrl, { errorCorrectionLevel: 'H' }, (err, url) => {
      if (err) {
        console.error('Error generating QR Code: ', err);
        return;
      }
      this.qrCodeUrl = url;
    });
  }

  constructor(
    private branchService: BranchService,
    private route: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.generateQRCode();
    }

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
