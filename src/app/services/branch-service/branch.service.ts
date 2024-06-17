import { Injectable, signal, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class BranchService {
  private dataUrl = 'assets/data/branches.json';
  private branches = signal<any[]>([]);

  constructor(private http: HttpClient) {
    this.fetchData();
  }

  private fetchData() {
    this.http.get<any[]>(this.dataUrl).subscribe(data => {
      this.branches.set(data);
    });
  }

  getBranches() {
    return this.branches;
  }

  getBranchById(id: number) {
    return this.branches().find(branch => branch.id === id);
  }
}
