import { Component, signal, computed, effect, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BranchService } from '../services/branch.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'; // Added MAT_DIALOG_DATA import
import { Branch } from '../models';

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
  ],
  providers: [BranchService],
})
export class BranchFormComponent {
  branchId = signal<string | null>(null);
  isEditMode = computed(() => this.branchId() !== null);
  branch = computed(() => {
    const id = this.branchId();
    return id !== null ? this.branchService.getBranchById(id) : null;
  });
  branchForm: FormGroup;
  selectedFile: File | null = null;

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
      }
    });
  }

  createBranchForm(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      canton: ['', Validators.required],
      phone: [
        '',
        [
          Validators.required,
          // Validators.pattern(/^\d{3}\s\d{3}\s\d{2}\s\d{2}$/),
        ],
      ],
      postCode: ['', Validators.required],
      location: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      website: [
        '',
        [
          Validators.required,
          // Validators.pattern(/https?:\/\/[^\s$.?#].[^\s]*/),
        ],
      ],
      openingHours: ['', Validators.required],
      lat: [null, Validators.required],
      lng: [null, Validators.required],
      image: [null]
    });
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
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

      this.translate.get(['branchForm.ACTION_SUCCESS', 'branchForm.CLOSE']).subscribe((translations) => {
        this.snackBar.open(translations['branchForm.ACTION_SUCCESS'], translations['branchForm.CLOSE'], {
          duration: 5000,
        });
      });
      
      this.dialogRef.close();
    }
  }
}