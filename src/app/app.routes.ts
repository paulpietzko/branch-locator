import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/filialen', pathMatch: 'full' },
  {
    path: 'filialen',
    loadComponent: () => import('./branches-table/branches-table.component').then(m => m.BranchesTableComponent)
  },
  {
    path: 'filialen/detail/:id',
    loadComponent: () => import('./branch-detail/branch-detail.component').then(m => m.BranchDetailComponent)
  },
  {
    path: 'filialen/karte',
    loadComponent: () => import('./branches-map/branches-map.component').then(m => m.BranchesMapComponent)
  },
  {
    path: 'filialen/charts',
    loadComponent: () => import('./branches-charts/branches-charts.component').then(m => m.BranchesChartsComponent)
  },
];
