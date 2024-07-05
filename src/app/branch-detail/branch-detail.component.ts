// #region Imports

import {
  Component,
  signal,
  computed,
  ViewChild,
  PLATFORM_ID,
  Inject,
  OnInit,
  OnDestroy,
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
import { BRANCH_FORMComponent } from '../branch-form/branch-form.component';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { SubSink } from 'subsink';

// #endregion

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
    MatIconModule,
  ],
  providers: [BranchService],
  templateUrl: './branch-detail.component.html',
  styleUrls: ['./branch-detail.component.scss'],
})
export class BRANCH_DETAILComponent implements OnInit, OnDestroy {
  @ViewChild(MapInfoWindow) infoWindow: MapInfoWindow | undefined;
  private subs = new SubSink();

  // #region Constructor and Lifecycle Methods

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
    this.subs.add(
      this.route.paramMap.subscribe((params) => {
        const id = params.get('id');
        if (id !== null) {
          this.branchId.set(id);
        } else {
          console.error('Invalid branch ID');
        }
      })
    );
  }

  // #endregion

  qrCodeUrl: string = '';
  infoContent = signal<Branch | null>(null); // info Window content
  branchId = signal<string | null>(null); // branch ID from route params
  branch = computed<Branch | null>(() => {
    const id = this.branchId(); // Current branch ID
    const branchData = id ? this.branchService.getBranchById(id) : null;
    if (branchData) {
      this.mapCenter = { lat: branchData.lat, lng: branchData.lng }; // Set map center to branch location
      this.titleService.setTitle(`${branchData.name} - Branch Details`);
      return branchData;
    } else return null;
  });
  mapCenter = { lat: 0, lng: 0 }; // Initial center of the map

  // #region openInfoWindow Method

  openInfoWindow(marker: MapMarker): void {
    this.infoContent.set(this.branch());

    if (this.infoWindow) {
      this.infoWindow.open(marker);
    } else {
      console.error('InfoWindow is undefined');
    }
  }

  // #endregion

  // #region QR Code Methods

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

  // #endregion

  // #region Branch Actions

  editBranch() {
    const id = this.branchId();
    const dialogRef = this.dialog.open(BRANCH_FORMComponent, {
      width: '1000px',
      data: { id },
    });

    this.subs.add(
      dialogRef.afterClosed().subscribe(() => {
        this.branchService.fetchBranches();
      })
    );
  }

  deleteBranch(): void {
    const id = this.branchId();
    if (!id) return;

    this.branchService.deleteBranch(id);

    this.subs.add(
      this.translate
        .get(['INFO.DELETE_SUCCESS', 'ACTIONS.CLOSE'])
        .subscribe((translations) => {
          this.snackBar.open(
            translations['INFO.DELETE_SUCCESS'],
            translations['ACTIONS.CLOSE'],
            {
              duration: 5000,
            }
          );
        })
    );

    this.router.navigate(['/filialen']);
  }

  // #endregion

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
