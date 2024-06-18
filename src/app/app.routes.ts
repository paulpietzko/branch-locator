import { Routes } from '@angular/router';

import { BranchFormComponent } from './branch-form/branch-form.component';
import { BranchesTableComponent } from './branches-table/branches-table.component';
import { BranchDetailComponent } from './branch-detail/branch-detail.component';
import { BranchesMapComponent } from './branches-map/branches-map.component';

export const routes: Routes = [
  { path: '', redirectTo: '/filialen', pathMatch: 'full' },
  { path: 'filialen', component: BranchesTableComponent },
  { path: 'filialen/detail/:id', component: BranchDetailComponent },
  { path: 'filialen/edit/:id', component: BranchFormComponent },
  { path: 'filialen/karte', component: BranchesMapComponent },
  { path: 'filialen/add', component: BranchFormComponent },
];
