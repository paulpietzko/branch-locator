import { Component, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BranchService } from '../services/branch.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

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
  isEditMode = computed(() => this.branchId() !== null);  // Computed property to determine if it's edit or add mode
  branch = computed(() => {
    const id = this.branchId();
    return id !== null ? this.branchService.getBranchById(id) : null; // Fetch branch data if ID is available
  });
  branchForm: FormGroup;

  constructor(
    private branchService: BranchService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private translate: TranslateService
  ) {
    this.branchForm = this.createBranchForm();

    // Populates form fields when branch data is available
    effect(() => {
      const branch = this.branch();
      if (branch) {
        this.branchForm.patchValue(branch);
        this.branchForm.markAllAsTouched();
      }
    });

    // Subscribe to route parameters to get the branch ID
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id !== null) {
        this.branchId.set(id);
      }
    });
  }

  // Create form group with validation rules
  createBranchForm(): FormGroup {
    return this.fb.group({
      firma: ['', Validators.required],
      kanton: ['', Validators.required],
      phone: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\d{3}\s\d{3}\s\d{2}\s\d{2}$/),// Pattern for phone number: 123 456 78 90
        ],
      ],
      plz: ['', Validators.required],
      ort: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      website: [
        '',
        [
          Validators.required,
          Validators.pattern(/https?:\/\/[^\s$.?#].[^\s]*/), // Pattern for URL: https://www.
        ],
      ],
      openingHours: ['', Validators.required],
      lat: [null, Validators.required],
      lng: [null, Validators.required],
      imageUrl: [''],
    });
  }

  onSubmit(): void {
    if (this.branchForm.valid) {
      const branchData = { ...this.branchForm.value }; // Get values from fom data

      if (this.isEditMode()) {
        const updatedBranch = { ...this.branch(), ...branchData }; // Merge existing and new data
        this.branchService.updateBranch(updatedBranch);
      } else {
        const newBranch = { ...branchData};
        this.branchService.addBranch(newBranch);
      }

      // Shows snackbar with translations
      this.translate.get(['branchForm.ACTION_SUCCESS', 'branchForm.CLOSE']).subscribe(translations => {
        this.snackBar.open(translations['branchForm.ACTION_SUCCESS'], translations['branchForm.CLOSE'], {
          duration: 5000,
        });
      });
    }
  }
}
