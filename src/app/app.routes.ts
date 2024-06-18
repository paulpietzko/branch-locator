import { Routes } from '@angular/router';

import { BranchesComponent } from './branches/branches.component';
import { DetailComponent } from './detail/detail.component';
import { EditComponent } from './edit/edit.component';
import { MapComponent } from './map/map.component';
import { AddComponent } from './add/add.component';

export const routes: Routes = [
  { path: '', redirectTo: '/filialen', pathMatch: 'full' },
  { path: 'filialen', component: BranchesComponent },
  { path: 'karte', component: MapComponent },
  { path: 'filialen/detail/:id', component: DetailComponent },
  { path: 'filialen/edit/:id', component: EditComponent },
  { path: 'filialen/karte', component: MapComponent },
  { path: 'filialen/add', component: AddComponent },
];
