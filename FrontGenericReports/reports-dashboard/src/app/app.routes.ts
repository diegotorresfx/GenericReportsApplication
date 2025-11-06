import { Routes } from '@angular/router';
import { ReportsTabsComponent } from './features/reports/pages/reports-tabs/reports-tabs.component';

export const routes: Routes = [
  { path: '', redirectTo: 'reports', pathMatch: 'full' },
  { path: 'reports', component: ReportsTabsComponent },
  { path: '**', redirectTo: 'reports' }
];
