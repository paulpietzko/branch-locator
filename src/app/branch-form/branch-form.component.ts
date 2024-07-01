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
    MatFormFieldModule 
  ],
  providers: [BranchService],
})
export class BranchFormComponent {
  imageName = signal('');
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

    effect(() => {
      const branch = this.branch();
      if (branch) {
        this.branchForm.patchValue(branch);
        if (branch.imagePath) {
          this.uploadSuccess = true;
          Promise.resolve().then(() => // Delays execution to avoid effect-related issues.
            this.getFileNameFromPath(branch.imagePath)
          );
        }
      }
    });
  }

  getFileNameFromPath(imagePath: string | undefined) {
    this.imageName.set(
      imagePath
        ? imagePath.split(/[/\\]/).pop()?.slice(37) || ''
        : 'No Image Path'
    );
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
    if (file) {
      this.selectedFile = file;
      this.uploadSuccess = true;
      this.uploadError = false;
      this.snackBar.open('File uploaded successfully!', 'Close', {
        duration: 3000,
        panelClass: 'success',
      });
      this.imageName.set(file.name);
    } else {
      this.uploadSuccess = false;
      this.uploadError = true;
      this.snackBar.open('Failed to upload file!', 'Close', {
        duration: 3000,
        panelClass: 'error',
      });
    }
  }

  triggerFileInput(): void {
    this.fileInput?.nativeElement.click();
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
