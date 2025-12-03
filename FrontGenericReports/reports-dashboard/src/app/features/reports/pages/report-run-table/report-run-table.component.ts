// src/app/features/reports/pages/report-run-table/report-run-table.component.ts
import {
  Component, OnInit, ViewChild, Input, OnChanges, SimpleChanges, AfterViewInit, ChangeDetectorRef
} from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormsModule, FormGroup } from '@angular/forms';
import { NgIf, NgFor, NgClass, JsonPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';

import { ReportRunService } from '../../services/report-run.service';
import { ReportRunResponse } from '@app/shared/models/report-run.model';
import { ReportDefinition } from '@app/shared/models/report.model';

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-report-run-table',
  standalone: true,
  imports: [
    NgIf, NgFor, NgClass, JsonPipe,
    FormsModule, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatSelectModule,
    MatTableModule, MatPaginatorModule, MatSortModule, MatSnackBarModule, TranslateModule
  ],
  templateUrl: './report-run-table.component.html',
  styleUrls: ['./report-run-table.component.scss']
})
export class ReportRunTableComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() report: ReportDefinition | null = null;
  @Input() paramsJson: string = '{}';
  timeoutSeconds = 600;

  loading = false;
  columns: string[] = [];
  displayedColumns: string[] = [];
  ds = new MatTableDataSource<any>([]);
  response: ReportRunResponse | null = null;
  selectedSetIndex = 0;

  globalFilter = '';
  columnFilters: Record<string, string> = {};

  form!: FormGroup;

  @ViewChild(MatPaginator) set matPaginator(p: MatPaginator) {
    this.paginator = p;
    this.attachTableHelpers();
  }
  @ViewChild(MatSort) set matSort(s: MatSort) {
    this.sort = s;
    this.attachTableHelpers();
  }
  private paginator!: MatPaginator;
  private sort!: MatSort;

  constructor(
    private fb: FormBuilder,
    private runner: ReportRunService,
    private snack: MatSnackBar,
    private cdr: ChangeDetectorRef,
  ) {
    this.form = this.fb.group({
      storedProcedure: [{ value: '', disabled: true }, Validators.required],
      connectionString: [{ value: '', disabled: true }, Validators.required],
    });
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.attachTableHelpers();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['report'] && this.report) {
      this.form.patchValue({
        storedProcedure: this.report.storedProcedure || '',
        connectionString: this.report.connectionString || ''
      }, { emitEvent: false });
    }
  }

  private attachTableHelpers() {
    Promise.resolve().then(() => {
      if (this.ds) {
        if (this.paginator) this.ds.paginator = this.paginator;
        if (this.sort) this.ds.sort = this.sort;
      }
    });
    this.attachFilterPredicate();
  }

  private attachFilterPredicate() {
    this.ds.filterPredicate = (row: any, filter: string) => {
      const filters: {
        __global?: string;
        cols?: Record<string, string>;
      } = JSON.parse(filter || '{}');

      if (filters?.cols) {
        for (const key of Object.keys(filters.cols)) {
          const needle = (filters.cols[key] || '').trim().toLowerCase();
          if (!needle) continue;
          const hay = String(row?.[key] ?? '').toLowerCase();
          if (!hay.includes(needle)) return false;
        }
      }

      if (filters?.__global) {
        const g = filters.__global.trim().toLowerCase();
        if (g) {
          const all = JSON.stringify(row).toLowerCase();
          if (!all.includes(g)) return false;
        }
      }

      return true;
    };

    this.applyFilters();
  }

  private applyFilters() {
    const filterPayload = {
      __global: this.globalFilter,
      cols: this.columnFilters
    };
    this.ds.filter = JSON.stringify(filterPayload);
    if (this.ds.paginator) this.ds.paginator.firstPage();
  }

  applyGlobalFilter(val: string) {
    this.globalFilter = (val ?? '').trim().toLowerCase();
    this.applyFilters();
  }

  applyColumnFilter(col: string, val: string) {
    this.columnFilters[col] = (val ?? '').trim().toLowerCase();
    this.applyFilters();
  }

  clearAllFilters() {
    this.globalFilter = '';
    this.columnFilters = {};
    this.applyFilters();
  }

  pickResultSet(index: number) {
    this.selectedSetIndex = index;
    this.bindTableFromResponse();
  }

  executeUsingCurrentJson() {
    if (!this.report) return;
    const paramsObj = this.parseParamsFromJson();
    this.executeWithReport(this.report, paramsObj);
  }

  executeWithReport(rep: ReportDefinition, paramsFromParent: Record<string, any>) {
    this.form.patchValue({
      storedProcedure: rep.storedProcedure || '',
      connectionString: rep.connectionString || ''
    }, { emitEvent: false });

    const parameters = (paramsFromParent && typeof paramsFromParent === 'object')
      ? paramsFromParent
      : {};

    const dto = {
      storedProcedure: rep.storedProcedure,
      connectionString: rep.connectionString,
      parameters,
      timeoutSeconds: this.timeoutSeconds || 600
    };

    this.loading = true;
    this.runner.execute(dto).subscribe({
      next: (res) => {
        this.response = res;
        this.selectedSetIndex = 0;
        this.bindTableFromResponse();
        const count = res?.resultSets?.[0]?.length ?? 0;
        this.snack.open(`Ejecutado: ${res.storedProcedure} (${count} filas en RS1)`, 'OK', { duration: 2500 });
      },
      error: (err) => {
        console.error('ReportRun execute error:', err?.error ?? err);
        const msg = err?.error?.detail || err?.message || 'Error al ejecutar';
        this.snack.open(msg, 'Cerrar', { duration: 3500 });
      },
      complete: () => this.loading = false
    });
  }

  private parseParamsFromJson(): Record<string, any> {
    const raw = String(this.paramsJson ?? '').trim();
    if (!raw) return {};
    try {
      const parsed = JSON.parse(raw);
      return (parsed && typeof parsed === 'object') ? parsed : {};
    } catch {
      this.snack.open('JSON de parámetros inválido. Genera de nuevo.', 'Cerrar', { duration: 3000 });
      return {};
    }
  }

  private bindTableFromResponse() {
    const rows = this.response?.resultSets?.[this.selectedSetIndex] ?? [];
    const colSet = new Set<string>();
    rows.forEach(r => Object.keys(r || {}).forEach(k => colSet.add(k)));
    this.columns = Array.from(colSet);
    this.displayedColumns = [...this.columns];

    this.ds = new MatTableDataSource<any>(rows);
    this.attachTableHelpers();
    this.applyFilters();

    this.cdr.detectChanges();
    this.attachTableHelpers();

    if (this.paginator) {
      this.paginator.pageSize = 30;
      this.paginator.firstPage();
    }
  }

  private getCurrentPageData(): any[] {
    const all = this.ds.filteredData || [];
    if (!this.paginator) return all;
    const start = this.paginator.pageIndex * this.paginator.pageSize;
    const end = start + this.paginator.pageSize;
    return all.slice(start, end);
  }

  exportExcel(allFiltered: boolean) {
    const rows = allFiltered ? (this.ds.filteredData || []) : this.getCurrentPageData();
    if (!rows.length) {
      this.snack.open('No hay datos para exportar', 'Cerrar', { duration: 2500 });
      return;
    }
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    const filename = `report_${Date.now()}.xlsx`;
    XLSX.writeFile(wb, filename);
  }

  exportPdf(allFiltered: boolean) {
    const rows = allFiltered ? (this.ds.filteredData || []) : this.getCurrentPageData();
    if (!rows.length) {
      this.snack.open('No hay datos para exportar', 'Cerrar', { duration: 2500 });
      return;
    }
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const head = [this.columns];
    const body = rows.map(r => this.columns.map(c => String(r?.[c] ?? '')));

    autoTable(doc, {
      head,
      body,
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [41, 128, 185] },
      theme: 'grid',
      margin: { top: 30, left: 20, right: 20, bottom: 20 }
    });

    doc.save(`report_${Date.now()}.pdf`);
  }

  private getAllDataFromCurrentSet(): any[] {
    return this.response?.resultSets?.[this.selectedSetIndex] ?? [];
  }

  private getFilteredData(): any[] {
    return this.ds?.filteredData ?? [];
  }

  exportExcelAll() {
    const rows = this.getAllDataFromCurrentSet();
    if (!rows.length) { this.snack.open('No hay datos para exportar', 'Cerrar', { duration: 2500 }); return; }
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    XLSX.writeFile(wb, `report_all_${Date.now()}.xlsx`);
  }

  exportExcelFiltered() {
    const rows = this.getFilteredData();
    if (!rows.length) { this.snack.open('No hay datos filtrados para exportar', 'Cerrar', { duration: 2500 }); return; }
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    XLSX.writeFile(wb, `report_filtered_${Date.now()}.xlsx`);
  }

  exportPdfAll() {
    const rows = this.getAllDataFromCurrentSet();
    if (!rows.length) { this.snack.open('No hay datos para exportar', 'Cerrar', { duration: 2500 }); return; }
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const head = [this.columns];
    const body = rows.map(r => this.columns.map(c => String(r?.[c] ?? '')));
    autoTable(doc, { head, body, styles: { fontSize: 8, cellPadding: 3 }, headStyles: { fillColor: [41,128,185] }, theme: 'grid', margin: { top: 30, left: 20, right: 20, bottom: 20 } });
    doc.save(`report_all_${Date.now()}.pdf`);
  }

  exportPdfFiltered() {
    const rows = this.getFilteredData();
    if (!rows.length) { this.snack.open('No hay datos filtrados para exportar', 'Cerrar', { duration: 2500 }); return; }
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const head = [this.columns];
    const body = rows.map(r => this.columns.map(c => String(r?.[c] ?? '')));
    autoTable(doc, { head, body, styles: { fontSize: 8, cellPadding: 3 }, headStyles: { fillColor: [41,128,185] }, theme: 'grid', margin: { top: 30, left: 20, right: 20, bottom: 20 } });
    doc.save(`report_filtered_${Date.now()}.pdf`);
  }

}
