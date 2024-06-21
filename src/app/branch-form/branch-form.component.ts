import { Component, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BranchService } from '../services/branch-service/branch.service';

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

  constructor(
    private branchService: BranchService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.branchForm = this.createBranchForm();

    effect(() => {
      const branch = this.branch();
      if (branch) {
        this.branchForm.patchValue(branch);
        this.branchForm.markAllAsTouched();
      }
    });

    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id !== null) {
        this.branchId.set(id);
      }
    });
  }

  createBranchForm(): FormGroup {
    return this.fb.group({
      firma: ['', Validators.required],
      kanton: ['', Validators.required],
      phone: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\d{3}\s\d{3}\s\d{2}\s\d{2}$/),
        ],
      ],
      plz: ['', Validators.required],
      ort: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      website: [
        '',
        [
          Validators.required,
          Validators.pattern(/https?:\/\/[^\s$.?#].[^\s]*/),
        ],
      ],
      openingHours: ['', Validators.required],
      lat: [null, Validators.required],
      lng: [null, Validators.required],
      imageUrl: [''],  // Add imageUrl control
    });
  }

  onSubmit(): void {
    if (this.branchForm.valid) {
      const branchData = { ...this.branchForm.value };

      if (this.isEditMode()) {
        const updatedBranch = { ...this.branch(), ...branchData };
        console.log('Submitting updated branch:', updatedBranch);
        this.branchService.updateBranch(updatedBranch);
      } else {
        const newBranch = { ...branchData, id: Date.now().toString() };
        console.log('Submitting new branch:', newBranch);
        this.branchService.addBranch(newBranch);
      }

      this.snackBar.open('Aktion erfolgreich!', 'Schliessen', {
        duration: 5000,
      });
    }
  }
}
