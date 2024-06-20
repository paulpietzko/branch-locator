import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Branch } from '../../models';

@Injectable({
  providedIn: 'root',
})
export class BranchService {
  private dataUrl = ''; // Empty string to leverage proxy configuration
  private _branches = signal<Branch[]>([]);

  constructor(private http: HttpClient) {
    this.fetchData();
  }

  private fetchData(): void {
    this.http
      .get<Branch[]>(`${this.dataUrl}/api/Branches`)
      .pipe(catchError(this.handleError))
      .subscribe((data) => {
        const validatedData = data.map((branch) => ({
          ...branch,
          lat: branch.lat,
          lng: branch.lng,
        }));
        this._branches.set(validatedData);
      });
  }

  getBranches() {
    return this._branches();
  }

  getBranchById(id: string) {
    return this._branches().find((branch) => branch.id === id) || null;
  }

  updateBranch(updatedBranch: Branch): Observable<Branch> {
    const index = this._branches().findIndex(
      (branch) => branch.id === updatedBranch.id
    );
    if (index > -1) {
      const updatedBranches = [...this._branches()];
      updatedBranches[index] = updatedBranch;
      this._branches.set(updatedBranches);
      return this.http
        .patch<Branch>(
          `${this.dataUrl}/api/Branches/${updatedBranch.id}`,
          updatedBranch
        )
        .pipe(catchError(this.handleError));
    } else {
      throw new Error('Branch not found');
    }
  }

  addBranch(newBranch: Branch): Observable<Branch> {
    const updatedBranches = [...this._branches(), newBranch];
    this._branches.set(updatedBranches);
    return this.http
      .post<Branch>(`${this.dataUrl}/api/Branches`, newBranch)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    console.error('An error occurred:', error);
    return throwError(
      () => new Error('Something bad happened; please try again later.')
    );
  }
}
