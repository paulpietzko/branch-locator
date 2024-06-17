import { Component, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BranchService } from '../services/branch-service/branch.service';
import { CommonModule, Location } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { GoogleMapsModule } from '@angular/google-maps';

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    RouterModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    GoogleMapsModule,
  ],
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
  providers: [BranchService],
})
export class DetailComponent implements OnInit {
  branchId = signal<number | null>(null);
  branch = computed(() => {
    const id = this.branchId();
    if (id !== null) {
      return this.branchService.getBranchById(id);
    }
    return null;
  });

  mapCenter = { lat: 0, lng: 0 };

  constructor(
    private route: ActivatedRoute,
    private branchService: BranchService,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id !== null) {
        this.branchId.set(+id);
        const branch = this.branchService.getBranchById(+id);
        if (branch) {
          this.mapCenter = { lat: branch.lat, lng: branch.lng };
        }
      } else {
        console.error('Invalid branch ID');
      }
    });
  }
}
