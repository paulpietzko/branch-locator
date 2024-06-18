import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BranchService } from '../services/branch-service/branch.service';

@Component({
  selector: 'app-add',
  standalone: true,
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss'],
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
export class AddComponent {
  branchForm: FormGroup;

  constructor(private branchService: BranchService, private router: Router) {
    this.branchForm = this.branchService.createBranchForm();
  }

  onSubmit(): void {
    if (this.branchForm.valid) {
      const newBranch = { ...this.branchForm.value, id: Date.now() }; // Creates unique ID
      this.branchService.addBranch(newBranch).subscribe(() => {
        this.router.navigate(['/filialen']);
      });
    }
  }
}
