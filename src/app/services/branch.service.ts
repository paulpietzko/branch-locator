import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Branch } from '../models';

@Injectable({
  providedIn: 'root',
})
export class BranchService {
  private dataUrl = 'https://localhost:7089';
  private branchesSignal = signal<Branch[]>([]);

  constructor(private http: HttpClient) {
    this.fetchBranches();
  }

  fetchBranches() {
    this.http.get<Branch[]>(`${this.dataUrl}/api/Branches`).subscribe({
      next: (validatedData) => {
        const updatedData = validatedData.map(branch => {
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

  deleteImage(branch: Branch | null) {
    if(!branch) return;

    console.log(`img path ${branch.imagePath?.substring(30, branch.imagePath.length)}`)

    console.log(`${this.dataUrl}/api/Branches/${branch.id}/image?imagePath=${branch.imagePath?.substring(30, branch.imagePath.length)}`)
    return this.http.delete<void>(`${this.dataUrl}/api/Branches/${branch.id}/image?imagePath=images%5C%5C${branch.imagePath?.substring(30, branch.imagePath.length)}`);
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
  // https://localhost:7089/api/Branches/b1dd3308-9006-459b-59f7-08dc97461acb/image?imagePath=20256571-49e1-4db8-a0da-936a88933ef7-id.nike.jpeg
  // https://localhost:7089/api/Branches/b1dd3308-9006-459b-59f7-08dc97461acb/image?imagePath=images%5C%5C20256571-49e1-4db8-a0da-936a88933ef7-id.nike.jpeg


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
