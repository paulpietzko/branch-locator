// #region Imports

import {
  Component,
  signal,
  computed,
  effect,
  Inject,
  ViewChild,
  ElementRef,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_FORM_FIELD_DEFAULT_OPTIONS,
  MatFormFieldModule,
} from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BranchService } from '../services/branch.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Branch } from '../models';
import { MatDialogModule } from '@angular/material/dialog';
import { GoogleMapsModule } from '@angular/google-maps';
import { SubSink } from 'subsink';

// #endregion

@Component({
  selector: 'app-branch-form',
  standalone: true,
  templateUrl: './branch-form.component.html',
  styleUrls: ['./branch-form.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    RouterModule,
    MatSnackBarModule,
    TranslateModule,
    MatIconModule,
    MatDialogModule,
    GoogleMapsModule,
  ],
  providers: [BranchService],
})
export class BRANCH_FORMComponent implements OnDestroy {
  private subs = new SubSink();
  imageName = signal('');
  fileSize = signal(0);
  uploadProgress = signal(0);
  imagePreview = signal('');
  @ViewChild('fileInput') fileInput: ElementRef | undefined;
  faUpload = 'upload';
  branchId = signal<string | null>(null);
  isEditMode = computed(() => this.branchId() !== null);
  branch = computed(() => {
    const id = this.branchId();
    return id !== null ? this.branchService.getBranchById(id) : null;
  });
  BRANCH_FORM: FormGroup;
  selectedFile: File | null = null;
  uploadSuccess: boolean = false;
  uploadError: boolean = false;
  mapCenter: google.maps.LatLngLiteral = { lat: 46.8182, lng: 8.2275 }; // Center of Switzerland
  zoom = 8;

  // #region Constructor and Lifecycle Methods

  constructor(
    private branchService: BranchService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private translate: TranslateService,
    public dialogRef: MatDialogRef<BRANCH_FORMComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Branch
  ) {
    this.BRANCH_FORM = this.createBRANCH_FORM();

    if (data && data.id) {
      this.branchId.set(data.id);
    }

    effect(
      () => {
        const branch = this.branch();
        if (branch) {
          this.BRANCH_FORM.patchValue(branch);
          if (branch.imagePath) {
            this.uploadSuccess = true;
            this.imagePreview.set(branch.imagePath);
            this.imageName.set(this.getFileNameFromPath(branch.imagePath));
            this.calculateImageSize(branch.imagePath)
              .then((size) => this.fileSize.set(size))
              .catch(() => this.fileSize.set(0));
          }
          this.mapCenter = { lat: branch.lat, lng: branch.lng };
        }
      },
      { allowSignalWrites: true }
    );
  }

  // #endregion

  // #region Form Methods

  createBRANCH_FORM(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      canton: ['', Validators.required],
      phone: ['', [Validators.required]],
      postCode: ['', Validators.required],
      location: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      website: ['', [Validators.required]],
      openingHours: ['', Validators.required],
      lat: [null, Validators.required],
      lng: [null, Validators.required],
      image: [null],
    });
  }

  onMapClick(event: google.maps.MapMouseEvent): void {
    if (event.latLng) {
      this.mapCenter = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      };
      this.BRANCH_FORM.patchValue({
        lat: this.mapCenter.lat,
        lng: this.mapCenter.lng,
      });
    }
  }

  onSubmit(): void {
    if (this.BRANCH_FORM.valid) {
      const branchData = this.BRANCH_FORM.value;
      const formData = new FormData();

      for (const key in branchData) {
        if (branchData.hasOwnProperty(key)) {
          formData.append(key, branchData[key]);
        }
      }

      if (this.selectedFile) {
        formData.append('image', this.selectedFile);
      }

      if (this.isEditMode()) {
        const updatedBranch = { ...this.branch(), ...branchData };
        this.branchService.updateBranch(updatedBranch.id, formData);
      } else {
        this.branchService.addBranch(formData);
      }

      this.subs.add(
        this.translate
          .get(['BRANCH_FORM.ACTION_SUCCESS', 'ACTIONS.CLOSE'])
          .subscribe((translations) => {
            this.snackBar.open(
              translations['BRANCH_FORM.ACTION_SUCCESS'],
              translations['ACTIONS.CLOSE'],
              {
                duration: 5000,
              }
            );
          })
      );

      this.dialogRef.close();
    }
  }

  // #endregion

  // #region File Handling Methods

  getFileNameFromPath(imagePath: string | undefined): string {
    return imagePath
      ? imagePath.split(/[/\\]/).pop()?.slice(37) || ''
      : 'No Image Path';
  }

  onFileChange(event: any): void {
    const file = event.target.files[0] as File | null;
    this.uploadFile(file);
  }

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files[0] as File | null;
    this.uploadFile(file);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  uploadFile(file: File | null): void {
    if (file && file.type.startsWith('image/')) {
      this.selectedFile = file;
      this.fileSize.set(Math.round(file.size / 1024)); // File size in KB
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview.set(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      this.uploadSuccess = true;
      this.uploadError = false;
      this.imageName.set(file.name);
    } else {
      this.uploadSuccess = false;
      this.uploadError = true;
      this.snackBar.open('Only image files are supported!', 'Close', {
        duration: 3000,
        panelClass: 'error',
      });
    }
  }

  calculateImageSize(url: string): Promise<number> {
    return new Promise((resolve, reject) => {
      fetch(url)
        .then((response) => {
          const contentLength = response.headers.get('Content-Length');
          if (contentLength) {
            const sizeInKb = Math.round(parseInt(contentLength, 10) / 1024);
            resolve(sizeInKb);
          } else {
            reject(new Error('Content-Length header is missing'));
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  removeImage(): void {
    if (this.isEditMode() && this.branch()) {
      this.branchService.markImageForDeletion(this.branch());
    }

    this.selectedFile = null;
    this.imageName.set('');
    this.fileSize.set(0);
    this.imagePreview.set('');
    this.uploadSuccess = false;
    this.uploadError = false;
    this.uploadProgress.set(0);
  }

  // #endregion

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
