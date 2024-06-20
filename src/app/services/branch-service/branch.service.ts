import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Branch } from '../../models';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BranchService {
  private dataUrl = ''; // Empty string to leverage proxy configuration
  private _branches = signal<Branch[]>([]);
  private _error = signal<string | null>(null);

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

  updateBranch(updatedBranch: Branch): void {
    console.log('Updating branch with payload:', updatedBranch);
    this.http
      .patch<Branch>(
        `${this.dataUrl}/api/Branches/${updatedBranch.id}`,
        updatedBranch
      )
      .pipe(catchError(this.handleError))
      .subscribe(
        (response) => {
          const branches = this._branches().map((branch) =>
            branch.id === response.id ? response : branch
          );
          this._branches.set(branches);
        },
        (error) => {
          this._error.set(error.message);
          console.error('Update branch error:', error);
        }
      );
  }

  addBranch(newBranch: Branch): void {
    console.log('Adding new branch with payload:', newBranch);
    this.http
      .post<Branch>(`${this.dataUrl}/api/Branches`, newBranch)
      .pipe(catchError(this.handleError))
      .subscribe(
        (response) => {
          this._branches.set([...this._branches(), response]);
        },
        (error: HttpErrorResponse) => {
          this._error.set(error.message);
          console.error('Add branch error:', error);
          console.error('Error details:', error.error);
        }
      );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('An error occurred:', error);
    return throwError(
      () => new Error('Something bad happened; please try again later.')
    );
  }
}
