import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BranchService } from '../services/branch-service/branch.service';
import { CommonModule, Location } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { GoogleMapsModule } from '@angular/google-maps';
import { MapComponent } from "../map/map.component";

@Component({
    selector: 'app-detail',
    standalone: true,
    templateUrl: './detail.component.html',
    styleUrls: ['./detail.component.scss'],
    providers: [BranchService,],
    imports: [
        CommonModule,
        RouterModule,
        MatTableModule,
        MatIconModule,
        MatButtonModule,
        GoogleMapsModule,
        MapComponent
    ]
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

  private branchService = inject(BranchService);
  private route = inject(ActivatedRoute);
  private location = inject(Location);

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
