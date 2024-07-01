import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Branch } from '../models';

@Injectable({
  providedIn: 'root',
})
export class BranchService {
  private dataUrl = 'https://localhost:7089';
  private branchesSignal = signal<Branch[]>([]);
  private imageToDelete: string | null = null;

  constructor(private http: HttpClient) {
    this.fetchBranches();
  }

  fetchBranches() {
    this.http.get<Branch[]>(`${this.dataUrl}/api/Branches`).subscribe({
      next: (validatedData) => {
        const updatedData = validatedData.map((branch) => {
          if (branch.imagePath) {
            branch.imagePath = `https://localhost:7089/${branch.imagePath}`;
          }
          return branch;
        });
        this.branchesSignal.set(updatedData);
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

  markImageForDeletion(branch: Branch | null) {
    if (!branch) return;
    this.imageToDelete = branch.imagePath?.substring(30) ?? null;
  }

  confirmImageDeletion(branchId: string) {
    if (this.imageToDelete) {
      return this.http.delete<void>(
        `${this.dataUrl}/api/Branches/${branchId}/image?imagePath=images%5C%5C${this.imageToDelete}`
      );
    }
    return null;
  }

  updateBranch(id: string, branchData: FormData) {
    if (this.imageToDelete) {
      this.confirmImageDeletion(id)?.subscribe({
        next: () => {
          this.imageToDelete = null;
          this.updateBranchData(id, branchData);
        },
        error: (error) => {
          console.error(error);
        },
      });
    } else {
      this.updateBranchData(id, branchData);
    }
  }

  private updateBranchData(id: string, branchData: FormData) {
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
