import { Injectable, signal, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BranchService {
  private dataUrl = 'assets/data/branches.json';
  private _branches = signal<any[]>([]);

  constructor(private http: HttpClient) {
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
}
