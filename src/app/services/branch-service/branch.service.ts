import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class BranchService {
  private dataUrl = 'assets/data/branches.json';
  private _branches = signal<any[]>([]);

  constructor(private http: HttpClient, private fb: FormBuilder) {
    this.fetchData();
  }

  private fetchData(): void {
    this.http.get<any[]>(this.dataUrl).subscribe(data => {
      this._branches.set(data);
    });
  }

  get branches() {
    return this._branches;
  }

  getBranchById(id: number) {
    return this._branches().find(branch => branch.id === id);
  }

  updateBranch(updatedBranch: any): Observable<any> {
    const index = this._branches().findIndex(branch => branch.id === updatedBranch.id);
    if (index > -1) {
      const updatedBranches = [...this._branches()];
      updatedBranches[index] = updatedBranch;
      this._branches.set(updatedBranches);
      return this.http.put<any>(`${this.dataUrl}/${updatedBranch.id}`, updatedBranch);
    } else {
      throw new Error('Branch not found');
    }
  }

  addBranch(newBranch: any): Observable<any> {
    const updatedBranches = [...this._branches(), newBranch];
    this._branches.set(updatedBranches);
    // POST-Query to server
    return this.http.post<any>(this.dataUrl, newBranch);
  }

  // Form Validator
  createBranchForm(): FormGroup {
    return this.fb.group({
      firma: ['', Validators.required],
      kanton: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^\d{3}\s\d{3}\s\d{2}\s\d{2}$/)]],
      plz: ['', Validators.required],
      ort: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      website: ['', [Validators.required, Validators.pattern(/https?:\/\/[^\s$.?#].[^\s]*/)]],
      opening_hours: ['', Validators.required],
    });
  }
}
