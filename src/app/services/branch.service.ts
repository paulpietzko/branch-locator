import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Branch } from '../models';
import { catchError } from 'rxjs/operators';
import { lastValueFrom, throwError } from 'rxjs';
import { SelectControlValueAccessor } from '@angular/forms';

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

  private async fetchData(): Promise<void> {
    try {
      const data = await lastValueFrom( // lastValueFrom  converts Observable to Promise for async/await usage
        this.http.get<Branch[]>(`${this.dataUrl}/api/Branches`).pipe(
          catchError(this.handleError)
        )
      );
      const validatedData = data.map((branch) => ({
        ...branch,
        lat: branch.lat,
        lng: branch.lng,
        imageUrl: branch.imageUrl || '',
      }));
      this._branches.set(validatedData);
    } catch (error) {
      this._error.set(error instanceof Error ? error.message : 'Unknown error');
    }
  }

  getBranches(): Branch[] {
    return this._branches();
  }

  getBranchById(id: string): Branch | null {
    return this._branches().find((branch) => branch.id === id) || null;
  }

  async deleteBranch(id: string): Promise<void> {
    try {
      await lastValueFrom(
        this.http.delete(`${this.dataUrl}/api/Branches/${id}`).pipe(
          catchError(this.handleError)
        )
      );
      const updatedBranches = this._branches().filter((branch) => branch.id !== id);
      this._branches.set(updatedBranches);
    } catch (error) {
      this._error.set(error instanceof Error ? error.message : 'Unknown error');
    }
  }

  async updateBranch(updatedBranch: Branch): Promise<void> {
    try {
      const response = await lastValueFrom(
        this.http.put<Branch>(`${this.dataUrl}/api/Branches/${updatedBranch.id}`, updatedBranch).pipe(
          catchError(this.handleError)
        )
      );
      const branches = this._branches().map((branch) =>
        branch.id === response.id ? response : branch
      );
      this._branches.set(branches);
    } catch (error) {
      this._error.set(error instanceof Error ? error.message : 'Unknown error');
    }
  }
  
  async addBranch(newBranch: Branch): Promise<void> {
    try {
      const response = await lastValueFrom(
        this.http.post<Branch>(`${this.dataUrl}/api/Branches`, newBranch).pipe(
          catchError(this.handleError)
        )
      );
      this._branches.set([...this._branches(), response]);
    } catch (error) {
      this._error.set(error instanceof Error ? error.message : 'Unknown error');
    }
  }

  private handleError(error: HttpErrorResponse): ReturnType<typeof throwError> {
    this._error.set(error.message);
    return throwError(
      () => new Error('Something bad happened; please try again later.')
    );
  }
}
