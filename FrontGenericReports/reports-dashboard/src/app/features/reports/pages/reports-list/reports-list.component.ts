import { Component, OnInit, ViewChild } from '@angular/core';
import { ReportsListService } from '../../services/reports-list.service';
import { ReportDefinition } from '../../../../shared/models/report.model';
import { NgIf, DatePipe, NgClass } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-reports-list',
  standalone: true,
  imports: [
    NgIf, DatePipe, NgClass, 
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatTableModule, MatPaginatorModule, MatSortModule, MatIconModule, MatProgressSpinnerModule
  ],
  templateUrl: './reports-list.component.html',
  styleUrls: ['./reports-list.component.scss']
})
export class ReportsListComponent implements OnInit {
  displayedColumns = ['id','name','storedProcedure','enabled','createdAtUtc'];
  dataSource = new MatTableDataSource<ReportDefinition>([]);
  loading = false;
  filterValue = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private svc: ReportsListService) {}

  ngOnInit(): void {
    this.load();
  }

  applyFilter(value: string) {
    this.filterValue = value.trim().toLowerCase();
    this.dataSource.filter = this.filterValue;
  }

  private load() {
    this.loading = true;
    this.svc.getAll().subscribe({
      next: data => {
        this.dataSource = new MatTableDataSource<ReportDefinition>(data ?? []);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.dataSource.filterPredicate = (row, filter) =>
          (row.name?.toLowerCase().includes(filter) || row.storedProcedure?.toLowerCase().includes(filter));
      },
      error: _ => { this.dataSource = new MatTableDataSource<ReportDefinition>([]); },
      complete: () => this.loading = false
    });
  }
}
