import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Branch } from '../models';

@Injectable({
  providedIn: 'root',
})
export class BranchService {
  private dataUrl = 'http://localhost:5172';
  private branchesSignal = signal<Branch[]>([]);

  constructor(private http: HttpClient) {
    this.fetchBranches();
  }

  private fetchBranches() {
    this.http.get<Branch[]>(`${this.dataUrl}/api/Branches`).subscribe({
      next: (validatedData) => {
        this.branchesSignal.set(validatedData);
      },
      error: (error) => {
        console.error(error);
        this.branchesSignal.set([]);
      },
    });
  }

  getBranches() {
    return this.branchesSignal();
  }

  getBranchById(id: string): Branch | null {
    return this.branchesSignal().find((branch) => branch.id === id) || null;
  }

  deleteBranch(id: string) {
    this.http.delete<void>(`${this.dataUrl}/api/Branches/${id}`).subscribe({
      next: () => {
        this.fetchBranches();
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  updateBranch(id: string, branchData: FormData) {
    this.http
      .put<Branch>(`${this.dataUrl}/api/Branches/${id}`, branchData)
      .subscribe({
        next: () => {
          this.fetchBranches();
        },
        error: (error) => {
          console.error(error);
        },
      });
  }

  addBranch(branchData: FormData) {
    this.http
      .post<Branch>(`${this.dataUrl}/api/Branches`, branchData)
      .subscribe({
        next: () => {
          this.fetchBranches();
        },
        error: (error) => {
          console.error(error);
        },
      });
  }
}
