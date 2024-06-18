import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class BranchService {
  private dataUrl = 'http://localhost:3000'; // URL of the JSON server
  private _branches = signal<any[]>([]);

  constructor(private http: HttpClient) {
    this.fetchData();
  }

  private fetchData(): void {
    this.http
      .get<any[]>(`${this.dataUrl}/branches`)
      .pipe(catchError(this.handleError))
      .subscribe((data) => {
        const validatedData = data.map((branch) => ({
          ...branch,
          lat: parseFloat(branch.lat),
          lng: parseFloat(branch.lng),
        }));
        this._branches.set(validatedData);
      });
  }

  getBranches() {
    return this._branches;
  }

  getBranchById(id: number) {
    return this._branches().find((branch) => +branch.id === id) || null;
  }

  updateBranch(updatedBranch: any): Observable<any> {
    const index = this._branches().findIndex(
      (branch) => branch.id === updatedBranch.id
    );
    if (index > -1) {
      const updatedBranches = [...this._branches()];
      updatedBranches[index] = updatedBranch;
      this._branches.set(updatedBranches);
      return this.http
        .patch<any>(
          `${this.dataUrl}/branches/${updatedBranch.id}`,
          updatedBranch
        )
        .pipe(catchError(this.handleError));
    } else {
      throw new Error('Branch not found');
    }
  }

  addBranch(newBranch: any): Observable<any> {
    const updatedBranches = [...this._branches(), newBranch];
    this._branches.set(updatedBranches);
    return this.http
      .post<any>(`${this.dataUrl}/branches`, newBranch)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    console.error('An error occurred:', error);
    return throwError(
      () => new Error('Something bad happened; please try again later.')
    );
  }
}
