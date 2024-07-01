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
import { Title } from '@angular/platform-browser';
import { BranchFormComponent } from '../branch-form/branch-form.component';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';

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
    MatIconModule
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
      this.titleService.setTitle(`${branchData.name} - Branch Details`);
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

  editBranch() {
    const id = this.branchId();
    const dialogRef = this.dialog.open(BranchFormComponent, {
      width: '1000px',
      data: { id },
    });

    dialogRef.afterClosed().subscribe(() => {
      this.branchService.fetchBranches();
    });
  }

  constructor(
    private titleService: Title,
    private branchService: BranchService,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private translate: TranslateService,
    public dialog: MatDialog,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
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

  deleteBranch(): void {
    const id = this.branchId();
    if (!id) return;

    this.branchService.deleteBranch(id);

    this.translate
      .get(['branchDetail.DELETE_SUCCESS', 'actions.CLOSE'])
      .subscribe((translations) => {
        this.snackBar.open(
          translations['branchDetail.DELETE_SUCCESS'],
          translations['actions.CLOSE'],
          {
            duration: 5000,
          }

        );
      });
      
      this.router.navigate(['/filialen']);
  }
}