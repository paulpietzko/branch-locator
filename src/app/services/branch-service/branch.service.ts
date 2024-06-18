import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BranchService {
  private dataUrl = 'http://localhost:3000'; // URL des JSON-Servers
  private _branches = signal<any[]>([]);

  constructor(private http: HttpClient) {
    this.fetchData();
  }

  private fetchData(): void {
    this.http.get<any[]>(`${this.dataUrl}/branches`).subscribe(data => {
      this._branches.set(data);
    });
  }

  getBranches() {
    return this._branches;
  }

  getBranchById(id: number) {
    return this._branches().find(branch => branch.id === id) || null;
  }

  updateBranch(updatedBranch: any): Observable<any> {
    const index = this._branches().findIndex(branch => branch.id === updatedBranch.id);
    if (index > -1) {
      const updatedBranches = [...this._branches()];
      updatedBranches[index] = updatedBranch;
      this._branches.set(updatedBranches);
      return this.http.patch<any>(`${this.dataUrl}/branches/${updatedBranch.id}`, updatedBranch).pipe(
        catchError(error => {
          console.error('Update failed', error);
          throw error;
        })
      );
    } else {
      throw new Error('Branch not found');
    }
  }  

  addBranch(newBranch: any): Observable<any> {
    const updatedBranches = [...this._branches(), newBranch];
    this._branches.set(updatedBranches);
    return this.http.post<any>(`${this.dataUrl}/branches`, newBranch).pipe(
      catchError(error => {
        console.error('Add failed', error);
        throw error;
      })
    );
  }
}
