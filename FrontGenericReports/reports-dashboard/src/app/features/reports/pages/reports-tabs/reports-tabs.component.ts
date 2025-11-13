import { Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ReportsAdminComponent } from '../reports-admin/reports-admin.component';
import { ReportsListComponent } from '../reports-list/reports-list.component';
import { NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
@Component({
  selector: 'app-reports-tabs',
  standalone: true,
  imports: [ MatTabsModule, MatCardModule, MatIconModule, ReportsAdminComponent, ReportsListComponent, TranslateModule],
  templateUrl: './reports-tabs.component.html',
  styleUrls: ['./reports-tabs.component.scss']
})
export class ReportsTabsComponent {}
