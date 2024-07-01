import {
  Component,
  signal,
  computed,
  effect,
  Inject,
  ViewChild,
  ElementRef,
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
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BranchService } from '../services/branch.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Branch } from '../models';
import { MatDialogModule } from '@angular/material/dialog';

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
  ],
  providers: [BranchService],
})
export class BranchFormComponent {
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
  branchForm: FormGroup;
  selectedFile: File | null = null;
  uploadSuccess: boolean = false;
  uploadError: boolean = false;

  constructor(
    private branchService: BranchService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private translate: TranslateService,
    public dialogRef: MatDialogRef<BranchFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Branch
  ) {
    this.branchForm = this.createBranchForm();

    if (data && data.id) {
      this.branchId.set(data.id);
    }

    effect(
      () => {
        const branch = this.branch();
        if (branch) {
          this.branchForm.patchValue(branch);
          if (branch.imagePath) {
            this.uploadSuccess = true;
            this.imagePreview.set(branch.imagePath);
            this.imageName.set(this.getFileNameFromPath(branch.imagePath));
            this.calculateImageSize(branch.imagePath)
              .then((size) => this.fileSize.set(size))
              .catch(() => this.fileSize.set(0));
          }
        }
      },
      { allowSignalWrites: true }
    );
  }

  getFileNameFromPath(imagePath: string | undefined): string {
    return imagePath
      ? imagePath.split(/[/\\]/).pop()?.slice(37) || ''
      : 'No Image Path';
  }

  createBranchForm(): FormGroup {
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
    if (!this.branch()?.id) return;

    if (this.isEditMode() && this.branch()) {
      this.branchService.deleteImage(this.branch())?.subscribe(() => {
        this.selectedFile = null;
        this.imageName.set('');
        this.fileSize.set(0);
        this.imagePreview.set('');
        this.uploadSuccess = false;
        this.uploadError = false;
        this.uploadProgress.set(0);
        this.snackBar.open('Image deleted successfully', 'Close', {
          duration: 3000,
          panelClass: 'success',
        });
      });
    } else {
      this.selectedFile = null;
      this.imageName.set('');
      this.fileSize.set(0);
      this.imagePreview.set('');
      this.uploadSuccess = false;
      this.uploadError = false;
      this.uploadProgress.set(0);
    }
  }

  onSubmit(): void {
    if (this.branchForm.valid) {
      const branchData = this.branchForm.value;
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

      this.translate
        .get(['branchForm.ACTION_SUCCESS', 'actions.CLOSE'])
        .subscribe((translations) => {
          this.snackBar.open(
            translations['branchForm.ACTION_SUCCESS'],
            translations['actions.CLOSE'],
            {
              duration: 5000,
            }
          );
        });

      this.dialogRef.close();
    }
  }
}
