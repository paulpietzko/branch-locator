import { Component, signal, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BranchService } from '../services/branch-service/branch.service';

@Component({
  selector: 'app-edit',
  standalone: true,
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    RouterModule,
  ],
  providers: [BranchService],
})
export class EditComponent {
  branchId = signal<number | null>(null);
  branch = computed(() => {
    const id = this.branchId();
    return id !== null ? this.branchService.getBranchById(id) : null;
  });
  branchForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private branchService: BranchService,
    private router: Router
  ) {
    this.branchForm = this.fb.group({
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
      opening_hours: ['', Validators.required],
    });

    effect(() => {
      const branch = this.branch();
      if (branch) {
        this.branchForm.patchValue(branch);
        this.branchForm.markAllAsTouched();
      }
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id !== null) {
        this.branchId.set(+id);
      } else {
        console.error('Invalid branch ID');
        this.router.navigate(['/filialen']);
      }
    });
  }

  onSubmit(): void {
    if (this.branchForm.valid) {
      const updatedBranch = { ...this.branch(), ...this.branchForm.value };
      this.branchService.updateBranch(updatedBranch).subscribe(() => {
        this.router.navigate(['/filialen']);
      });
    }
  }
}
