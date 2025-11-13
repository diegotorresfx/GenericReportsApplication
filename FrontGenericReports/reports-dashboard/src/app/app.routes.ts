import { Routes } from '@angular/router';
import { ReportsTabsComponent } from './features/reports/pages/reports-tabs/reports-tabs.component';
import { ReportRunTabsComponent } from './features/reports/pages/report-run-tabs/report-run-tabs.component';

export const routes: Routes = [
  { path: '', redirectTo: 'reports', pathMatch: 'full' },
  { path: 'reports', component: ReportsTabsComponent },
  { path: 'reports/run', component: ReportRunTabsComponent },
  { path: '**', redirectTo: 'reports' }
];
